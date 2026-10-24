# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm run start    # Run production build locally
```

No test suite is configured. Quality gates: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Stack

- **Next.js 16** (App Router) — React 19, TypeScript strict mode
- **Tailwind CSS v4** with OKLch color space (not hex/rgb)
- **shadcn/ui** backed by `@base-ui/react` for unstyled primitives
- **Lucide React** for icons
- Path alias: `@/*` → project root

## Architecture

Polish tennis portal (zkortu.pl). Data comes from two sources, both wrapped in `lib/`:

- **Sanity CMS** (`lib/sanity.ts`, schema in `sanity/schemaTypes/`): articles, tags, tournament calendar, videos, info pages, site settings, comments. Project `g3425kho`, dataset `production` (public reads). Reads use `perspective: "published"` and Next fetch cache with tags; `/api/revalidate` is the Sanity webhook target.
- **API-Tennis** (`lib/api-tennis.ts`): rankings (`get_standings`), live scores (`get_livescore`), fixtures (`get_fixtures`), tournament index. The API returns HTTP 200 with `{"error":"1","result":[{msg,cod}]}` on auth failures; `apiFetch` detects that and throws `ApiTennisError`. Never pass `result` through unchecked.
- There is no mock data. Empty/error states are rendered by `components/site/States.tsx`.

**Tournament strategy:** the season calendar is curated in Sanity (`tournament` docs). It is filled by `scripts/import-calendar.ts` (WTA official JSON + ESPN hidden API for ATP, enriched with API-Tennis keys/surfaces) or by the hand-made `scripts/seed-tournaments.mjs`. API-Tennis enriches it at runtime: `matchTournamentInIndex` matches a Sanity tournament to API `tournament_key`s by name/city with Polish city aliases (override via `apiTournamentKey`), `fetchTournamentMatches` pulls fixtures for the date window. The homepage and `/kalendarz` both read Sanity. atptour.com is Cloudflare-protected; do not scrape it at request time.

**API-Tennis quirks verified on live data:** numeric keys, `stat_won` as number, `event_live: "1"` also on finished matches (check status before live flag), rounds prefixed with the tournament name ("ATP Basel - Semi-finals"), set scores with tiebreak points appended ("77" = 7 games, 7 tiebreak points), daily fixtures across all levels exceed Next's 2 MB fetch-cache limit (fetched per event type for ATP/WTA).

**Routing** (Polish URLs): `/`, `/aktualnosci`, `/aktualnosci/[id]` (slug), `/tag/[tag]`, `/wyniki-live`, `/ranking` (`?tour=wta`), `/kalendarz` (`?t=<id>` opens a tournament sheet), `/wideo`, `/kontakt`, `/strona/[slug]`, `/studio`. `/tenis-juniorski` is redirected to `/` until launch.

**API routes:** `rankings`, `livescores`, `matches?date=`, `calendar`, `tournaments/[id]/matches`, `comments` (GET/POST with honeypot + rate limit, moderation via `approved`), `contact` (Resend), `revalidate`.

**Component split:** pages are server components; interactive parts are co-located client components (`RankingExplorer`, `LiveScoresClient`, `CalendarClient`, `NewsExplorer`, `Comments`). Shared UI lives in `components/site/` (header, footer, cards, badges, states, ticker). Pages that read query params use `useSearchParams` inside a `Suspense` boundary.

**Data shapes** are in `lib/types.ts` (`Player`, `LiveMatch`, `Tournament`, colour maps). Country names → ISO codes, flags and Polish names come from `lib/countries.ts` (`Intl.DisplayNames`, no hand-written country list).

## Styling Conventions

- Brand colour is orange `#ee8232` = `--brand` (`oklch(0.714 0.16 52.8)`); dark surfaces and text use `--ink` (warm near-black). Header and footer are orange with ink text (white on orange fails WCAG contrast).
- Tailwind v4 tokens are exposed as `bg-brand`, `text-ink`, `bg-brand-soft`, `text-live`, etc. (see `app/globals.css`). Do not reintroduce the old green palette.
- `cn()` from `lib/utils.ts` for class merging; `.anim-*` entrance animations respect `prefers-reduced-motion`.

## Localization

Everything is Polish (`pl-PL`). Use helpers in `lib/format.ts` (`formatDate`, `formatDateRange`, `timeAgo`, `pluralPl`). Tennis terms stay English where customary (ATP, WTA, set, break point); surfaces are translated via `surfaceLabels`.

## Images

Only `cdn.sanity.io` and YouTube thumbnails are allowed in `next.config.ts`. Use `components/site/CoverImage.tsx` (Sanity image via `lib/sanity-image.ts`, placeholder fallback). No stock/placeholder photo services.

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
