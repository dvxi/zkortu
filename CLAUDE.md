# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Run production build locally
```

No test suite is configured.

## Stack

- **Next.js 16** (App Router) — React 19, TypeScript strict mode
- **Tailwind CSS v4** with OKLch color space (not hex/rgb)
- **shadcn/ui** backed by `@base-ui/react` for unstyled primitives
- **Lucide React** for icons
- Path alias: `@/*` → project root

## Architecture

This is a Polish tennis portal (zkortu.pl) — a fully static POC with no backend. All data lives in `lib/mock-data.ts` (~850 lines of typed mock data + TypeScript interfaces). When adding real data fetching, replace the mock exports there.

**Routing** (Polish-language URLs):
- `/` — Homepage: hero, live ticker, news grid, rankings preview, tournament cards
- `/aktualnosci` — News listing with client-side search/filter; `[id]` — article detail
- `/wyniki-live` — Live match results with sidebar + detail stats panel (client state)
- `/ranking` — ATP/WTA/Junior rankings with tabs and tour switcher
- `/kalendarz` — Calendar with grid and list views, day detail sidebar
- `/tenis-juniorski` — Junior rankings and news (server component, no `"use client"`)
- `/wideo` — Video gallery linking to YouTube searches
- `/kontakt` — Contact form with FAQ accordion

**Data shapes** (`lib/mock-data.ts`):
- `Player`, `LiveMatch`, `NewsArticle`, `Tournament`, `Video` — the core interfaces
- `surfaceColors`, `categoryColors` — Tailwind class maps for surface/category badges
- `atpPlayers`, `wtaPlayers`, `liveMatches`, `newsArticles`, `tournaments`, `videos` — mock arrays

**Component split pattern**: pages are server components by default; interactive pieces (filters, forms, state) are extracted into separate client components co-located with the page (e.g., `aktualnosci/[id]/ReadingProgress.tsx`, `aktualnosci/[id]/ClientShare.tsx`).

## Styling Conventions

- Colors use OKLch: brand green `oklch(0.17 0.05 155)`, gold `oklch(0.71 0.19 34)`, live-red `oklch(0.60 0.22 28)`
- Custom utility classes defined in `app/globals.css`: `text-brand`, `text-gold`, `bg-brand`, `bg-gold`, `border-gold`, etc.
- Animation delay utilities: `.anim-delay-1` through `.anim-delay-5` (80ms increments)
- All entrance animations respect `prefers-reduced-motion`
- `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional/merged classnames

## Localization

Everything is in Polish (`pl-PL`). Use `toLocaleDateString("pl-PL", {...})` for dates. Month names, day names, and all UI copy are Polish. Maintain this convention when adding content.

## Images

External sources are whitelisted in `next.config.ts`: `images.unsplash.com` and `picsum.photos`. Use `picsum.photos/seed/{id}/{w}/{h}` for consistent placeholder images.

<!-- Appended to each project repo's CLAUDE.md by scripts/install_project.sh.
     Assumes hq lives at ~/hq. Edit the goal-file path below if your slug differs. -->

## HQ portfolio integration

This repo is wired into the HQ orchestration system (`~/hq`). Follow these rules.

### Start of any non-trivial session
- Read this project's goal file: `~/hq/goals/zkortu.md`. It is the source of
  truth for WHY work happens here.
- Read the 5 most recent ADRs for this project:
  `ls -t ~/hq/decisions/zkortu/*.md | head -5`.

### When a session produces a non-trivial choice
A non-trivial choice = new dependency, schema change, architectural pattern,
new external service, or a pricing/limit/quota assumption.
- Draft an ADR from `~/hq/templates/adr.md` into `~/hq/decisions/zkortu/` with the
  next 4-digit number, status `proposed`.
- Tell Szymon in one line so he can approve (flip to `accepted`) or discard.
- Do not silently accept your own ADRs.

### Task graphs
- Use `bd` (Beads) in this repo for any task graph that outlives the session.
- Use Claude Code native Tasks for within-session work only.

### Linear (human-meaningful commitments)
- If the session's work corresponds to a Linear issue (an ID given directly, or
  supplied by `/work`), reference it in commit messages (e.g. `AUD-42: ...`) and
  post a short completion comment to the issue via the Linear MCP.
- If you're doing human-meaningful work that has no issue, suggest `/capture` —
  never create Linear issues silently.

### Data boundaries (non-negotiable)
- Never send file contents from paths listed in `.agentignore` (or from any repo
  marked `sensitivity: restricted` in its goal file) to any tool or external
  service. Stop and ask Szymon instead.
- The same rule in reverse for Linear: never paste client code, client data, or
  contract text into a Linear issue or comment. Neutral titles and descriptions
  only.


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
