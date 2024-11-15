import { z } from "zod";
import { Prisma } from "@prisma/client";

// server imports
import { db } from "@/server/db";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";

// lib imports
import { Account } from "@/lib/account";
import { OramaClient } from "@/lib/orama";

// types
import { emailAddressSchema } from "@/types";

/**
 * Authorizes and retrieves account information for a given account ID and user ID.
 *
 * @param accountId - The numeric identifier of the account to authorize
 * @param userId - The string identifier of the user requesting access
 * @returns Promise resolving to account information including id, email, access token and name
 * @throws Error if the account is not found or user is not authorized
 */
export const authorizeAccountAccess = async (
  accountId: number,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      accessToken: true,
      name: true,
    },
  });

  if (!account) {
    throw new Error("Account not found");
  }
  return account;
};

export const accountRouter = createTRPCRouter({
  /**
   * Retrieves all email accounts associated with the authenticated user.
   *
   * @remarks
   * This is a private procedure that can only be accessed by authenticated users.
   * It queries the database for all accounts linked to the current user's ID.
   *
   * @returns Promise<Account[]> - A promise that resolves to an array of Account objects
   * belonging to the authenticated user
   *
   * @throws Will throw an error if the user is not authenticated
   */
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
    });
  }),

  /**
   * Retrieves the number of threads for a specific account and tab (inbox/draft/sent).
   *
   * @remarks
   * This is a private procedure that can only be accessed by authenticated users.
   * It validates the user's access to the account before counting threads.
   *
   * @param input - The input parameters
   * @param input.accountId - The ID of the email account to query
   * @param input.tab - The tab to filter threads by ('inbox', 'draft', or 'sent')
   *
   * @returns Promise<number> - A promise that resolves to the count of threads matching the criteria
   *
   * @throws Will throw an error if:
   * - The user is not authenticated
   * - The user doesn't have access to the specified account
   */
  getNumThreads: privateProcedure
    .input(z.object({ accountId: z.number(), tab: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {};

      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "draft") {
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      }

      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filter,
        },
      });
    }),

  /**
   * Retrieves email threads for a specific account filtered by tab and completion status.
   *
   * @remarks
   * This is a private procedure that can only be accessed by authenticated users.
   * It validates the user's access to the account and syncs emails before retrieving threads.
   * Returns up to 15 most recent threads with their associated emails.
   *
   * @param input - The input parameters
   * @param input.accountId - The ID of the email account to query
   * @param input.tab - The tab to filter threads by ('inbox', 'draft', or 'sent')
   * @param input.done - Boolean flag to filter threads by completion status
   *
   * @returns Promise resolving to an array of Thread objects with associated emails.
   * Each thread includes email details like sender, body, subject, labels etc.
   *
   * @throws Will throw an error if:
   * - The user is not authenticated
   * - The user doesn't have access to the specified account
   */
  getThread: privateProcedure
    .input(
      z.object({
        accountId: z.number(),
        tab: z.string(),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.accessToken);
      acc.syncEmails().catch((e) => console.error(e));

      // sidebar filter
      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input.tab === "draft") {
        filter.draftStatus = true;
      } else if (input.tab === "sent") {
        filter.sentStatus = true;
      }

      // inbox/done filter
      filter.done = {
        equals: input.done,
      };

      return await ctx.db.thread.findMany({
        where: {
          accountId: account.id,
          ...filter,
        },
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              id: true,
              sentAt: true,
            },
          },
        },
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
    }),

  /**
   * Retrieves email address suggestions (contacts) for a specific account.
   *
   * @remarks
   * This is a private procedure that can only be accessed by authenticated users.
   * It queries the database for all email addresses associated with the specified account.
   *
   * @param input - The input parameters
   * @param input.accountId - The ID of the email account to query suggestions for
   *
   * @returns Promise<Array<{address: string, name: string}>> - A promise that resolves to an array of
   * email address objects containing the contact's address and name
   *
   * @throws Will throw an error if:
   * - The user is not authenticated
   * - The user doesn't have access to the specified account
   */
  getSuggestions: privateProcedure
    .input(z.object({ accountId: z.number() }))
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: account.id,
        },
        select: {
          address: true,
          name: true,
        },
      });
    }),

  /**
   * Retrieves reply details for composing a response in an email thread.
   *
   * @remarks
   * This is a private procedure that can only be accessed by authenticated users.
   * It finds the most recent external email in the thread and formats the reply details.
   *
   * @param input - The input parameters
   * @param input.accountId - The ID of the email account
   * @param input.threadId - The ID of the thread to get reply details for
   *
   * @returns Promise resolving to an object containing:
   * - to: Array of email addresses to reply to (original sender + recipients excluding current user)
   * - cc: Array of CC addresses from original email (excluding current user)
   * - from: Object containing name and email address of current user
   * - subject: Original email subject
   * - id: Internet Message ID of the original email
   *
   * @throws Will throw an error if:
   * - The user is not authenticated
   * - The user doesn't have access to the specified account
   * - The thread is not found
   * - The thread contains no emails
   * - No external email is found in the thread
   */
  getReplyDetails: privateProcedure
    .input(z.object({ accountId: z.number(), threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
          accountId: account.id,
        },
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              subject: true,
              id: true,
              sentAt: true,
              internetMessageId: true,
            },
          },
        },
      });

      if (!thread || thread.emails.length === 0) {
        throw new Error("Thread not found");
      }

      const lastExrternalEmail = thread.emails
        .reverse()
        .find((e) => e.from.address !== account.emailAddress);

      if (!lastExrternalEmail) {
        throw new Error("No external email found");
      }

      return {
        to: [
          lastExrternalEmail.from,
          ...lastExrternalEmail.to.filter(
            (to) => to.address !== account.emailAddress,
          ),
        ],
        cc: lastExrternalEmail.cc.filter(
          (cc) => cc.address !== account.emailAddress,
        ),
        from: { name: account.name, address: account.emailAddress },
        subject: lastExrternalEmail.subject,
        id: lastExrternalEmail.internetMessageId,
      };
    }),

  /**
   * Sends an email through the specified account with the provided details.
   *
   * @remarks
   * This is a private procedure that can only be accessed by authenticated users.
   * It validates the user's access to the account before sending the email.
   * Supports both new emails and replies to existing threads.
   *
   * @param input - The input parameters for sending an email
   * @param input.accountId - The ID of the email account to send from
   * @param input.body - The HTML body content of the email
   * @param input.subject - The subject line of the email
   * @param input.from - Object containing name and address of the sender
   * @param input.cc - Optional array of CC recipients
   * @param input.bcc - Optional array of BCC recipients
   * @param input.to - Array of primary recipients
   * @param input.replyTo - Email address to set as the reply-to address
   * @param input.inReplyTo - Optional Message-ID of the email being replied to
   * @param input.threadId - Optional ID of the thread this email belongs to
   *
   * @returns Promise<void> - Resolves when the email is successfully sent
   *
   * @throws Will throw an error if:
   * - The user is not authenticated
   * - The user doesn't have access to the specified account
   * - Email sending fails for any reason
   */
  sendEmail: privateProcedure
    .input(
      z.object({
        accountId: z.number(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        to: z.array(emailAddressSchema),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.accessToken);

      await acc.sendEmail({
        body: input.body,
        subject: input.subject,
        from: input.from,
        cc: input.cc,
        bcc: input.bcc,
        to: input.to,
        replyTo: input.replyTo,
        inReplyTo: input.inReplyTo,
        threadId: input.threadId,
      });
    }),

  /**
   * Searches emails within a specific account using the provided search query.
   *
   * @remarks
   * This is a private procedure that can only be accessed by authenticated users.
   * It uses OramaClient for performing the search operation on emails.
   *
   * @param input - The input parameters
   * @param input.accountId - The ID of the email account to search within
   * @param input.query - The search query string to match against emails
   *
   * @returns Promise resolving to search results from OramaClient
   *
   * @throws Will throw an error if:
   * - The user is not authenticated
   * - The user doesn't have access to the specified account
   * - The account is not found
   */
  searchEmails: privateProcedure
    .input(
      z.object({
        accountId: z.number(),
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      if (!account) throw new Error("Account not found");
      const accId = parseInt(account.id.toString());

      const orama = new OramaClient(accId);
      const results = await orama.search({ term: input.query });
      return results;
    }),


    /**
 * Deletes an account from the database based on the provided account ID.
 *
 * This is a private procedure that expects an input object containing a single property:
 * - `accountId`: A bigint representing the ID of the account to delete.
 *
 * The procedure uses the context's database instance to delete the account.
 *
 * @async
 * @function deleteAccount
 * @param {Object} input - The input object for the procedure.
 * @param {bigint} input.accountId - The unique ID of the account to delete.
 * @param {Object} ctx - The context containing the database instance.
 * @param {Object} ctx.db - The database instance used to perform the operation.
 * @returns {Promise<Object>} A promise that resolves with the result of the delete operation.
 * 
 * @throws {Error} If the account ID does not exist or the deletion fails.
 */

  deleteAccount: privateProcedure
  .input(z.object({ accountId: z.bigint() }))
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.account.delete({
      where: {
        id: input.accountId
      }
    })
  }),

  // NOTE - Same APIs can be used for a single single message as by passing the single message id in the messageIds array
  markAsRead: privateProcedure
    .input(
      z.object({
        accountId: z.number(),
        messageIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const acc = new Account(account.accessToken);
      await acc.markAsRead(input.messageIds, false);
    }),

  markAsUnRead: privateProcedure
    .input(
      z.object({
        accountId: z.number(),
        messageIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const acc = new Account(account.accessToken);
      await acc.markAsRead(input.messageIds, true);
    }),
});
