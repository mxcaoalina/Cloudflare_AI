import { useEffect, useState, useRef, useCallback } from "react";
import { useAgent } from "agents/react";
import { isToolUIPart } from "ai";
import { useAgentChat } from "agents/ai-react";
import type { UIMessage } from "@ai-sdk/react";

// Component imports
import { Button } from "@/components/button/Button";
import { Card } from "@/components/card/Card";
import { Avatar } from "@/components/avatar/Avatar";
import { Toggle } from "@/components/toggle/Toggle";
import { Textarea } from "@/components/textarea/Textarea";
import { MemoizedMarkdown } from "@/components/memoized-markdown";
import { ToolInvocationCard } from "@/components/tool-invocation-card/ToolInvocationCard";

// Icon imports
import {
  Bug,
  Moon,
  Sun,
  Trash,
  PaperPlaneTilt,
  Stop,
  Sword, // Changed Robot to Sword for game feel
  Scroll,
  Skull
} from "@phosphor-icons/react";

export default function Chat() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "dark" | "light") || "dark";
  });
  const [showDebug, setShowDebug] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const agent = useAgent({
    agent: "chat"
  });

  const [agentInput, setAgentInput] = useState("");

  // --- REMOVED OpenAI Key Check (Not needed for Cloudflare AI) ---

  const handleAgentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAgentInput(e.target.value);
  };

  const handleAgentSubmit = async (
    e: React.FormEvent,
    extraData: Record<string, unknown> = {}
  ) => {
    e.preventDefault();
    if (!agentInput.trim()) return;

    const message = agentInput;
    setAgentInput("");

    await sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: message }]
      },
      {
        body: extraData
      }
    );
  };

  const {
    messages: agentMessages,
    addToolResult,
    clearHistory,
    status,
    sendMessage,
    stop
  } = useAgentChat<unknown, UIMessage<{ createdAt: string }>>({
    agent
  });

  useEffect(() => {
    agentMessages.length > 0 && scrollToBottom();
  }, [agentMessages, scrollToBottom]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-[100vh] w-full p-4 flex justify-center items-center bg-fixed overflow-hidden bg-neutral-50 dark:bg-[#0a0a0a]">
      
      <div className="h-[calc(100vh-2rem)] w-full mx-auto max-w-lg flex flex-col shadow-2xl rounded-xl overflow-hidden relative border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500">
            <Sword size={24} weight="duotone" />
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-lg font-serif tracking-wide">Dungeon Master</h2>
            <p className="text-xs text-muted-foreground">Llama 3.1 • Cloudflare Agents</p>
          </div>

          <div className="flex items-center gap-2 mr-2">
             {/* Hidden debug toggle for cleaner look, uncomment if needed */}
             {/* <Bug size={16} onClick={() => setShowDebug(!showDebug)} className="cursor-pointer text-muted-foreground"/> */}
          </div>

          <Button variant="ghost" size="md" shape="square" className="rounded-full h-9 w-9" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <Button variant="ghost" size="md" shape="square" className="rounded-full h-9 w-9" onClick={clearHistory}>
            <Trash size={20} />
          </Button>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          
          {/* EMPTY STATE (Welcome Screen) */}
          {agentMessages.length === 0 && (
            <div className="h-full flex items-center justify-center p-4">
              <Card className="p-8 max-w-md mx-auto bg-neutral-50 dark:bg-neutral-800/50 border-dashed border-2 border-neutral-200 dark:border-neutral-700">
                <div className="text-center space-y-4">
                  <div className="bg-amber-500/10 text-amber-600 rounded-full p-4 inline-flex mb-2">
                    <Scroll size={32} weight="duotone" />
                  </div>
                  <h3 className="font-bold text-xl font-serif">Begin Your Adventure</h3>
                  <p className="text-muted-foreground text-sm">
                    I am your Dungeon Master. I track your Health, Inventory, and Location automatically.
                  </p>
                  <div className="grid gap-2 pt-2">
                    <button 
                      onClick={() => { setAgentInput("Start a new game. I wake up in a dark dungeon cell."); }}
                      className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-3 rounded-md hover:border-amber-500 transition-colors text-left flex items-center gap-2"
                    >
                      <Skull size={16} className="text-amber-500"/>
                      "Start a game in a dark dungeon..."
                    </button>
                    <button 
                       onClick={() => { setAgentInput("Start a new game. I am standing at the gates of a golden city."); }}
                       className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-3 rounded-md hover:border-amber-500 transition-colors text-left flex items-center gap-2"
                    >
                      <Sword size={16} className="text-amber-500"/>
                      "Start a game at a golden city..."
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {agentMessages.map((m, index) => {
            const isUser = m.role === "user";
            const showAvatar = index === 0 || agentMessages[index - 1]?.role !== m.role;

            return (
              <div key={m.id}>
                {showDebug && <pre className="text-xs text-muted-foreground overflow-scroll">{JSON.stringify(m, null, 2)}</pre>}
                
                <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* AVATARS */}
                    {showAvatar && !isUser ? (
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center border border-amber-200 dark:border-amber-800 flex-shrink-0 mt-1">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">DM</span>
                      </div>
                    ) : (
                      !isUser && <div className="w-8 flex-shrink-0" />
                    )}

                    <div className="flex flex-col gap-1">
                      {m.parts?.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <div key={i}>
                              <Card className={`p-4 rounded-2xl text-sm md:text-base shadow-sm ${
                                  isUser 
                                  ? "bg-blue-600 text-white rounded-br-none" 
                                  : "bg-neutral-100 dark:bg-neutral-800 rounded-bl-none border-none"
                                }`}>
                                <MemoizedMarkdown id={`${m.id}-${i}`} content={part.text} />
                              </Card>
                            </div>
                          );
                        }

                        if (isToolUIPart(part) && m.role === "assistant") {
                          const toolCallId = part.toolCallId;
                          // In the game, we usually don't need to confirm tool calls manually
                          // so we auto-approve everything or just show the result card.
                          return (
                            <ToolInvocationCard
                              key={`${toolCallId}-${i}`}
                              toolUIPart={part}
                              toolCallId={toolCallId}
                              needsConfirmation={false} 
                              onSubmit={({ toolCallId, result }) => {
                                addToolResult({ tool: part.type.replace("tool-", ""), toolCallId, output: result });
                              }}
                              addToolResult={(toolCallId, result) => {
                                addToolResult({ tool: part.type.replace("tool-", ""), toolCallId, output: result });
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                      
                      <span className={`text-[10px] text-muted-foreground/50 ${isUser ? "text-right mr-1" : "text-left ml-1"}`}>
                         {formatTime(m.metadata?.createdAt ? new Date(m.metadata.createdAt) : new Date())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAgentSubmit(e);
            setTextareaHeight("auto");
          }}
          className="p-4 bg-white dark:bg-neutral-900 absolute bottom-0 left-0 right-0 z-10 border-t border-neutral-200 dark:border-neutral-800"
        >
          <div className="relative flex items-end gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-3xl p-1.5 border border-transparent focus-within:border-amber-500/50 transition-colors">
            <Textarea
              placeholder="What do you want to do?"
              className="flex w-full bg-transparent border-none px-4 py-3 focus-visible:ring-0 placeholder:text-neutral-400 min-h-[44px] max-h-[150px] resize-none text-base"
              value={agentInput}
              onChange={(e) => {
                handleAgentInputChange(e);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                setTextareaHeight(`${e.target.scrollHeight}px`);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAgentSubmit(e as unknown as React.FormEvent);
                  setTextareaHeight("auto");
                }
              }}
              rows={1}
              style={{ height: textareaHeight }}
            />
            
            <div className="pb-1.5 pr-1.5">
              {status === "streaming" ? (
                <button type="button" onClick={stop} className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                  <Stop size={16} weight="bold" />
                </button>
              ) : (
                <button type="submit" disabled={!agentInput.trim()} className="h-8 w-8 flex items-center justify-center rounded-full bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <PaperPlaneTilt size={16} weight="bold" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}