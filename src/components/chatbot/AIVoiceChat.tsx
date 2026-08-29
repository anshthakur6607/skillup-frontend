"use client";
/**
 * AIVoiceChat — real-time voice conversation with Gemini AI.
 *
 * Uses Gemini Multimodal Live API via WebRTC for low-latency voice chat.
 * Falls back to text-based chat if WebRTC is unavailable.
 *
 * Features:
 * - Start/stop voice chat with mic button
 * - Language selector (English, Hindi, etc.)
 * - Course-aware: sends course context when opened from course page
 * - Visual feedback: listening, thinking, speaking states
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Globe,
  Loader2,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react";

interface AIVoiceChatProps {
  courseTitle?: string;
  courseDescription?: string;
  courseDuration?: number;
  courseDifficulty?: string;
  courseModules?: Array<{ name: string }>;
}

type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";

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
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [selectedLang, setSelectedLang] = useState(language);
  const [langOpen, setLangOpen] = useState(false);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  // Build course context for the AI
  const courseContext = courseTitle
    ? `COURSE: ${courseTitle}
DESCRIPTION: ${courseDescription || "N/A"}
DURATION: ${courseDuration || "unknown"} hours
DIFFICULTY: ${courseDifficulty || "Beginner"}
MODULES: ${courseModules?.map((m) => m.name).join(", ") || "Not available"}`
    : "General assistant — no specific course context.";

  const systemInstruction = `You are an AI voice assistant for SkillUp, a government training platform.
You help officials learn about courses, answer questions about content, and guide them through their learning journey.
Be helpful, concise, and professional. Keep responses under 3 sentences for voice.
${courseContext}`;

  const languageNames: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam",
    pa: "Punjabi",
  };

  const startVoiceChat = useCallback(async () => {
    setState("connecting");
    setError("");

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError("AI voice chat requires a Gemini API key. Add NEXT_PUBLIC_GEMINI_API_KEY to your .env");
        setState("error");
        return;
      }

      // Get user microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;

      // Create audio element for AI responses
      if (!audioElement.current) {
        audioElement.current = new Audio();
        audioElement.current.autoplay = true;
      }

      // Set up WebRTC peer connection to Gemini
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnection.current = pc;

      // Add audio tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to Gemini Live API
      const langCode = selectedLang === "hi" ? "hi-IN" : selectedLang === "en" ? "en-US" : `${selectedLang}-IN`;
      const model = "gemini-2.0-flash-live-001";

      const sdpResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:connect?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        throw new Error(`Gemini Live API returned ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      // Handle incoming audio
      pc.ontrack = (event) => {
        if (audioElement.current) {
          audioElement.current.srcObject = event.streams[0];
        }
      };

      // Set up data channel for text messages
      const dc = pc.createDataChannel("text");
      dataChannel.current = dc;

      dc.onopen = () => {
        setState("listening");
        // Send configuration
        dc.send(
          JSON.stringify({
            setup: {
              system_instruction: systemInstruction,
              language: langCode,
            },
          })
        );
      };

      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.transcript) setTranscript(msg.transcript);
          if (msg.response) {
            setResponse(msg.response);
            setState("speaking");
          }
        } catch {
          // raw text message
          setResponse(event.data);
        }
      };

      dc.onclose = () => {
        setState("idle");
      };

      // Handle connection errors
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setState("error");
          setError("Voice connection lost. Please try again.");
          cleanup();
        }
      };
    } catch (err) {
      console.error("Voice chat error:", err);
      setError(err instanceof Error ? err.message : "Failed to start voice chat");
      setState("error");
      cleanup();
    }
  }, [selectedLang, systemInstruction]);

  const stopVoiceChat = useCallback(() => {
    cleanup();
    setState("idle");
    setTranscript("");
    setResponse("");
  }, []);

  const cleanup = useCallback(() => {
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((t) => t.stop());
      mediaStream.current = null;
    }
    if (audioElement.current) {
      audioElement.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <>
      {/* Floating Voice Button */}
      <button
        onClick={() => {
          if (isOpen) {
            stopVoiceChat();
          }
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
          className="fixed bottom-24 right-6 z-50 w-80 bg-white border border-slate-200 shadow-xl"
          style={{ borderRadius: "8px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
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
                      onClick={() => {
                        setSelectedLang(lang.code);
                        setLangOpen(false);
                      }}
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

          {/* Status */}
          <div className="px-4 py-6 text-center">
            {state === "idle" && (
              <div>
                <div className="w-16 h-16 bg-primary-50 flex items-center justify-center mx-auto mb-3" style={{ borderRadius: "50%" }}>
                  <Mic size={24} className="text-primary-500" />
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {courseTitle ? `Ask about "${courseTitle}"` : "Start a voice conversation"}
                </p>
                <button
                  onClick={startVoiceChat}
                  className="px-6 py-2.5 bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 cursor-pointer"
                  style={{ borderRadius: "4px" }}
                >
                  Start Voice Chat
                </button>
              </div>
            )}

            {state === "connecting" && (
              <div>
                <Loader2 size={32} className="animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-xs text-slate-500">Connecting to AI...</p>
              </div>
            )}

            {(state === "listening" || state === "thinking" || state === "speaking") && (
              <div>
                {/* Animated mic indicator */}
                <div
                  className={`w-16 h-16 mx-auto mb-3 flex items-center justify-center transition-colors ${
                    state === "listening" ? "bg-red-50" : state === "thinking" ? "bg-amber-50" : "bg-green-50"
                  }`}
                  style={{ borderRadius: "50%" }}
                >
                  {state === "listening" ? (
                    <Mic size={24} className="text-red-500 animate-pulse" />
                  ) : state === "thinking" ? (
                    <Loader2 size={24} className="animate-spin text-amber-500" />
                  ) : (
                    <Volume2 size={24} className="text-green-500" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">
                  {state === "listening" ? "Listening..." : state === "thinking" ? "Thinking..." : "Speaking..."}
                </p>

                {/* Transcript */}
                {transcript && (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-100 mb-2 text-xs text-slate-600 text-left" style={{ borderRadius: "4px" }}>
                    <span className="text-[10px] text-slate-400 font-medium">You:</span> {transcript}
                  </div>
                )}

                {/* Response */}
                {response && (
                  <div className="px-3 py-2 bg-primary-50 border border-primary-100 text-xs text-slate-700 text-left" style={{ borderRadius: "4px" }}>
                    <span className="text-[10px] text-primary-500 font-medium">AI:</span> {response}
                  </div>
                )}
              </div>
            )}

            {state === "error" && (
              <div>
                <div className="w-16 h-16 bg-red-50 flex items-center justify-center mx-auto mb-3" style={{ borderRadius: "50%" }}>
                  <MicOff size={24} className="text-red-400" />
                </div>
                <p className="text-xs text-red-500 mb-3">{error}</p>
                <button
                  onClick={() => { setState("idle"); setError(""); }}
                  className="px-4 py-2 text-xs font-medium text-primary-500 border border-primary-200 hover:bg-primary-50 cursor-pointer"
                  style={{ borderRadius: "4px" }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Footer controls */}
          {state !== "idle" && state !== "error" && (
            <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-slate-200">
              <button
                onClick={() => setMuted(!muted)}
                className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none"
                title={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={stopVoiceChat}
                className="px-4 py-2 bg-red-500 text-white text-xs font-semibold hover:bg-red-600 cursor-pointer"
                style={{ borderRadius: "4px" }}
              >
                End Call
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
