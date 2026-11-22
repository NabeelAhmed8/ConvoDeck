/**
 * aiAssistantService.ts
 * Single Responsibility: Generates intelligent AI customer support solutions
 * and answers inquiries using Gemini Flash or OpenAI API via native fetch.
 */

export async function generateAiSupportReply(
  userMessage: string,
  baseUrl: string = "https://convodeck.com"
): Promise<string | null> {
  const cleanMessage = (userMessage || "").trim();
  if (!cleanMessage) return null;

  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openAiKey) {
    // shortcut: AI API key not configured, fallback to rule engine
    return null;
  }

  const systemInstruction = `You are ConvoDeck's official AI WhatsApp Assistant.
ConvoDeck is a WhatsApp CRM & Multi-Agent Inbox built on the official Meta Cloud API.
Answer customer inquiries politely, directly, and provide solutions in 1 to 3 concise, WhatsApp-friendly sentences.
Rules:
1. If the customer asks about plans, pricing, costs, or packages, always share this link: ${baseUrl}/pricing
2. If the customer asks how to sign up or register, direct them to: ${baseUrl}/signup
3. If they ask for human support or an agent, politely confirm that a team member is being notified.
4. Keep the tone professional, helpful, and concise. No markdown headers or lengthy lists.`;

  try {
    // 1. Google Gemini Flash (default & fastest)
    if (geminiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: cleanMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    }

    // 2. OpenAI Fallback
    if (openAiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: cleanMessage },
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    }

    return null;
  } catch (error) {
    console.error("[AI Assistant Service Error]:", error);
    return null;
  }
}
