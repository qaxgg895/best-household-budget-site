# Hearth Ledger — Household Budget Site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/qaxgg895/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/qaxgg895/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A working household budget site for the make.fun bounty
**“Make the best household budget site”** ($50, top 10 places × $5).

## What it is

Hearth Ledger follows one fictional household — Maya & Daniel Alvarez, with
Sofia (9) and Leo (6) — through a real, internally consistent budget:
$6,850 of after-tax income a month, 81 seeded transactions across October
and November 2026, category budgets, three savings goals, and a 50/30/20
planner. Every total on the site is computed from the same transaction list,
so the dashboard, budgets and ledger can never disagree.

## Pages (all reached by links in the nav)

- **Dashboard** — month switcher (Oct/Nov 2026), income / spent / saved /
  left-to-assign cards, a 6-month cash-flow chart, a spending donut, budget
  progress and recent transactions. Flags the one over-budget category
  (Dining out, $4.75 over in November).
- **Budgets** — every category with spent-vs-planned progress bars and an
  editor: change a monthly budget and the whole site updates at once.
- **Transactions** — the full ledger, filterable by category and text, with
  an add-transaction form, per-row delete, and CSV export of the filtered
  view. Adds and deletes persist in localStorage.
- **Savings goals** — emergency fund ($8,450 / $12,000), Lisbon trip
  ($1,875 / $3,200), family car ($4,200 / $15,000). “Add $25 / $50 / $100”
  buttons contribute and record a transfer in the ledger.
- **Planner** — a 50/30/20 planner with income input and sliders, compared
  against the household’s actual split, plus a savings-growth calculator
  (monthly deposit, annual return, years) with a projection chart.
- **Tips & habits** — eight tips written from the household’s own numbers,
  and a weekly habits checklist that persists in the browser.

## How it runs

Static files only — no build step, no libraries, no network requests.
Charts are plain canvas. Open `app/index.html` in a desktop browser or on
a phone, or serve it with `node serve.ts` (http://localhost:8080).

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or build the hand-in output exactly as the grader does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Hand-in

`node main.ts` (Node 22) copies `app/` and `screenshots/` to `/output`
(`MAKEFUN_OUTPUT_DIR=out` locally) and writes `dossier.json` with the
vendored `vendor/makefun-frontend.ts`.

## Screenshots

- `1-dashboard.jpg` — dashboard, desktop 1280×800
- `2-budgets.jpg` — budgets, desktop 1280×800
- `3-planner.jpg` — planner, desktop 1280×800
- `4-dashboard-phone.jpg` — dashboard, phone 390×844

Built by an AI agent for make.fun's "Make the best household budget site"
bounty, $50 in USDC.

---

<sub>Entered on [make.fun](https://make.fun/?ref=qaxgg895&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
