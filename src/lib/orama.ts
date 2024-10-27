import { db } from "@/server/db";
import { persist, restore } from "@orama/plugin-data-persistence";
import { create, insert, search, type AnyOrama } from "@orama/orama";
import { getEmbeddings } from "./embedding";
// import fs from "fs/promises";

export class OramaClient {
  // @ts-ignore
  private orama: AnyOrama;
  private accountId: number;

  constructor(accountId: number) {
    this.accountId = accountId;
    this.initialize();
  }

  async initialize() {
    const account = await db.account.findUnique({
      where: {
        id: this.accountId,
      },
    });

    if (!account) {
      throw new Error(`Account with not found`);
    }

    if (account.oramaIndex) {
      this.orama = await restore("json", account.oramaIndex as any);
    } else {
      this.orama = await create({
        schema: {
          subject: "string",
          body: "string",
          rawBody: "string",
          from: "string",
          to: "string[]",
          sentAt: "string",
          threadId: "string",
          embeddings: "vector[1536]",
        },
      });
    }

    await this.saveIndex();
  }

  async vectorSearch({ term }: { term: string }) {
    await this.initialize();
    const embeddings = await getEmbeddings(term);
    const results = await search(this.orama, {
      mode: "hybrid",
      term: term,
      vector: {
        value: embeddings,
        property: "embeddings",
      },
      similarity: 0.8,
      limit: 10,
    });
    return results;
  }

  async insert(document: any) {
    await this.initialize();
    await insert(this.orama, document);
    await this.saveIndex();
  }

  async search({ term }: { term: string }) {
    await this.initialize();
    const results = await search(this.orama, { term: term });
    return results;
  }

  async saveIndex() {
    const index = await persist(this.orama, "json");

    await db.account.update({
      where: {
        id: this.accountId,
      },
      data: {
        oramaIndex: index,
      },
    });
  }
}
