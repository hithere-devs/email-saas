import { db } from "@/server/db";

await db.user.create({
  data: {
    emailAddress: "azhar@gmail.com",
    firstName: "Azhar",
    lastName: "Ali",
  },
});

console.log("done");
