"use client";
/**
 * Course AI Chatbot — floating side panel on course pages.
 *
 * Features:
 * - Auto-sends course context (title, description, modules) on open
 * - Text input with send button
 * - Voice input via Web Speech API (SpeechRecognition)
 * - Voice output via Web Speech API (SpeechSynthesis)
 * - Typing indicator while AI responds
 * - Falls back to backend AI endpoint, then to local context-aware responses
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { getAIResponse as callAI } from "@/lib/aiService";
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface CourseChatbotProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseDuration: number;
  courseDifficulty: string;
  courseModules: Array<{ name: string; type: string }>;
  courseKeywords: string[];
}

export function CourseChatbot({
  courseId,
  courseTitle,
  courseDescription,
  courseDuration,
  courseDifficulty,
  courseModules,
  courseKeywords,
}: CourseChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [contextSent, setContextSent] = useState(false);
  const [language, setLanguage] = useState("en");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Build course context string
  const courseContext = `
COURSE: ${courseTitle}
DESCRIPTION: ${courseDescription}
DURATION: ${courseDuration} hours
DIFFICULTY: ${courseDifficulty}
MODULES: ${courseModules.map((m) => m.name).join(", ") || "Not available"}
TOPICS: ${courseKeywords.join(", ") || "Not available"}
URL: https://portal.igotkarmayogi.gov.in/public/toc/${courseId}/overview
`.trim();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send course context on first open
  useEffect(() => {
    if (isOpen && !contextSent && courseTitle) {
      setContextSent(true);
      const welcome: Message = {
        id: "welcome",
        role: "assistant",
        text: `Hi! I'm your AI study assistant for "${courseTitle}".\n\nI know everything about this course — its modules, topics, duration, and difficulty. Ask me anything!\n\nYou can type or use the microphone to speak.`,
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [isOpen, contextSent, courseTitle]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle send message uses imported getAIResponse from @/lib/aiService
    // Handle send message
  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const response = await callAI(text, courseContext, language);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);

    // Speak the response if voice is enabled
    if (voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Voice input
  function toggleVoiceInput() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  // Toggle voice output
  function toggleVoiceOutput() {
    setVoiceEnabled((prev) => {
      if (prev && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
          title="AI Course Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Course AI Assistant</p>
                <p className="text-[10px] text-white/70 truncate max-w-[200px]">
                  {courseTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-[10px] bg-white/20 text-white border-none rounded-lg px-1.5 py-1 cursor-pointer focus:outline-none"
                title="Response language"
              >
                <option value="en" className="text-slate-800">EN</option>
                <option value="hi" className="text-slate-800">HI</option>
                <option value="bn" className="text-slate-800">BN</option>
                <option value="ta" className="text-slate-800">TA</option>
                <option value="te" className="text-slate-800">TE</option>
                <option value="mr" className="text-slate-800">MR</option>
                <option value="gu" className="text-slate-800">GU</option>
                <option value="kn" className="text-slate-800">KN</option>
                <option value="ml" className="text-slate-800">ML</option>
                <option value="pa" className="text-slate-800">PA</option>
              </select>
              <button
                onClick={toggleVoiceOutput}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                title={voiceEnabled ? "Mute voice" : "Enable voice"}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                }}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-500 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary-600" />
                </div>
                <div className="bg-slate-100 px-3 py-2 rounded-xl rounded-bl-sm">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 px-3 py-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isListening
                    ? "bg-red-100 text-red-500 animate-pulse"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about this course..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
