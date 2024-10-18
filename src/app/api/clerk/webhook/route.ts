// /api/clerk/webhook

import { log } from "@/lib/logger";
import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const resp = await req.json();

  if (resp.type === "user.created") {
    const { data, type } = resp;
    console.log("Clerk Webhook Recieved of Type", type);

    const id = data.id;
    const emailAddress = data.email_addresses[0].email_address;
    const firstName = data.first_name;
    const lastName = data.last_name;
    const imageUrl = data.profile_image_url;

    const exisitingUser = await db.user.findFirst({
      where: { id },
    });

    if (exisitingUser) {
      const message = "User already exists";
      console.log(message);
      return new Response(message, { status: 200 });
    }

    await db.user.create({
      data: {
        id,
        emailAddress,
        firstName,
        lastName,
        imageUrl,
      },
    });
  }

  return new Response("Webhook Recieved", { status: 200 });
};
