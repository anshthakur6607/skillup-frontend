/**
 * AI Service — Gemini + Sarvam with automatic model fallback.
 *
 * Flow:
 * 1. Randomly pick a provider (Gemini or Sarvam)
 * 2. Randomly pick a model from that provider
 * 3. Try the API call
 * 4. If it fails, try other models from the same provider
 * 5. If all models from that provider fail, switch to the other provider
 * 6. If both providers fail, return a local fallback response
 */

// ─── GEMINI MODELS ───────────────────────────────────────────────────────────
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

// ─── SARVAM MODELS ───────────────────────────────────────────────────────────
const SARVAM_MODELS = [
  "sarvam-m",
];

type Provider = "gemini" | "sarvam";

// ─── GEMINI API CALL ─────────────────────────────────────────────────────────
async function callGemini(
  model: string,
  prompt: string,
  context: string
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const systemInstruction = `You are an AI study assistant for government training courses on iGOT Karmayogi. You help officials understand course content, answer questions about modules, duration, difficulty, enrollment, certifications, and learning outcomes. Be helpful, concise, and professional. Use simple language. Format responses with clear paragraphs and bullet points when helpful.

COURSE CONTEXT:
${context}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!resp.ok) {
      console.warn(`Gemini ${model} failed: ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.warn(`Gemini ${model} error:`, err);
    return null;
  }
}

// ─── SARVAM API CALL ─────────────────────────────────────────────────────────
async function callSarvam(
  model: string,
  prompt: string,
  context: string
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY;
  if (!apiKey) return null;

  try {
    const systemMessage = `You are an AI study assistant for government training courses on iGOT Karmayogi. You help officials understand course content, answer questions about modules, duration, difficulty, enrollment, certifications, and learning outcomes. Be helpful, concise, and professional.

COURSE CONTEXT:
${context}`;

    const resp = await fetch("https://api.sarvam.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Subscription-Key": apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
      console.warn(`Sarvam ${model} failed: ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content;
    return text || null;
  } catch (err) {
    console.warn(`Sarvam ${model} error:`, err);
    return null;
  }
}

// ─── SHUFFLE UTILITY ─────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── MAIN: GET AI RESPONSE ───────────────────────────────────────────────────
export async function getAIResponse(
  prompt: string,
  context: string
): Promise<string> {
  // Randomly pick provider order
  const providers: Provider[] = shuffle(["gemini", "sarvam"]);

  for (const provider of providers) {
    if (provider === "gemini") {
      const models = shuffle(GEMINI_MODELS);
      for (const model of models) {
        const result = await callGemini(model, prompt, context);
        if (result) {
          console.log(`AI response from Gemini ${model}`);
          return result;
        }
      }
    } else {
      const models = shuffle(SARVAM_MODELS);
      for (const model of models) {
        const result = await callSarvam(model, prompt, context);
        if (result) {
          console.log(`AI response from Sarvam ${model}`);
          return result;
        }
      }
    }
  }

  // Both providers failed — return local fallback
  console.warn("All AI providers failed, using local fallback");
  return generateLocalFallback(prompt, context);
}

// ─── LOCAL FALLBACK (no API needed) ──────────────────────────────────────────
function generateLocalFallback(prompt: string, context: string): string {
  // Extract course info from context
  const titleMatch = context.match(/COURSE:\s*(.+)/i);
  const descMatch = context.match(/DESCRIPTION:\s*(.+)/i);
  const durMatch = context.match(/DURATION:\s*(.+)/i);
  const diffMatch = context.match(/DIFFICULTY:\s*(.+)/i);
  const modMatch = context.match(/MODULES:\s*(.+)/i);
  const topicMatch = context.match(/TOPICS:\s*(.+)/i);

  const title = titleMatch?.[1] || "this course";
  const desc = descMatch?.[1] || "";
  const dur = durMatch?.[1] || "unknown";
  const diff = diffMatch?.[1] || "Beginner";
  const mods = modMatch?.[1] || "Not available";
  const topics = topicMatch?.[1] || "";

  const msg = prompt.toLowerCase();

  if (msg.match(/^(hi|hello|hey)/)) {
    return `Hello! I'm your AI assistant for "${title}". Ask me anything about this course — its content, duration, modules, or how to get started.`;
  }

  if (msg.includes("duration") || msg.includes("how long")) {
    return `This course is approximately ${dur} long. It's a self-paced learning module on iGOT Karmayogi.`;
  }

  if (msg.includes("difficulty") || msg.includes("level")) {
    return `This course is rated "${diff}". ${diff === "Beginner" ? "No prior knowledge required — suitable for all government officials." : "Some foundational knowledge may be helpful."}`;
  }

  if (msg.includes("module") || msg.includes("content") || msg.includes("syllabus")) {
    if (mods !== "Not available") {
      return `This course includes these modules:\n\n${mods.split(", ").map((m: string, i: number) => `${i + 1}. ${m.trim()}`).join("\n")}\n\nAccess all materials on iGOT Karmayogi.`;
    }
    return `Module details are available on the iGOT Karmayogi platform. Click "Open on iGOT" to see the full module list.`;
  }

  if (msg.includes("learn") || msg.includes("objective")) {
    return `By completing "${title}", you will gain knowledge in:\n\n${desc.substring(0, 300)}...\n\nThis course is part of iGOT Karmayogi's capacity building initiative.`;
  }

  if (msg.includes("topic") || msg.includes("keyword") || msg.includes("cover")) {
    if (topics) {
      return `Key topics covered:\n\n${topics.split(", ").map((t: string) => `• ${t.trim()}`).join("\n")}\n\nThese align with the government competency framework.`;
    }
    return `This course covers topics related to ${title}. Visit iGOT Karmayogi for detailed topic listing.`;
  }

  if (msg.includes("enroll") || msg.includes("start") || msg.includes("begin")) {
    return `To start this course:\n\n1. Click "Enroll Now" on this page\n2. You'll be redirected to iGOT Karmayogi\n3. Log in with your government credentials\n4. Start learning at your own pace\n\nThe course is free for all government officials.`;
  }

  if (msg.includes("assessment") || msg.includes("quiz")) {
    return `After completing the course on iGOT, take the SkillUp AI assessment. It uses adaptive MCQs that adjust difficulty based on your answers — harder when you're doing well, easier when you need support.`;
  }

  if (msg.includes("certificate")) {
    return `Upon completing the course and passing the assessment, you receive a digital certificate with a unique verification code. This can be linked to your APAR for career progression.`;
  }

  return `Great question about "${title}". 

This is a ${diff}-level course (${dur} long) on iGOT Karmayogi.

${topics ? `Key topics: ${topics.split(",").slice(0, 5).map((t: string) => t.trim()).join(", ")}` : ""}

For more details, visit the course on iGOT Karmayogi or ask me something specific!`;
}
