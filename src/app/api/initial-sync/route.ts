// /api/initial-sync

import { Account } from "@/lib/account";
import { log } from "@/lib/logger";
import { syncEmailsToDataBase } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();

  if (!userId || !accountId) {
    return NextResponse.json({ error: "Missing One of them" }, { status: 404 });
  }

  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!dbAccount) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const account = new Account(dbAccount.accessToken);

  // perform initial sync
  const response = await account.performInitialSync();

  if (!response) {
    return NextResponse.json({ error: "Initial Sync failed" }, { status: 500 });
  }

  const { emails, deltaToken } = response;

  // update the latest delta token in db
  await db.account.update({
    where: {
      id: accountId,
    },
    data: {
      nextDeltaToken: deltaToken,
    },
  });

  await syncEmailsToDataBase(emails, accountId);

  console.log("Sync Completed", deltaToken);

  return NextResponse.json({ success: true }, { status: 200 });
};
