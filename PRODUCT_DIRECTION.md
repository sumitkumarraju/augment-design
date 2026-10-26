# AUGMENT product direction

## Recommendation

Turn AUGMENT into a **research-to-action workspace for builders and creators**.

Working name: **AUGMENT Context OS**

> Give AUGMENT a goal, a few sources, or a messy idea. It builds a cited brief, remembers the important context, and turns the result into an executable plan.

This is a better first product than an AI wearable or a general-purpose personal assistant. It keeps the existing human/machine-interface concept, but gives it a concrete job users can repeat every week.

## Why this direction fits the research

### 1. People are going deeper with AI, not just trying it

Menlo Ventures' 2026 consumer AI report says adoption rose only modestly while spending, daily usage, and agent usage grew sharply. The important users are people who use AI repeatedly and pay when it becomes part of their workflow.

**Implication for AUGMENT:** build a repeatable workflow, not another blank chat screen.

### 2. Specialized tools can live beside general assistants

Menlo reports that users increasingly keep multiple general assistants in their stack. A specialized product does not need to replace ChatGPT, Claude, or Gemini; it needs to own one job materially better.

**Implication for AUGMENT:** own the loop of `research → context → decision → next action`.

### 3. Trust is now a product feature

Menlo reports that accuracy, trustworthiness, and privacy rank ahead of ease of use when people choose AI tools. a16z's AI-native office research also found that research tools differentiate through source quality, structure, speed, and depth.

**Implication for AUGMENT:** show sources, preserve quotes, mark uncertainty, and require approval before an external action.

### 4. Broad agents are crowded; workflow surfaces are still valuable

a16z describes a split between horizontal agents and vertical workflow products. General agents have breadth, while specialists win through polish, customization, and reliability inside a specific workflow.

**Implication for AUGMENT:** start with one beautiful, narrow work surface for independent builders, researchers, and creators.

### 5. Hardware is a poor first step

The first wave of AI wearables showed that an attractive concept is not enough: battery life, reliability, privacy, cloud dependence, and unclear daily value can kill the product. Smart-glasses and biometric products also create additional consent, privacy, and regulatory complexity.

**Implication for AUGMENT:** make the interface feel like a future device, but ship it as dependable software first. Hardware can become an optional input layer later.

## Product concept

### The core user flow

1. **Set a mission** — “Compare the best database options for my SaaS,” “Research this market,” or “Turn these notes into a launch plan.”
2. **Add context** — paste URLs, upload PDFs, add notes, or connect a project folder.
3. **Choose a mode**:
   - **VISION** — extract and compare facts from sources.
   - **NEURAL** — explain tradeoffs and connect ideas to saved context.
   - **MOTION** — turn conclusions into tasks, checklists, drafts, or implementation steps.
4. **Review the result** — receive a structured brief with inline citations, confidence labels, and unresolved questions.
5. **Take action** — save the brief as a case record, export a plan, create tasks, or ask AUGMENT to draft the next artifact.
6. **Return later** — AUGMENT remembers the project decision, why it was made, and what is still open.

### The wedge

Do not market it as “an AI that can do anything.” Market it as:

**The command center for turning research into finished work.**

The first target customer should be an independent developer, designer, founder, or creator who regularly researches tools, markets, competitors, and implementation decisions.

## How the existing site becomes the product

| Current section | Working product surface |
| --- | --- |
| Hero / Module | Mission input: “What are you trying to move forward?” |
| Technology | Three operating modes: Vision, Neural, Motion |
| Augment One | Main workspace with context, live status, and current objective |
| Live Demo | Real research run: sources, progress, findings, and citations |
| Case Records | Saved projects, decisions, briefs, and open action items |
| Biotech | Connected inputs: URLs, files, notes, browser clipper, voice capture |
| Tiers | Free, Pro, and Team plans based on runs, storage, and collaboration |
| Final CTA | “Start a mission” with a real onboarding flow |

## MVP scope

### Version 1: useful without complex integrations

- A mission input and project creation flow.
- URL and text input.
- Source list with title, URL, excerpt, and retrieval status.
- AI-generated research brief with citations.
- “Ask this project” follow-up chat.
- Extracted facts, decisions, and open questions.
- Convert an item into a task or markdown export.
- Case-record history stored per project.
- Visible run states: queued, researching, reviewing, complete, needs input.
- User approval before any future external action.

### Do not build first

- Neural or biometric sensing.
- Medical, mental-health, or diagnostic claims.
- A custom wearable.
- An autonomous browser that can purchase, send, or publish without approval.
- A general social network.
- Ten integrations before the core research loop is useful.

## Suggested pricing

| Tier | User promise | Initial limit |
| --- | --- | --- |
| Core | Try the research-to-action loop | 5 missions/month, local project history |
| Advance | Use AUGMENT for weekly work | More runs, file uploads, saved context, exports |
| Prime | Make it a team operating layer | Shared case records, workspaces, approvals, integrations |

Keep the free tier because current AI usage data suggests users convert after a tool becomes part of their routine. Charge for repeated workflow value, storage, collaboration, and higher limits—not for decorative AI features.

## Differentiation checklist

AUGMENT should visibly do these things better than a general assistant:

- **Evidence first:** every important claim has a source and excerpt.
- **Context that persists:** remember decisions and project constraints, not just chat history.
- **Action without surprise:** suggest actions, then ask for approval.
- **A clear state machine:** users can see what the system is doing and why.
- **A calm interface:** dense information, but no noisy chat feed or fake futuristic controls.
- **Exportability:** markdown, PDF, tasks, and links remain usable outside AUGMENT.

## Product validation plan

Before building integrations, test three missions with 5–10 target users:

1. Compare three tools or technologies and make a recommendation.
2. Research a competitor or market and produce a cited brief.
3. Turn a messy project idea into an implementation plan.

Track:

- time from mission start to useful first result;
- citation accuracy and source usefulness;
- percentage of briefs exported or turned into tasks;
- whether users return to the same case record;
- whether users would pay to run the workflow again next week.

The strongest validation signal is not “the demo looked futuristic.” It is: **a user returns with a second mission because the first brief saved them real work.**

## Research sources

- [Menlo Ventures — 2026: The State of Consumer AI](https://menlovc.com/perspective/2026-the-state-of-consumer-ai/) — adoption depth, agent use, payment, trust, and use cases.
- [Andreessen Horowitz — The AI-Native Office Suite](https://a16z.com/the-ai-native-office-suite-can-ai-do-work-for-you/) — generalist vs. specialist products and benchmarks across research, notes, email, and documents.
- [Stanford HAI — 2026 AI Index](https://hai.stanford.edu/ai-index/2026-ai-index-report) — broader adoption and capability context.
- [J.P. Morgan — 2026 Tech Trends: The End of App Switching](https://www.jpmorganchase.com/content/dam/jpmorganchase/documents/technology/2026-tech-trends-the-end-of-app-switching.pdf) — agentic interfaces and the move from app navigation to intent.
- [EDPB — Statement on Smart Glasses](https://www.edpb.europa.eu/system/files/2026-10/20261310_edpb_statement_smart-glasses_en.pdf) — privacy and transparency considerations for camera, microphone, and biometric-adjacent hardware.

## Bottom line

Build **AUGMENT Context OS** as software first: a visually distinctive, source-grounded research and execution workspace. It is close enough to the current design to reuse most of the interface, specific enough to validate, and expandable later into browser capture, voice, coding context, and optional wearable inputs.
