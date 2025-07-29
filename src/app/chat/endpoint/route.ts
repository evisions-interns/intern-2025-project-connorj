import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "@/env";
import { streamText, tool, type Message } from "ai";
import z from "zod";
import { Index } from "@upstash/vector";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

type Metadata = {};

const index = new Index<Metadata>({
  url: env.UPSTASH_VECTOR_REST_URL,
  token: env.UPSTASH_VECTOR_REST_READONLY_TOKEN,
});

export async function POST(request: Request) {
  const { messages } = (await request.json()) as {
    messages: Message[];
  };

  const result = streamText({
    model: openrouter("openai/gpt-4o-mini"),
    messages,
    system:
      "you are a helpful and wise assistant. Use the search tool to look up information. Only respond with information found in the search tool.",
    tools: {
      search: tool({
        description: "search knowledge base",
        parameters: z.object({
          query: z.string(),
        }),
        execute: async (params) => {
          const results = await index.query({
            data: params.query,
            topK: 5,
            includeData: true,
          });

          return results;
        },
      }),

      defineTerm: tool({
        parameters: z.object({
          term: z.string(),
        }),
        execute: async ({ term }) => {
          const glossary: Record<string, string> = {
            meta: "The current state of the competitive environment, including the most popular or strongest strategies.",
            rotation:
              "In Pokémon TCG, the removal of older sets from competitive play.",
            econ: "Short for 'economy' in Valorant. Refers to team money and buying strategies.",
            entry:
              "An entry fragger—first person to enter a site and take duels in Valorant.",
          };

          const lower = term.toLowerCase();
          if (glossary[lower]) {
            return `**${term}**: ${glossary[lower]}`;
          } else {
            return `I couldn’t find a definition for "${term}". Try rephrasing or using a more common keyword.`;
          }
        },
      }),

      showRecommendations: tool({
        parameters: z.object({
          genre: z.string(),
        }),
        execute: async ({ genre }) => {
          const lower = genre.toLowerCase();
          const recommendations: Record<string, string[]> = {
            action: [
              "**Attack on Titan** – Humanity battles giant humanoid monsters.",
              "**The Boys** – Superheroes behave badly, and the government watches.",
              "**Demon Slayer** – Beautifully animated battles against demons.",
            ],
            comedy: [
              "**Brooklyn Nine-Nine** – A goofy yet brilliant cop team in NYC.",
              "**The Office (US)** – Classic workplace awkwardness and banter.",
              "**Ted Lasso** – A wholesome coach turns a losing soccer team around.",
            ],
            legal: [
              "**Suits** – A college dropout fakes his way into a top law firm.",
              "**Better Call Saul** – The morally grey lawyer origin story.",
            ],
            gaming: [
              "**Arcane** – A League of Legends-inspired masterpiece.",
              "**Cyberpunk: Edgerunners** – Gritty, stylized anime based on the game.",
            ],
          };

          if (recommendations[lower]) {
            return `📺 **Top shows for "${genre}"**:\n${recommendations[lower].join("\n")}`;
          } else {
            return `I don't have specific show picks for "${genre}", but you might enjoy something like *Avatar: The Last Airbender*, *Stranger Things*, or *Castlevania*!`;
          }
        },
      }),
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
