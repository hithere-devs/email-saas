"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// lib imports
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID as string,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
    client_reference_id: userId,
  });
  redirect(session.url as string);
}
