# JLPT N3 Trainer

A personal study tool for JLPT N3 kanji and grammar, combining a spaced-repetition
review engine with content sourced from jlptbenkyo.com and WaniKani.

See [CONTEXT.md](./CONTEXT.md) for the domain model (Item, SRS Stage, Lesson,
Review, Exam, Burn, etc.) and `docs/adr/` for architecture decisions.

## Study modes

- **Lesson** — introduces new items in Lesson Groups of up to 4, interleaving
  kanji and grammar.
- **Review** — presents items whose SRS interval is due; a wrong answer drops
  the item back one stage.
- **Exam** — on-demand review of every Mature item; a wrong answer resets the
  item to Apprentice 1, a correct answer offers the option to Burn it.

Kanji are tested with typed recall (meaning + onyomi); grammar is tested with
JLPT-style multiple choice against hand-curated confusable distractors.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run scrape:kanji` | Scrape kanji content from source sites |
| `npm run scrape:grammar` | Scrape grammar content from source sites |

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Vitest, Oxlint. Deployed via
Firebase Hosting.
