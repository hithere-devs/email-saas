import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

/**
 * Generates embeddings for the provided text using OpenAI's text-embedding-ada-002 model.
 *
 * @param text - The input text to generate embeddings for. Newlines will be replaced with spaces.
 * @returns Promise<number[]> - A promise that resolves to an array of embedding numbers representing the text.
 *
 * @throws {Error} - Throws any errors that occur during the embedding creation process or API call.
 *
 */
export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("Error in getEmbeddings:", error);
    throw error;
  }
}
