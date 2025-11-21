import { tool } from "ai";
import { z } from "zod";

export const tools = {
  updateGameState: tool({
    description: 'Update the player health, inventory, or location.',
    parameters: z.object({
      hp: z.number(),
      inventory: z.array(z.string()),
      location: z.string(),
      eventSummary: z.string(),
    }),
    // @ts-ignore
    execute: async ({ hp, inventory, location }) => {
      return {
        status: "Game State Updated",
        current_hp: hp,
        items: inventory,
        location: location
      };
    },
  } as any),
};