# **AI Dungeon Master Agent**

An AI-powered text adventure game built on **Cloudflare Workers**, **Agents SDK**, and **Workers AI**.

This project demonstrates a stateful, real-time AI agent that acts as a Dungeon Master, tracking player stats (Health, Inventory) and narrating the story using Llama 3.1.

## **Assignment Requirements Met**

This project fulfills all requirements for the Cloudflare AI App assignment:

| Requirement | Implementation Details |
| :---- | :---- |
| **LLM** | **Llama 3.1 (70b)** running on Cloudflare Workers AI (@cf/meta/llama-3.1-70b-instruct). |
| **Workflow / Coordination** | The Agent autonomously coordinates game logic by calling the custom updateGameState tool to modify player stats based on natural language actions. |
| **User Input** | Real-time chat interface built with **React** and **WebSockets** via the Cloudflare Agents SDK. |
| **Memory / State** | **Durable Objects** (SQLite) provide persistent storage for the game state (HP, Inventory, Location) across sessions. |

## **Features**

* **Persistent Game State:** The agent remembers your inventory and health even if you refresh the page or disconnect.  
* **Autonomous Tool Use:** The AI detects actions (e.g., "pick up sword", "drink potion") and automatically updates the underlying database state.  
* **Real-time Streaming:** Zero-latency token streaming from the Edge using WebSockets.  
* **Dungeon Master Persona:** Customized system prompt to enforce game rules and narrative style.

## **Tech Stack**

* **Platform:** Cloudflare Workers  
* **Framework:** Cloudflare Agents SDK  
* **AI Model:** Llama 3.1 (via workers-ai-provider)  
* **Frontend:** React \+ Tailwind CSS  
* **State Management:** Durable Objects (SQLite)

## **Setup & Deployment**

### **Prerequisites**

* Node.js  
* Cloudflare Account

### **1\. Installation**

npm install

### **2\. Configuration**

The project uses workers-ai-provider to bridge the Vercel AI SDK with Cloudflare's GPU network.  
Ensure your wrangler.jsonc has the AI binding enabled:  
"ai": {  
  "binding": "AI"  
}

### **3\. Deploy to Cloudflare**

npm run deploy

This will publish the Worker and the static assets. Open the provided \*.workers.dev URL to play.

## **Key Files**

* **src/server.ts**: The "Brain". Contains the Chat Agent class, Llama 3.1 configuration, and the Dungeon Master system prompt.  
* **src/tools.ts**: The "Logic". Defines the updateGameState tool that the AI calls to modify the Durable Object state.  
* **src/routes/index.tsx**: The "UI". A React-based chat interface tailored for the adventure game experience.

*Built for the Cloudflare AI Systems Assignment.*