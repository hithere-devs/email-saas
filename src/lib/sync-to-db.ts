import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

// lib imports
import { OramaClient } from "@/lib/orama";
import { turndown } from "@/lib/turndown";

// types
import { EmailMessage, EmailAddress, EmailAttachment } from "@/types";

/**
 * Synchronizes email messages to the database and Orama search index.
 *
 * @param emails - Array of EmailMessage objects to be synchronized
 * @param accountId - Numeric identifier for the account
 *
 * @remarks
 * This function performs two operations for each email:
 * 1. Saves the email to the database using saveEmails()
 * 2. Indexes the email in Orama search with processed content
 *
 * @throws Will log error to console if synchronization fails
 */
export const syncEmailsToDataBase = async (
  emails: EmailMessage[],
  accountId: number,
) => {
  const orama = new OramaClient(accountId);

  try {
    for (const email of emails) {
      await saveEmails(email, accountId, 0);
      await orama.insert({
        subject: email.subject,
        body: turndown.turndown(email.body as string),
        rawBody: email.bodySnippet || "",
        from: email.from.address,
        to: email.to.map((t) => t.address),
        sentAt: email.sentAt,
        threadId: email.threadId,
      });
    }
  } catch (error) {
    console.error("syncEmailsToDatabase Error - ", error);
  }
};

/**
 * Saves or updates email messages and related data in the database.
 *
 * @param email - The email message to be saved containing all message details including
 *                headers, body, attachments, and recipient information
 * @param accountId - The ID of the account associated with this email
 * @param index - The index position of the email (currently unused)
 *
 * This function performs several operations:
 * 1. Determines email label type (inbox/sent/draft)
 * 2. Upserts all email addresses (from, to, cc, bcc, replyTo)
 * 3. Upserts the email thread with participant information
 * 4. Upserts the email itself with all its properties
 * 5. Updates thread status based on contained emails
 * 6. Upserts any attachments
 *
 * @throws {Prisma.PrismaClientKnownRequestError} When database operations fail
 *
 * @returns {Promise<void>} Returns nothing on completion
 */
async function saveEmails(
  email: EmailMessage,
  accountId: number,
  index: Number,
) {
  try {
    let emailLabelType: "inbox" | "sent" | "draft" = "inbox";

    if (
      email.sysLabels.includes("inbox") ||
      email.sysLabels.includes("important")
    ) {
      emailLabelType = "inbox";
    } else if (email.sysLabels.includes("sent")) {
      emailLabelType = "sent";
    } else if (email.sysLabels.includes("draft")) {
      emailLabelType = "draft";
    }

    const addressesToUpsert = new Map();

    for (const address of [
      email.from,
      ...email.to,
      ...email.bcc,
      ...email.cc,
      ...email.replyTo,
    ]) {
      addressesToUpsert.set(address.address, address);
    }

    const upsertedAddresses: Awaited<ReturnType<typeof upsertEmailAddress>>[] =
      [];

    for (const address of addressesToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId);
      upsertedAddresses.push(upsertedAddress);
    }

    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        .map((address) => [address!.address, address]),
    );

    const fromAddress = addressMap.get(email.from.address);
    if (!fromAddress) {
      console.error("From Address Not Found", email.bodySnippet);
      return;
    }

    const toAddresses = email.to
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);

    const ccAddresses = email.cc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);

    const bccAddresses = email.bcc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);

    const replyToAddresses = email.replyTo
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);

    // 2. Upsert Thread
    const thread = await db.thread.upsert({
      where: { id: email.threadId },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,
        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        lastMessageDate: new Date(email.sentAt),
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
    });

    // 3. Upsert Email
    await db.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        internetHeaders: email.internetHeaders as any,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
        emailLabel: emailLabelType,
      },
      create: {
        id: email.id,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders: email.internetHeaders as any,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
      },
    });

    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: "asc" },
    });

    let threadFolderType = "sent";
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === "inbox") {
        threadFolderType = "inbox";
        break; // If any email is in inbox, the whole thread is in inbox
      } else if (threadEmail.emailLabel === "draft") {
        threadFolderType = "draft"; // Set to draft, but continue checking for inbox
      }
    }
    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      },
    });

    // 4. Upsert Attachments
    for (const attachment of email.attachments) {
      await upsertAttachment(email.id, attachment);
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Prisma error for email ${email.id}: ${error.message}`);
    } else {
      console.error(`Unknown error for email ${email.id}: ${error}`);
    }
  }
}

/**
 * Upserts an email address record in the database for a given account.
 * First attempts to find an existing record, if found returns it, otherwise creates a new one.
 *
 * @param address - The email address object containing address details to upsert
 * @param accountId - The account ID associated with the email address
 *
 * @returns Promise that resolves to the found/created EmailAddress record, or null if operation fails
 *
 * @throws Logs error to console if database operation fails
 */
async function upsertEmailAddress(address: EmailAddress, accountId: number) {
  try {
    const existingAddress = await db.emailAddress.findUnique({
      where: {
        accountId_address: {
          accountId: accountId,
          address: address.address ?? "",
        },
      },
    });

    if (existingAddress) {
      return await db.emailAddress.findUnique({
        where: {
          id: existingAddress.id,
        },
      });
    } else {
      return await db.emailAddress.create({
        data: {
          address: address.address ?? "",
          name: address.name,
          raw: address.raw,
          accountId,
        },
      });
    }
  } catch (error) {
    console.error("Failed To Upser Email Address", error);
    return null;
  }
}

/**
 * Upserts an email attachment record in the database.
 *
 * @param emailId - The ID of the email associated with the attachment
 * @param attachment - The email attachment object containing details like name, type, size etc.
 * @throws Will log error if database operation fails
 *
 * @remarks
 * This function will either:
 * - Update an existing attachment if ID exists
 * - Create a new attachment record if ID doesn't exist
 * The operation is wrapped in error handling that logs failures without throwing.
 */
async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id ?? "" },
      update: {
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
      create: {
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
    });
  } catch (error) {
    console.error(`Failed to upsert attachment for email ${emailId}: ${error}`);
  }
}
