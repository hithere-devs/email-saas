// import { db } from "@/server/db";

import { Account } from "@/lib/account";

// await db.user.create({
//   data: {
//     emailAddress: "azhar@gmail.com",
//     firstName: "Azhar",
//     lastName: "Ali",
//   },
// });

// console.log("done");

const account = new Account("SbhL1uQl83nv-VabQAfiv96b-1t3PhqCWdhi6CLB9vc");

account.syncEmails();
