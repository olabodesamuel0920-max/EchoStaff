"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, AlertTriangle } from "lucide-react";
import { Message } from "@/lib/types";

interface WidgetClientProps {
  initialConfig: {
    id: string;
    workspaceId: string;
    agentId: string;
    publicKey: string;
    enabled: boolean;
    greeting: string;
    accentColor: string;
    displayName: string;
    allowedDomains: string[];
  } | null;
  isPreview: boolean;
  publicKey: string;
}

export default function WidgetClient({
  initialConfig,
  isPreview,
  publicKey,
}: WidgetClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Initialize Session ID and Greeting
  useEffect(() => {
    if (!initialConfig) return;

    let sid = sessionStorage.getItem("echostaff_widget_session_id");
    if (!sid) {
      sid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      sessionStorage.setItem("echostaff_widget_session_id", sid);
    }
    setSessionId(sid);

    // Initial message count
    const count = parseInt(sessionStorage.getItem(`echostaff_msg_count_${sid}`) || "0", 10);
    setMessageCount(count);

    // Setup initial greeting
    setMessages([
      {
        id: "greeting-msg",
        sender: "agent",
        text: initialConfig.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // Send initial size message to host (collapsed bubble size)
    window.parent.postMessage({ type: "echostaff-widget-resize", state: "closed" }, "*");
  }, [initialConfig]);

  // Auto-scroll on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!initialConfig) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-zinc-950 text-zinc-400 font-sans border border-zinc-900 rounded-2xl shadow-xl">
        <div className="text-center space-y-2 max-w-[280px]">
          <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-200">Widget Unavailable</p>
          <p className="text-xs text-zinc-500">
            {publicKey === "preview" 
              ? "Ensure you select an active agent in sandbox configurations." 
              : "This website chat widget is either disabled or unconfigured."}
          </p>
          {!isPreview && (
            <p className="text-[10px] text-zinc-600 bg-zinc-900/60 p-2 rounded border border-zinc-900 mt-2 font-mono">
              Note: Embedded widgets require an active Supabase Cloud database subscription.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!initialConfig.enabled) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-4 bg-zinc-950 text-zinc-400 font-sans border border-zinc-900 rounded-2xl shadow-xl">
        <div className="text-center space-y-2 max-w-[280px]">
          <MessageSquare className="h-6 w-6 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">Widget Offline</p>
          <p className="text-xs text-zinc-500">
            This customer assistant has been turned off by the business owner.
          </p>
        </div>
      </div>
    );
  }

  const toggleWidget = (state: boolean) => {
    setIsOpen(state);
    window.parent.postMessage(
      { type: "echostaff-widget-resize", state: state ? "open" : "closed" },
      "*"
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    // Check message abuse count limit (15)
    if (messageCount >= 15) {
      setErrorMsg("Session limit reached. To prevent abuse, this demo chat is restricted to 15 exchanges.");
      return;
    }

    // Check message length limit (1000)
    if (inputText.length > 1000) {
      setErrorMsg("Message too long. Keep messages under 1000 characters.");
      return;
    }

    setErrorMsg(null);
    const userText = inputText.trim();
    setInputText("");

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Limit history to last 10 messages to protect token limits
      const recentHistory = messages.slice(-10).map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp
      }));

      const res = await fetch("/api/widget/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: initialConfig.publicKey,
          sessionId,
          message: userText,
          conversationHistory: recentHistory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to receive response");
      }

      const data = await res.json();

      const agentMsg: Message = {
        id: `msg-agent-${Date.now()}`,
        sender: "agent",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      sessionStorage.setItem(`echostaff_msg_count_${sessionId}`, String(newCount));
    } catch (err: any) {
      console.error("Widget API Error:", err);
      setErrorMsg(err.message || "An issue occurred connecting to the service. Please try again.");
      // Rollback last message or leave it in list and show error banner
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen select-none font-sans relative overflow-hidden flex items-end justify-end bg-transparent">
      {/* 1. Closed State: Circular Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => toggleWidget(true)}
          style={{ backgroundColor: initialConfig.accentColor }}
          className="h-14 w-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer absolute bottom-5 right-5 group"
        >
          <MessageSquare className="h-6 w-6 group-hover:rotate-6 transition-transform" />
          <div className="absolute -inset-0.5 rounded-full bg-inherit filter blur-md opacity-25 group-hover:opacity-40 transition-opacity" />
        </button>
      )}

      {/* 2. Open State: Full Chat Window Panel */}
      {isOpen && (
        <div className="h-[98%] w-[98%] sm:h-[600px] sm:w-[380px] bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative z-50 animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Panel Header */}
          <div 
            style={{ borderBottom: `1px solid ${initialConfig.accentColor}20` }}
            className="px-4 py-3 bg-zinc-900/40 flex justify-between items-center"
          >
            <div className="flex items-center gap-2.5">
              {/* Status Ring */}
              <div className="relative h-2 w-2">
                <span style={{ backgroundColor: initialConfig.accentColor }} className="absolute h-2 w-2 rounded-full" />
                <span style={{ backgroundColor: initialConfig.accentColor }} className="absolute h-2 w-2 rounded-full animate-ping opacity-75" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">
                  {initialConfig.displayName}
                </h3>
                <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase block">
                  Online Agent
                </span>
              </div>
            </div>
            
            <button
              onClick={() => toggleWidget(false)}
              className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-900">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  style={
                    msg.sender === "user"
                      ? { backgroundColor: initialConfig.accentColor }
                      : {}
                  }
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-normal break-words shadow ${
                    msg.sender === "user"
                      ? "text-white rounded-br-none"
                      : "bg-zinc-900/60 border border-zinc-900 text-zinc-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-zinc-650 font-medium tracking-wider mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Simulated typing status */}
            {loading && (
              <div className="flex flex-col items-start mr-auto max-w-[80%]">
                <div className="rounded-2xl rounded-bl-none bg-zinc-900/60 border border-zinc-900 px-4 py-3 shadow">
                  <div className="flex items-center gap-1.5 py-1">
                    <span style={{ backgroundColor: initialConfig.accentColor }} className="h-1.5 w-1.5 rounded-full animate-bounce" />
                    <span style={{ backgroundColor: initialConfig.accentColor }} className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span style={{ backgroundColor: initialConfig.accentColor }} className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Banners */}
            {errorMsg && (
              <div className="rounded-lg border border-red-950 bg-red-950/20 p-3 text-[11px] text-red-400 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* Form Input footer */}
          <div className="p-3 border-t border-zinc-900 bg-zinc-950 flex flex-col gap-2">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                disabled={messageCount >= 15}
                placeholder={messageCount >= 15 ? "Session chat limit reached" : "Type a message..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-zinc-900 bg-zinc-900/25 hover:bg-zinc-900/50 focus:bg-zinc-900/60 px-3 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={messageCount >= 15 || !inputText.trim() || loading}
                style={messageCount < 15 && inputText.trim() && !loading ? { backgroundColor: initialConfig.accentColor } : {}}
                className="rounded-xl bg-zinc-900 text-zinc-550 border border-zinc-900 disabled:opacity-40 disabled:border-zinc-900 disabled:bg-zinc-900 p-2.5 flex items-center justify-center text-white transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>

            {/* Small Branding Badge */}
            <div className="flex justify-between items-center px-1 text-[9px] text-zinc-600 font-semibold tracking-wider uppercase">
              <span>Limit: {messageCount}/15 messages</span>
              <span className="flex items-center gap-0.5">
                Powered by <strong className="text-zinc-500 font-bold">EchoStaff AI</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
