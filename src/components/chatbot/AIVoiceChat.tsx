"use client";
/**
 * AIVoiceChat — voice conversation with AI using Web Speech API.
 *
 * - Voice input: Web Speech API (SpeechRecognition)
 * - AI responses: Backend /api/ai/chat proxy (Gemini/Sarvam server-side)
 * - Voice output: Web Speech API (SpeechSynthesis)
 * - Language selector for voice recognition and response language
 * - Course-aware: sends course context when opened from course page
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { Mic, MicOff, PhoneOff, Globe, Volume2, VolumeX, ChevronDown, Bot, User, Loader2 } from "lucide-react";

interface AIVoiceChatProps {
  courseTitle?: string;
  courseDescription?: string;
  courseDuration?: number;
  courseDifficulty?: string;
  courseModules?: Array<{ name: string }>;
}

type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function AIVoiceChat({
  courseTitle,
  courseDescription,
  courseDuration,
  courseDifficulty,
  courseModules,
}: AIVoiceChatProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedLang, setSelectedLang] = useState(language);
  const [langOpen, setLangOpen] = useState(false);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const courseContext = courseTitle
    ? `COURSE: ${courseTitle}\nDESCRIPTION: ${courseDescription || "N/A"}\nDURATION: ${courseDuration || "unknown"} hours\nDIFFICULTY: ${courseDifficulty || "Beginner"}\nMODULES: ${courseModules?.map((m) => m.name).join(", ") || "Not available"}`
    : "General assistant — no specific course context.";

  const languageNames: Record<string, string> = {
    en: "English", hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu",
    mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
  };

  const langMap: Record<string, string> = {
    en: "en-US", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN",
    mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN", pa: "pa-IN",
  };

  // Send message to backend AI (with auth token — backend requires verifyAuth)
  const sendToAI = useCallback(async (text: string): Promise<string> => {
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ message: text, context: courseContext, language: selectedLang }),
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => null);
        console.error("[AIVoiceChat] AI request failed:", resp.status, errBody);
        if (resp.status === 401) return "Please log in to use the AI assistant.";
        return "AI request failed (" + resp.status + "). Please try again.";
      }
      const data = await resp.json();
      return data?.data?.response || "I couldn't generate a response. Please try again.";
    } catch (err) {
      console.error("[AIVoiceChat] Network error:", err);
      return "AI service is temporarily unavailable. Please try again later.";
    }
  }, [courseContext, selectedLang]);

  // Speak text using Web Speech Synthesis
  const speak = useCallback((text: string) => {
    if (isMuted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[selectedLang] || "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setState("listening");
    window.speechSynthesis.speak(utterance);
  }, [selectedLang, isMuted]);

  // Start voice chat
  const startChat = useCallback(async () => {
    setState("connecting");
    setError("");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        setError("Voice requires Chrome. Use the text input below instead.");
        setState("idle");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognitionAPI as any)();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = langMap[selectedLang] || "en-US";

      recognition.onresult = async (event: { results: { transcript: string }[][] }) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setState("thinking");

        setMessages((prev) => [...prev, { role: "user", text: transcript }]);
        const response = await sendToAI(transcript);
        setMessages((prev) => [...prev, { role: "assistant", text: response }]);
        setState("speaking");
        speak(response);
      };

      recognition.onerror = () => {
        setState("listening"); // restart listening
      };

      recognition.onend = () => {
        // Auto-restart if still in listening mode
        if (state === "listening" || state === "connecting") {
          try { recognition.start(); } catch { /* silent */ }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setState("listening");

      setMessages([{
        role: "assistant",
        text: courseTitle
          ? `Hello! I'm your AI voice assistant for "${courseTitle}". Ask me anything about this course!`
          : "Hello! I'm your AI voice assistant. How can I help you today?",
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start voice chat");
      setState("error");
    }
  }, [selectedLang, courseTitle, sendToAI, speak, state]);

  // Stop voice chat
  const stopChat = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setState("idle");
    setMessages([]);
    setInputText("");
  }, []);

  // Send text message (fallback for non-Chrome)
  const sendText = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    setState("thinking");
    setMessages((prev) => [...prev, { role: "user", text }]);

    const response = await sendToAI(text);
    setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    setState("listening");
    speak(response);
  }, [inputText, sendToAI, speak]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          if (isOpen) stopChat();
          setIsOpen(!isOpen);
        }}
        className="fixed bottom-6 right-20 z-50 w-14 h-14 bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-all cursor-pointer flex items-center justify-center"
        style={{ borderRadius: "50%" }}
        title="AI Voice Chat"
      >
        {isOpen ? <PhoneOff size={20} /> : <Mic size={20} />}
      </button>

      {/* Voice Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 bg-white border border-slate-200 shadow-xl flex flex-col"
          style={{ borderRadius: "8px", maxHeight: "500px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-primary-500" />
              <span className="text-sm font-semibold text-slate-800">AI Voice Chat</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-500 border border-slate-200 bg-white cursor-pointer"
                style={{ borderRadius: "4px" }}
              >
                <Globe size={10} />
                {languageNames[selectedLang] || "EN"}
                <ChevronDown size={10} />
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 shadow-lg py-1 z-50 max-h-40 overflow-y-auto"
                  style={{ borderRadius: "4px" }}
                >
                  {LANGUAGES.slice(0, 6).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang.code); setLangOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-slate-50 cursor-pointer ${
                        selectedLang === lang.code ? "bg-primary-50 text-primary-600 font-semibold" : "text-slate-600"
                      }`}
                    >
                      {lang.nativeLabel}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
            {state === "idle" && messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-primary-50 flex items-center justify-center mx-auto mb-3" style={{ borderRadius: "50%" }}>
                  <Mic size={22} className="text-primary-500" />
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  {courseTitle ? `Ask about "${courseTitle}"` : "Start a voice conversation"}
                </p>
                <button
                  onClick={startChat}
                  className="px-5 py-2 bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 cursor-pointer"
                  style={{ borderRadius: "4px" }}
                >
                  Start Voice Chat
                </button>
              </div>
            )}

            {state === "connecting" && (
              <div className="text-center py-8">
                <Loader2 size={28} className="animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-xs text-slate-500">Starting voice chat...</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 bg-primary-100 flex items-center justify-center shrink-0" style={{ borderRadius: "50%" }}>
                    <Bot size={12} className="text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-500 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                  style={{ borderRadius: "4px" }}
                >
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 bg-slate-200 flex items-center justify-center shrink-0" style={{ borderRadius: "50%" }}>
                    <User size={12} className="text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {state === "thinking" && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 bg-primary-100 flex items-center justify-center shrink-0" style={{ borderRadius: "50%" }}>
                  <Loader2 size={12} className="animate-spin text-primary-600" />
                </div>
                <div className="bg-slate-100 px-3 py-2" style={{ borderRadius: "4px" }}>
                  <p className="text-xs text-slate-400">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Status indicator */}
          {state === "listening" && (
            <div className="px-4 py-2 border-t border-slate-100 text-center">
              <p className="text-[10px] text-red-500 font-medium animate-pulse">
                Listening... speak now
              </p>
            </div>
          )}
          {state === "speaking" && (
            <div className="px-4 py-2 border-t border-slate-100 text-center">
              <p className="text-[10px] text-green-500 font-medium">
                AI is speaking...
              </p>
            </div>
          )}

          {/* Text input fallback */}
          <div className="border-t border-slate-200 px-3 py-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendText()}
                placeholder="Type a message..."
                className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:outline-none"
                style={{ borderRadius: "4px" }}
              />
              <button
                onClick={() => { if (state === "idle") startChat(); else stopChat(); }}
                className={`px-3 py-1.5 text-[10px] font-semibold cursor-pointer ${
                  state === "idle"
                    ? "bg-primary-500 text-white hover:bg-primary-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
                style={{ borderRadius: "4px" }}
              >
                {state === "idle" ? "Start" : "Stop"}
              </button>
            </div>
            {error && (
              <p className="text-[10px] text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
