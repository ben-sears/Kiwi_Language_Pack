# Kiwi Voice Pack — Validation MVP Plan

## Context

Ben's earlier instinct was to architect a full Kiwi Language Engine (hosted app, server-side persona engine, module marketplace, IP protection). On reflection, that's building the jet before the bike — real cost/time before any evidence people want this at all. This plan replaces that with the smallest possible test that can still get real signal: a minimal chat web app (single model, no accounts, no payments, no modules) that IS the interface testers use, so usage is captured automatically instead of relying on manual self-reporting — tested with 5-10 real NZ users over one week, with an explicit decision framework for what happens next.

**Reframe (from Ben's review of the first draft)**: people don't buy language, they buy outcomes. "Kiwi Voice Pack" is a feature description, not something anyone wants. The core question this MVP answers is: not "do people want a Kiwi language pack" but **"does a Kiwi voice layer improve AI-generated content enough that people prefer using it for a real task they already do."**

**Scope narrowed again (2026-08-26, during actual content review)**: the four industry-specific framings (real estate / small business / tradie / general) originally planned below were dropped once Ben started reviewing the actual content — professional writing should just read as a competent New Zealander wrote it, not have industry-specific slang forced into it ("no one says 'grab a feed' promoting themselves professionally"). The pack is now **one general voice**, register-aware (dials slang down for professional contexts, up for casual ones) rather than four separate pitches. Single focus: **everyday Kiwi language/phrases, and de-Americanising default AI output** — not modelling specific industries or professions.

Also reframed: **behavior over stated preference**. "Would you pay for this" was removed from the weekly measurement — people say yes to be nice, it's a free hypothetical. Replaced with usage-frequency tracking and one end-of-week retention question ("if I took this away tomorrow, would you miss it?") — these predict real demand far better than a stated willingness-to-pay.

## Deliverable 1: Kiwi Voice Pack MVP — core components

**Minimum viable version = one well-crafted document**, not software. It needs to work as a system prompt / custom instructions across ChatGPT, Claude, and Gemini, with a plain-paste fallback for anyone without custom-persona features.

**One general voice, register-aware.** A single pitch instead of four: *"Make your AI sound like an actual New Zealander wrote it, not an American assistant."* Casual chat gets casual Kiwi voice; professional writing (emails, work messages) stays professional but still reads as Kiwi-written, not slang-heavy.

Contents (current state — built and reviewed by Ben, live at `products/kiwi-voice-pack/pack/kiwi-voice-pack.md`):
- **Communication rules** — directness level, use of understatement, self-deprecating humor, when to be blunt vs. soften something ("it'll be sweet," "not too bad").
- **Tone rules** — casual-but-competent register (not cartoonish), avoids American defaults (no "awesome," "for sure," "reach out") in favour of NZ equivalents ("good as," "sweet," "give us a bell") — corrected through a native-speaker review pass that removed several research-derived terms that read as tourist-guide Kiwi rather than the real thing ("choice," "sweet as," "yeah nah" all cut).
- **Vocabulary rules** — a curated, *original* glossary (trimmed to ~30 everyday terms + 6 common Māori loanwords by Ben's direct review), written in our own words from cross-referencing free lists, not lifted from any copyrighted source.
- **Sentence structure rules** — contractions, tag questions ("eh"), shorter/more clipped sentences, rhetorical downplaying of achievements.
- **Example rewrites** — before/after pairs spanning casual and professional register, so the professional side never slips into inappropriate casual slang. This is the single most important part of the MVP — it's what testers will actually judge as "authentic vs forced."
- **Prompt templates**: a system prompt (for ChatGPT custom instructions / Claude Project / Gemini Gem) plus a "paste this first" plain-text fallback for anyone on a free tier without custom personas.

Build time estimate: a few focused hours to draft, using the linguistic-research rules and the free slang-list cross-references already gathered — not the multi-week corpus/engine effort from the earlier plan.

## Deliverable 2: Testing plan (1 week, 5-10 NZ testers)

- **Recruit**: 5-10 people from Ben's existing network. Mixed roles are still useful context to note per tester (e.g. whether they lean on it more for casual chat vs. work writing), but there's no separate pitch or version per role anymore — everyone gets the same general Kiwi Voice Pack.
- **Day 0**: Send each tester their unique app link (see Deliverable 3) + a short list of 5 tasks to try over the week (not contrived — pick tasks close to what they'd actually type: a client text, a social caption, a work email, a casual question, one free-choice task). No install steps needed — the link itself opens straight into the Kiwi-voiced chat.
- **Through the week**: Testers use the app directly for real work/life tasks, not a lab test — every message is captured automatically (Deliverable 3), no manual logging required of them.
- **Mid-week nudge**: A short check-in message (not a call, keep friction low) — "how's it going, anything felt off?"
- **End of week**: The in-app retention question fires automatically (Deliverable 3); optionally follow up with a short call for anyone whose transcript looks interesting either way.
- **What this gives us through the week**: real transcripts + timestamps captured passively, from which authenticity and "notice a difference" can be judged directly by reading the transcripts, and — the real signal — **actual usage frequency**, i.e. did they use it once and forget it, or reach for it unprompted across multiple days. No "would you pay" question at any point — stated willingness-to-pay is cheap and unreliable; behavior (did they keep coming back) is the real test.
- **The one killer end-of-week question**: *"If I took this away tomorrow, would you miss it?"* — Not at all / A little / Quite a bit / I'd be annoyed. This single question is the closest proxy to real demand this MVP can get without a live payment test.

## Deliverable 3: Feedback collection — revised to a thin logging web app

**Change from the original plan (2026-08-20 revision)**: a manual feedback form was the original design, but a form on top of actually using the tool is real added friction — realistically, close to zero testers would keep filling it in. Instead: build a minimal web app that testers use **as their chat interface directly** (they just type and get replies, like using ChatGPT normally) — the Kiwi Voice Pack system prompt is applied server-side and every message pair is logged automatically. This removes the compliance problem entirely: usage data is captured as a byproduct of testers just using the thing, not as a separate ask.

This is still a deliberately small build — one model, one simple chat UI, no accounts, no payments, no modules — not a reversion to the original full-engine plan.

**Architecture:**
- **Model**: single model only for the test (Claude, via the Anthropic API — good NZ-context quality, and it's the API Ben is already using elsewhere). No multi-provider switching for v0 — that was explicitly rejected as unnecessary MVP complexity.
- **Access**: unique per-tester link, no login — same pattern already proven in MarketingHub (`products/MarketingHub`) for scoped, no-auth access. All testers get the same general system prompt — no per-segment variants to route between anymore.
- **Consent**: one-time consent screen shown before first chat, gating access until acknowledged — copy: messages/responses are logged for product testing, don't paste real client/personal details. Consent timestamp stored per tester.
- **Data captured automatically**: every message + response pair, timestamped — this gives real usage-frequency data (distinct days active, message counts) without asking anyone to self-report it, which directly strengthens the Deliverable 2 "did they come back unprompted" signal.
- **End-of-week retention question**: surfaced in-app (e.g. a banner/modal after ~5-7 days of the tester's own usage) rather than a separate emailed survey — "If I took this away tomorrow, would you miss it?" with the four options, logged as one row per tester. This is the only explicit "feedback ask" testers get — everything else is passive.
- **Review**: Ben reviews transcripts directly (via Supabase table editor or a simple internal listing) rather than exporting a spreadsheet — no separate admin UI needed at this scale.

## Deliverable 3a: Infrastructure needed for the logging app

This crosses from zero-infra into minimal-but-real infra — worth being explicit about, since it's a deliberate (small) step up from the original plan, not scope creep:
- **Supabase**: reusing the existing "Research Agents" project (avoids a third project's ~$10/month add-on cost) with clearly `kiwi_`-prefixed tables, kept separate from that project's existing `interview-chat` work — `kiwi_testers` (slug, name, consent_given_at) and `kiwi_messages` (tester_id, role, content, created_at). Both created 2026-08-24, RLS enabled, no public policies (access only via the edge function's service role).
- **Git repo**: created and pushed to `github.com/ben-sears/Kiwi_Language_Pack`, local working copy at `products/kiwi-voice-pack`.
- **Hosting**: a simple deployed frontend (Vercel/Netlify-equivalent, whatever Ben's already using for MarketingHub) calling a Supabase Edge Function that holds the Anthropic API key server-side and assembles the system prompt per tester — the API key and prompt content must never reach the client, same reasoning as the original IP-protection concern, just achieved cheaply this time since it falls out of the architecture for free.
- **No GitHub Actions/CI, no Lovable-generated scaffold assumed** unless Ben wants to speed up the initial UI build with Lovable — the chat UI itself is simple enough (a message list + input box) to hand-build quickly without it, but Lovable is a reasonable option if Ben wants the visual polish done fast.

## Deliverable 4: Data collection strategy

- **What's actually collectable now (revised)**: since testers chat through our own app rather than pasting into their own ChatGPT/Claude/Gemini, every message and response is captured automatically and completely — this is a materially richer dataset than the original manual-paste plan, and removes reliance on testers remembering to log anything.
- **Permissions**: the in-app consent screen (Deliverable 3) is the permission mechanism — testers must acknowledge logging before their first message. Testers are also told directly not to paste real client names or identifying details, since anything they type is stored.
- **Privacy**: this counts as collecting personal information under NZ's Privacy Act 2020 (tester names/feedback) — keep collection minimal, store it somewhere ordinary (a spreadsheet is fine at this scale), and don't repurpose it beyond what testers consented to.
- **Usefulness toward a future dataset**: realistically modest — 5-10 people over a week produces directional, qualitative signal (which phrases read as authentic vs forced) but is far too small and uncontrolled to function as training data or a real corpus. Treat it as decision-making input, not as the seed of a proprietary dataset — that idea can be revisited only if Outcome C below is reached and at meaningfully larger scale with proper consent design.

## Deliverable 5: Decision framework

| Outcome | Signal | Action |
|---|---|---|
| **A — No signal** | Most testers used it once or twice then stopped; <40% rate authenticity 4-5/5; "would you miss it" answers cluster at "Not at all" | Stop. Park the idea, log learnings in memory, don't invest further time now. |
| **B — Mixed** | Some testers keep using it unprompted, most don't; "would you miss it" clusters at "A little"; authenticity ratings inconsistent across contexts (e.g. casual reads well but professional reads forced, or vice versa) | Improve the MVP only (deepen glossary, fix specific rules that read as forced), re-test with a slightly wider group. Do not build any software yet. |
| **C — Strong signal** | ≥60% rate authenticity 4-5/5, majority used it unprompted across multiple days, ≥3 testers answer "Quite a bit" or "I'd be annoyed" on the retention question | *Then* — and only then — run a real monetization test: sell the prompt pack itself (no app) to a wider list at a real price point. A stated "I'd pay" is not sufficient signal on its own; an actual purchase is. Only if that also succeeds does the original hosted-app architecture become worth revisiting. |

Objective, behavior-based thresholds are deliberately set above so the outcome isn't a judgment call after the fact, and isn't based on what testers say they'd do rather than what they actually did.

## Deliverable 6: Market validation assessment

- **Evidence of demand**: none found in prior research — no confirmed existing product doing dialect/slang persona injection for a national market. Absence of evidence isn't evidence of demand, though — it just means this MVP is the only way to find out.
- **Evidence of competition**: none direct. Adjacent-but-different categories exist (generic AI persona/custom-GPT tools, general localization/translation services) — none targeting authentic regional voice injection specifically.
- **Niche vs. standalone business**: Most likely outcome, honestly, is a niche/novelty product at consumer scale rather than a large standalone business — the more durable value is plausibly as a *feature* bundled into something else (e.g., an NZ business writing tool, or a module inside a broader product) rather than a platform on its own. This MVP is partly a test of that assumption too — if testers say "I'd pay for a standalone thing," that's a real update against this take.
- **What I'd test first as CTO**: exactly this — the smallest version that still produces reliable signal (one model, one simple chat UI, automatic logging) in front of real users doing real tasks, before spending anything on the harder problems. The earlier full-engine plan was solving problems (IP protection, module marketplace, corpus licensing) that only matter if demand is proven first.

## Verification

Two layers now that a small app exists:
- **App-level**: consent gate blocks chat until acknowledged; a test message round-trips through the Edge Function to Anthropic and back with the correct tester's framing applied; messages persist in Supabase; the API key/system prompt never appear in client-side network responses (check dev tools network tab directly, same check as the original plan's IP-protection concern).
- **Test-level**: success is measured by completing the one-week test with all 5-10 testers actually chatting (visible directly in the `messages` table — no self-reporting needed to confirm this part), and Ben having enough real transcript + retention-question data to place the result cleanly into the Outcome A/B/C table above.
