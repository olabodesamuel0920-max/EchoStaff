"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { MessageSquare, Phone, Send, Star, AlertCircle, CheckCircle } from "lucide-react";

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function ConversationsInboxPage() {
  const { conversations, activeWorkspaceId } = useAppState();

  const workspaceConvs = conversations[activeWorkspaceId] || [];
  const [selectedConvId, setSelectedConvId] = useState("");

  // Set default selection
  useEffect(() => {
    if (workspaceConvs.length > 0 && !selectedConvId) {
      setSelectedConvId(workspaceConvs[0].id);
    }
  }, [workspaceConvs, selectedConvId]);

  const selectedConv = workspaceConvs.find(c => c.id === selectedConvId);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "WhatsApp": return <Send className="h-3.5 w-3.5 text-emerald-400" />;
      case "Instagram": return <Instagram className="h-3.5 w-3.5 text-pink-400" />;
      case "Phone": return <Phone className="h-3.5 w-3.5 text-blue-400" />;
      default: return <MessageSquare className="h-3.5 w-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6">
      {/* Left: Chat Inbox List */}
      <div className="w-full md:w-80 glass-panel border border-zinc-900 rounded-xl overflow-hidden shadow-xl flex flex-col">
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-900">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Inbox ({workspaceConvs.length} Sessions)
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60">
          {workspaceConvs.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-600 italic">
              No conversations logged.
            </div>
          ) : (
            workspaceConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full text-left p-4 transition-colors flex flex-col space-y-1.5 cursor-pointer ${
                  conv.id === selectedConvId 
                    ? "bg-purple-600/10 border-l-2 border-purple-500" 
                    : "hover:bg-zinc-900/40"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-bold text-zinc-200 truncate">{conv.customerName}</span>
                  <span className="text-[9px] text-zinc-500">
                    {new Date(conv.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                
                <p className="text-[11px] text-zinc-400 line-clamp-1 leading-normal">
                  {conv.summary}
                </p>

                <div className="flex justify-between items-center w-full pt-1">
                  <div className="flex items-center gap-1.5">
                    {getChannelIcon(conv.channel)}
                    <span className="text-[9px] text-zinc-500">{conv.channel}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {conv.needsFollowUp && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[8px] font-bold text-amber-400">
                        Follow Up
                      </span>
                    )}
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                      conv.sentiment === "Positive"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                        : conv.sentiment === "Negative"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                        : "bg-zinc-900 text-zinc-400"
                    }`}>
                      {conv.sentiment}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Active Chat Log Viewer */}
      <div className="flex-1 glass-panel border border-zinc-900 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
        {selectedConv ? (
          <>
            {/* Header Details */}
            <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  {selectedConv.customerName}
                  {getChannelIcon(selectedConv.channel)}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                  Summary: {selectedConv.summary}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedConv.needsFollowUp 
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                }`}>
                  {selectedConv.needsFollowUp ? (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Pending Follow Up</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Audit Checked</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950/10">
              {selectedConv.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.sender === "user" ? "" : "justify-end"}`}
                >
                  {msg.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                      U
                    </div>
                  )}

                  <div 
                    className={`rounded-lg px-4 py-2.5 text-xs max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-zinc-900 text-zinc-300 border border-zinc-900" 
                        : "bg-purple-950/15 border border-purple-900/10 text-purple-200"
                    }`}
                  >
                    {msg.sender !== "user" && (
                      <span className="block text-purple-400 text-[8px] font-bold uppercase tracking-wider mb-1">
                        AI Employee Output
                      </span>
                    )}
                    {msg.text}
                    <span className="block text-[8px] text-zinc-600 mt-1 text-right">{msg.timestamp}</span>
                  </div>

                  {msg.sender !== "user" && (
                    <div className="h-8 w-8 rounded-full bg-purple-900/20 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                      AI
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions footer */}
            <div className="bg-zinc-950/60 p-4 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-500">
              <span>Sentiment rating: <strong className="text-zinc-300 font-semibold">{selectedConv.sentiment}</strong></span>
              <span>Audit session logs for testing compliance.</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <MessageSquare className="h-8 w-8 text-zinc-800" />
            <span className="text-xs font-semibold text-zinc-400">Select a conversation</span>
            <p className="text-[10px] text-zinc-600 max-w-[180px]">Choose a user thread on the left pane to analyze the chat transcript.</p>
          </div>
        )}
      </div>
    </div>
  );
}
