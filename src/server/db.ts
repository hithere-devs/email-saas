import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  prisma.$use(async (params, next) => {
    // Check incoming query type
      if (params.action == 'delete') {
        // Delete queries
        // Change action to an update
        params.action = 'update'
        params.args['data'] = { deleted: new Date()}
      }
      if (params.action == 'deleteMany') {
        // Delete many queries
        params.action = 'updateMany'
        if (params.args.data != undefined) {
          params.args.data['deleted'] = new Date()
        } else {
          params.args['data'] = { deleted: new Date() }
        }
      }
      if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'findUnique'){
        console.log( 'Param.args ========',  params.args)
        if (params.args.where != undefined) {
          params.args.where['deleted'] = null
        } else {
          params.args['where'] = { deleted: null }
        }
        console.log( 'Param.args ========',  params.args)
      }
    return next(params)
  })

  return prisma;
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
