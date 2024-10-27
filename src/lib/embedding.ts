import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

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

// console.log((await getEmbeddings("Hello, world!")).length);
