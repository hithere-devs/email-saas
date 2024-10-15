// /api/aurinko/callback

import { exchangeCodeForToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";
import { log } from "@/lib/logger";

const { NEXT_PUBLIC_URL } = process.env;

export const GET = async (req: NextRequest) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const params = req.nextUrl.searchParams;

  const status = params.get("status");
  if (status !== "success") {
    return NextResponse.json(
      { message: "Authorization failed" },
      { status: 400 },
    );
  }

  // get the auth code from params
  const code = params.get("code");
  if (!code) {
    return NextResponse.json(
      { message: "Authorization failed, Code Not Found" },
      { status: 400 },
    );
  }

  //   exchange code for token
  const token = await exchangeCodeForToken(code);

  if (!token) {
    return NextResponse.json(
      { message: "Authorization failed, Token Not Found" },
      { status: 400 },
    );
  }

  // get account details
  const accountDetails = await getAccountDetails(token.accessToken);
  if (!accountDetails) {
    return NextResponse.json(
      { message: "Authorization failed, Account Details Not Found" },
      { status: 400 },
    );
  }

  await db.account.upsert({
    where: { id: token.accountId },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId,
      accessToken: token.accessToken,
      userId,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
    },
  });

  // trigger initial sync enpoint syncrounously
  waitUntil(
    axios
      .post(`${NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId,
        userId,
      })
      .then((res) => {
        log.info("Initial Sync Triggered", res.data);
      })
      .catch((err) => {
        log.error("Initial Sync Trigger Failed", err);
      }),
  );

  return NextResponse.redirect(new URL("/mail", req.url));
};
