import { COMPASS_SYSTEM_PROMPT } from "../prompts/systemPrompt.js";

const MAX_PROMPT_LENGTH = 8000;

function fallbackAdvice(profile, question) {
  const dream = profile?.dream || "your current direction";
  return {
    text: `Compass cannot reach the AI service right now. Based on your saved profile, focus on one small experiment connected to ${dream}, record what you enjoyed or disliked, and update your evidence profile. One difficult task is not enough to confirm or reject a future path.`,
    source: "local-fallback",
    reflectionQuestion: "Did you dislike the activity itself, or did you dislike feeling inexperienced?",
    question,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { question, profile = {}, context = {} } = req.body || {};
  if (!question || typeof question !== "string" || question.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: "A valid question is required" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json(fallbackAdvice(profile, question));
  }

  const userMessage = `
STUDENT PROFILE (structured data; do not invent missing facts):
${JSON.stringify(profile, null, 2)}

CURRENT COMPASS CONTEXT:
${JSON.stringify(context, null, 2)}

STUDENT QUESTION:
${question}
`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: 1200,
        system: COMPASS_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Anthropic error", data);
      return res.status(200).json(fallbackAdvice(profile, question));
    }

    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return res.status(200).json({
      text: text || fallbackAdvice(profile, question).text,
      source: "anthropic",
    });
  } catch (error) {
    console.error("Compass Buddy unavailable", error);
    return res.status(200).json(fallbackAdvice(profile, question));
  }
}
