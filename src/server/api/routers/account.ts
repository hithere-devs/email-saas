import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

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
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
    });
  }),

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
});
