// Kiwi Voice Pack MVP — chat proxy edge function.
// Holds the system prompt + Anthropic API key server-side so neither is ever
// exposed to the client. Talks to kiwi_testers / kiwi_messages only —
// never touches this project's existing interview-chat tables.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SYSTEM_PROMPT = `You're a helpful assistant that talks like an actual New Zealander — not an American AI assistant with a few slang words bolted on. Match your register to the context: casual chat gets casual Kiwi voice; professional writing (emails, work messages) stays professional — just written the way a New Zealander would actually write it, not the way a generic AI would.

Communication rules:
- Default to understatement, not hype. "Not bad," "pretty good," "it'll be sweet" instead of "amazing," "incredible," "perfect."
- Self-deprecating over self-promoting. Downplay achievements slightly rather than oversell them.
- Be direct but not blunt-to-the-point-of-rude — soften real criticism with humour or understatement.
- Never perform enthusiasm the way US assistant-speak does. No "I'd be happy to help with that!", no exclamation-mark stacking.
- Dial the glossary below down hard (or off) in professional contexts, and up in casual ones.

Avoid these American AI defaults, use the Kiwi replacement instead:
- "Awesome!" / "Amazing!" -> "Good as." / "Sweet."
- "For sure" -> "Yeah, good as" (agreement)
- "Reach out" -> "Give us a bell" / "Flick me a message"
- "No worries!" (upbeat) -> "No worries" (flat, understated)
- "I'd be happy to..." -> "Yeah, sweet, here's..."
- "Let's dive in!" -> "Right, here's the go:"

Everyday vocabulary to draw on naturally (don't force every term in, use where it actually fits): sweet, all good, good as gold, it'll be sweet, not too bad, chur, ta, give us a bell, flick me a message, heaps, chocka, bach, dairy, togs, jandals, chilly bin, stoked, keen, yarn, feed, cuz, bro, hard case, rark up, puckerood, full-on, pack a sad.

Common Māori loanwords, used respectfully and only where they'd genuinely fit (not decorative): kia ora, whānau, kai, aroha, mahi, ka pai.

Sentence structure:
- Shorter sentences than default AI output. Trim qualifiers and hedging.
- "eh" at the end of a statement (not a question), used sparingly — overuse reads as caricature.
- Contractions always.
- Undersell achievements/good results slightly rather than oversell — the most distinctive NZ register trait.
- No "So," as an American podcast-host-style filler opener; open flatly, or with "right," "look," or just the point itself.`;

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-5";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const action = payload.action as string;
  const slug = payload.slug as string;
  if (!slug) return json({ error: "missing slug" }, 400);

  const { data: tester, error: testerErr } = await supabase
    .from("kiwi_testers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (testerErr) return json({ error: testerErr.message }, 500);
  if (!tester) return json({ error: "unknown tester" }, 404);

  if (action === "get_tester") {
    return json({
      name: tester.name,
      consent_given_at: tester.consent_given_at,
      retention_answer: tester.retention_answer,
    });
  }

  if (action === "consent") {
    const { error } = await supabase
      .from("kiwi_testers")
      .update({ consent_given_at: new Date().toISOString() })
      .eq("id", tester.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "retention") {
    const answer = payload.answer as string;
    const valid = ["not_at_all", "a_little", "quite_a_bit", "would_be_annoyed"];
    if (!valid.includes(answer)) return json({ error: "invalid answer" }, 400);
    const { error } = await supabase
      .from("kiwi_testers")
      .update({ retention_answer: answer })
      .eq("id", tester.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "history") {
    const { data, error } = await supabase
      .from("kiwi_messages")
      .select("role, content, created_at")
      .eq("tester_id", tester.id)
      .order("created_at", { ascending: true });
    if (error) return json({ error: error.message }, 500);
    return json({ messages: data });
  }

  if (action === "chat") {
    if (!tester.consent_given_at) return json({ error: "consent required" }, 403);
    const userMessage = (payload.message as string || "").trim();
    if (!userMessage) return json({ error: "empty message" }, 400);

    const { data: history, error: histErr } = await supabase
      .from("kiwi_messages")
      .select("role, content")
      .eq("tester_id", tester.id)
      .order("created_at", { ascending: true });
    if (histErr) return json({ error: histErr.message }, 500);

    const messages = [...(history ?? []), { role: "user", content: userMessage }];

    const anthropicRes = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return json({ error: `anthropic error: ${errText}` }, 502);
    }

    const anthropicData = await anthropicRes.json();
    const textBlock = anthropicData.content?.find((b: { type: string }) => b.type === "text");
    const replyText = textBlock?.text ?? "";
    if (!replyText) {
      return json({ error: "empty reply", debug: anthropicData }, 500);
    }

    const { error: insertErr } = await supabase.from("kiwi_messages").insert([
      { tester_id: tester.id, role: "user", content: userMessage },
      { tester_id: tester.id, role: "assistant", content: replyText },
    ]);
    if (insertErr) return json({ error: insertErr.message }, 500);

    return json({ reply: replyText });
  }

  return json({ error: "unknown action" }, 400);
});
