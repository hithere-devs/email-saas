// db import
import { db } from "@/server/db";

// orama imports
import { persist, restore } from "@orama/plugin-data-persistence";
import { create, insert, search, type AnyOrama } from "@orama/orama";

// embedding import
import { getEmbeddings } from "@/lib/embedding";

/**
 * OramaClient - Vector Search and Document Management Class
 *
 * Provides vector-based and text search capabilities for email content using Orama search engine.
 * Manages persistence of search indices in PostgreSQL database per account.
 *
 * Features:
 * - Vector search with embeddings for semantic search
 * - Full-text search capabilities
 * - Document indexing and persistence
 * - Per-account index isolation
 *
 * Dependencies:
 * - @orama/orama: Core search functionality
 * - @orama/plugin-data-persistence: Index persistence
 * - OpenAI: Generates embeddings for vector search
 *
 * Schema:
 * - subject: Email subject
 * - body: Processed email body
 * - rawBody: Original email body
 * - from: Sender email
 * - to: Array of recipient emails
 * - sentAt: Email timestamp
 * - threadId: Email thread identifier
 * - embeddings: Vector representation [1536]
 */
export class OramaClient {
  // @ts-ignore
  private orama: AnyOrama;

  // account ID of the user
  private accountId: number;

  constructor(accountId: number) {
    this.accountId = accountId;
    this.initialize();
  }

  /**
   * Initializes or restores an Orama search index for email data.
   *
   * This method performs the following:
   * 1. Retrieves account information from the database
   * 2. If an existing index exists, restores it from the stored JSON
   * 3. If no index exists, creates a new one with a schema for email data including embeddings
   * 4. Saves the index state after initialization
   *
   * @throws {Error} When the account is not found in the database
   * @returns {Promise<void>} A promise that resolves when initialization is complete
   */
  async initialize() {
    // fetch account details from the database
    const account = await db.account.findUnique({
      where: {
        id: this.accountId,
      },
    });

    if (!account) {
      throw new Error(`Account with not found`);
    }

    // restore or create a new index based on the account
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

    // save the index state after initialization
    await this.saveIndex();
  }

  /**
   * Performs a hybrid vector search using both text and embeddings.
   *
   * @param params - The search parameters
   * @param params.term - The search term/query to look for
   * @returns A Promise that resolves to the search results
   *
   * @remarks
   * This method:
   * 1. Ensures the Orama instance is initialized
   * 2. Generates embeddings for the search term
   * 3. Performs a hybrid search using both text matching and vector similarity
   *
   * The search uses:
   * - A similarity threshold of 0.8
   * - A limit of 10 results
   * - The "embeddings" property for vector comparison
   */
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

  /**
   * Inserts a new document into the Orama search index.
   * This method ensures the index is initialized before insertion and saves the index after.
   *
   * @param document - The document to be inserted into the search index
   * @returns Promise<void> - Resolves when document has been inserted and index saved
   * @throws {Error} If initialization or insertion fails
   */
  async insert(document: any) {
    await this.initialize();
    await insert(this.orama, document);
    await this.saveIndex();
  }

  /**
   * Searches the Orama database for records matching the provided search term.
   * @param {Object} params - The search parameters.
   * @param {string} params.term - The search term to query against the database.
   * @returns {Promise<SearchResults>} A promise that resolves to the search results.
   * @throws {Error} If the database has not been initialized.
   */
  async search({ term }: { term: string }) {
    await this.initialize();
    const results = await search(this.orama, { term: term });
    return results;
  }

  /**
   * Persists the current Orama index state to the database.
   * Converts the index to JSON format and updates the associated account record.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the index is successfully saved
   * @throws {Error} If there's an issue persisting the index or updating the database
   */
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
