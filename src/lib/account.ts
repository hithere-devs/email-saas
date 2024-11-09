import {
  EmailAddress,
  EmailMessage,
  SyncResponse,
  SyncUpdatedResponse,
} from "@/types";
import axios, { all } from "axios";
import { log } from "./logger";
import { db } from "@/server/db";
import { syncEmailsToDataBase } from "./sync-to-db";

/**
 * Class representing an email account with synchronization and message sending capabilities.
 * Interacts with the Aurinko.io email API for managing email operations.
 *
 * @class Account
 * @description Handles email synchronization, retrieval of updated emails, and sending new emails.
 * The class maintains state through a token-based authentication system and provides methods for
 * both initial and incremental email synchronization.
 */
export class Account {
  // token recieved from the aurinko api
  private token: string;

  /**
   * Initiates an email synchronization process with the Aurinko API.
   * NOTE - Usually called once when the user first connects their email
   *
   * @remarks
   * This method sends a POST request to start syncing emails from the last 2 days,
   * requesting HTML body format for the messages.
   *
   * @returns A Promise that resolves to a SyncResponse object from the API
   * @throws {AxiosError} When the API request fails
   * @private
   */
  private async startSync() {
    const response = await axios.post<SyncResponse>(
      `https://api.aurinko.io/v1/email/sync`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin: 2,
          bodyType: "html",
        },
      },
    );

    return response.data;
  }

  /**
   * Retrieves updated emails using the Aurinko API's sync endpoint.
   *
   * @param options - The synchronization options
   * @param options.deltaToken - Optional token for delta synchronization
   * @param options.pageToken - Optional token for paginated results
   * @returns {Promise<SyncUpdatedResponse>} A promise that resolves with the sync response containing updated emails
   *
   * @throws {AxiosError} When the API request fails
   */
  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }) {
    let params: Record<string, string> = {};

    if (deltaToken) {
      params.deltaToken = deltaToken;
    }
    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await axios.get<SyncUpdatedResponse>(
      `https://api.aurinko.io/v1/email/sync/updated`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      },
    );

    return response.data;
  }

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Performs the initial synchronization of emails from the email service.
   * This process involves:
   * 1. Starting a sync process and waiting until it's ready
   * 2. Retrieving updated emails using a delta token
   * 3. Paginating through all available email records
   *
   * @throws {AxiosError} When there's an error in the network request
   * @returns {Promise<{emails: EmailMessage[], deltaToken: string} | undefined>} Object containing:
   *   - emails: Array of synchronized email messages
   *   - deltaToken: Token to be used for subsequent delta syncs
   */
  async performInitialSync() {
    try {
      // start the sync process
      let syncResponse = await this.startSync();
      while (!syncResponse.ready) {
        // wait for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        syncResponse = await this.startSync();
      }
      // get the bookmark delta token
      let storedDeltaToken = syncResponse.syncUpdatedToken;

      let updatedResponse = await this.getUpdatedEmails({
        deltaToken: storedDeltaToken,
      });

      if (updatedResponse.nextDeltaToken) {
        // sync has completed
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }

      let allEmails: EmailMessage[] = updatedResponse.records;

      // fetch all pages if there are more
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          // sync has ended
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
      }

      // store the delta token for future syncs
      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      }
      console.error(error);
    }
  }

  /**
   * Synchronizes emails for an account using delta tokens for incremental updates.
   *
   * @description
   * This method performs the following steps:
   * 1. Retrieves account using the access token
   * 2. Fetches updated emails using delta token pagination
   * 3. Stores emails in database
   * 4. Updates the account's delta token for future syncs
   *
   * @throws {Error} When account is not found
   * @throws {Error} When account has not been previously synced (no delta token)
   *
   * @returns {Promise<{
   *   emails: EmailMessage[],
   *   deltaToken: string
   * }>} Object containing synchronized emails and the latest delta token
   */
  async syncEmails() {
    const account = await db.account.findUnique({
      where: {
        accessToken: this.token,
      },
    });

    if (!account) throw new Error("Account not found");

    if (!account.nextDeltaToken)
      throw new Error("Account has not been synced yet");

    let response = await this.getUpdatedEmails({
      deltaToken: account.nextDeltaToken,
    });
    let storedDeltaToken = account.nextDeltaToken;
    let allEmails: EmailMessage[] = response.records;

    if (response.nextDeltaToken) {
      storedDeltaToken = response.nextDeltaToken;
    }

    while (response.nextPageToken) {
      response = await this.getUpdatedEmails({
        pageToken: response.nextPageToken,
      });

      allEmails = allEmails.concat(response.records);

      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }
    }

    try {
      const accId = parseInt(account.id.toString());
      await syncEmailsToDataBase(allEmails, accId);
    } catch (error) {
      console.error("Error during sync: ", error);
    }

    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });

    return {
      emails: allEmails,
      deltaToken: storedDeltaToken,
    };
  }

  /**
   * Sends an email using the Aurinko API
   * @param params - The email parameters
   * @param params.from - The sender's email address
   * @param params.subject - The email subject
   * @param params.body - The email body content
   * @param params.inReplyTo - Optional message ID this email is replying to
   * @param params.references - Optional reference message IDs
   * @param params.to - Array of recipient email addresses
   * @param params.cc - Optional array of CC recipient email addresses
   * @param params.bcc - Optional array of BCC recipient email addresses
   * @param params.replyTo - Optional reply-to email address
   * @param params.threadId - Optional thread ID to associate the email with
   * @returns Promise that resolves to the API response data
   * @throws {AxiosError} When the API request fails
   */
  async sendEmail({
    threadId,
    from,
    subject,
    body,
    inReplyTo,
    references,
    to,
    cc,
    bcc,
    replyTo,
  }: {
    from: EmailAddress;
    subject: string;
    body: string;
    inReplyTo?: string;
    references?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
    threadId?: string;
  }) {
    try {
      const response = await axios.post(
        "https://api.aurinko.io/v1/email/messages",
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          to,
          cc,
          bcc,
          replyTo: [replyTo],
          threadId,
        },
        {
          params: {
            returnIds: true,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
      }
      console.error(error);
    }
  }
}
