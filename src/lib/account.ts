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

export class Account {
  private token: string;
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

      console.log("Initial Sync Has Completed", allEmails.length, " emails");

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
