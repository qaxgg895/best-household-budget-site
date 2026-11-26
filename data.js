// Hearth Ledger — seeded household data (fictional household, original figures).
// All money is USD. Transactions drive every total on the site, so the
// dashboard, budgets and ledger can never disagree with each other.

const HOUSEHOLD = {
  name: 'The Alvarez household',
  members: 'Maya & Daniel Alvarez, with Sofia (9) and Leo (6)',
  currency: 'USD',
  monthNote: 'November 2026 · figures through 26 November',
};

const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#2f6f4f' },
  { id: 'groceries', label: 'Groceries', color: '#7a9a3d' },
  { id: 'utilities', label: 'Utilities', color: '#3d7a8c' },
  { id: 'transport', label: 'Transport', color: '#8c6d3d' },
  { id: 'dining', label: 'Dining out', color: '#b4552d' },
  { id: 'entertainment', label: 'Entertainment', color: '#7d5ba6' },
  { id: 'health', label: 'Health', color: '#a63d5f' },
  { id: 'kids', label: 'Kids & school', color: '#4d7ab8' },
  { id: 'clothing', label: 'Clothing', color: '#5f8a6a' },
  { id: 'subscriptions', label: 'Subscriptions', color: '#6b7280' },
  { id: 'other', label: 'Other', color: '#9a8a6b' },
  { id: 'savings', label: 'Savings', color: '#2f6f4f' },
];

// Planned budget for November 2026, per category (USD).
const BUDGETS_NOV = {
  housing: 1850, groceries: 720, utilities: 240, transport: 310,
  dining: 220, entertainment: 150, health: 180, kids: 260,
  clothing: 120, subscriptions: 85, other: 150, savings: 900,
};

// Monthly totals for Jun–Sep 2026 (before the transaction ledger starts).
const HISTORY = [
  { month: '2026-06', label: 'Jun', income: 6850, spent: 4920, saved: 900 },
  { month: '2026-07', label: 'Jul', income: 6850, spent: 5110, saved: 900 },
  { month: '2026-08', label: 'Aug', income: 6850, spent: 4780, saved: 900 },
  { month: '2026-09', label: 'Sep', income: 6850, spent: 5240, saved: 900 },
];

// [date, description, category, amount, kind]
// kind: 'income' | 'expense' | 'transfer' (transfer = money moved to savings)
const TRANSACTIONS = [
  // ---- October 2026 ----
  ['2026-10-01', 'Maya — salary', 'income', 3900.00, 'income'],
  ['2026-10-01', 'Daniel — salary', 'income', 2950.00, 'income'],
  ['2026-10-01', 'Rent — Maple Street apartment', 'housing', 1850.00, 'expense'],
  ['2026-10-01', 'Auto-transfer to savings', 'savings', 900.00, 'transfer'],
  ['2026-10-01', 'Music streaming', 'subscriptions', 10.99, 'expense'],
  ['2026-10-02', 'Cloud storage', 'subscriptions', 2.99, 'expense'],
  ['2026-10-03', 'GreenMart weekly shop', 'groceries', 128.40, 'expense'],
  ['2026-10-04', 'Electric bill', 'utilities', 91.20, 'expense'],
  ['2026-10-05', 'Video streaming', 'subscriptions', 15.49, 'expense'],
  ['2026-10-05', 'Fuel — Shell', 'transport', 46.90, 'expense'],
  ['2026-10-06', 'Water bill', 'utilities', 39.80, 'expense'],
  ['2026-10-06', 'School lunch — October', 'kids', 62.00, 'expense'],
  ['2026-10-08', 'Pizza night — Tony’s', 'dining', 44.60, 'expense'],
  ['2026-10-09', 'Concert tickets — family show', 'entertainment', 96.00, 'expense'],
  ['2026-10-09', 'News subscription', 'subscriptions', 9.99, 'expense'],
  ['2026-10-10', 'GreenMart weekly shop', 'groceries', 97.25, 'expense'],
  ['2026-10-11', 'Pharmacy — cold medicine', 'health', 31.40, 'expense'],
  ['2026-10-12', 'Internet bill', 'utilities', 65.00, 'expense'],
  ['2026-10-12', 'Bike repair — Leo’s bike', 'other', 74.00, 'expense'],
  ['2026-10-13', 'Piano lesson — Sofia', 'kids', 90.00, 'expense'],
  ['2026-10-13', 'Fuel — Shell', 'transport', 51.30, 'expense'],
  ['2026-10-14', 'Winter coats — kids', 'clothing', 148.00, 'expense'],
  ['2026-10-15', 'Sushi — date night', 'dining', 58.20, 'expense'],
  ['2026-10-17', 'GreenMart weekly shop', 'groceries', 141.80, 'expense'],
  ['2026-10-17', 'Gym membership', 'subscriptions', 29.00, 'expense'],
  ['2026-10-18', 'Cinema — family film', 'entertainment', 32.00, 'expense'],
  ['2026-10-19', 'Gas bill', 'utilities', 41.15, 'expense'],
  ['2026-10-20', 'Metro card top-up', 'transport', 52.00, 'expense'],
  ['2026-10-20', 'Art supplies — Sofia', 'kids', 28.40, 'expense'],
  ['2026-10-21', 'Doctor visit — copay', 'health', 120.00, 'expense'],
  ['2026-10-22', 'Thai takeaway', 'dining', 36.75, 'expense'],
  ['2026-10-23', 'Socks & basics', 'clothing', 32.60, 'expense'],
  ['2026-10-24', 'GreenMart weekly shop', 'groceries', 118.60, 'expense'],
  ['2026-10-24', 'Plumber — kitchen tap', 'other', 210.00, 'expense'],
  ['2026-10-25', 'Board game — family night', 'entertainment', 24.99, 'expense'],
  ['2026-10-26', 'Fuel — Shell', 'transport', 44.75, 'expense'],
  ['2026-10-27', 'GreenMart top-up shop', 'groceries', 74.30, 'expense'],
  ['2026-10-27', 'School field trip — Leo', 'kids', 35.00, 'expense'],
  ['2026-10-28', 'Burgers — after soccer', 'dining', 71.40, 'expense'],
  ['2026-10-29', 'Parking — downtown', 'transport', 22.00, 'expense'],
  ['2026-10-30', 'GreenMart weekly shop', 'groceries', 86.45, 'expense'],

  // ---- November 2026 (through 26 Nov) ----
  ['2026-11-01', 'Maya — salary', 'income', 3900.00, 'income'],
  ['2026-11-01', 'Daniel — salary', 'income', 2950.00, 'income'],
  ['2026-11-01', 'Rent — Maple Street apartment', 'housing', 1850.00, 'expense'],
  ['2026-11-01', 'Auto-transfer to savings', 'savings', 900.00, 'transfer'],
  ['2026-11-01', 'Music streaming', 'subscriptions', 10.99, 'expense'],
  ['2026-11-02', 'Cloud storage', 'subscriptions', 2.99, 'expense'],
  ['2026-11-02', 'GreenMart weekly shop', 'groceries', 142.30, 'expense'],
  ['2026-11-03', 'Electric bill', 'utilities', 86.40, 'expense'],
  ['2026-11-04', 'Fuel — Shell', 'transport', 48.20, 'expense'],
  ['2026-11-05', 'Video streaming', 'subscriptions', 15.49, 'expense'],
  ['2026-11-05', 'Water bill', 'utilities', 42.10, 'expense'],
  ['2026-11-06', 'Pizza night — Tony’s', 'dining', 38.50, 'expense'],
  ['2026-11-07', 'GreenMart weekly shop', 'groceries', 96.40, 'expense'],
  ['2026-11-07', 'School lunch — November', 'kids', 62.00, 'expense'],
  ['2026-11-08', 'Cinema — family film', 'entertainment', 34.00, 'expense'],
  ['2026-11-09', 'GreenMart top-up shop', 'groceries', 58.75, 'expense'],
  ['2026-11-09', 'News subscription', 'subscriptions', 9.99, 'expense'],
  ['2026-11-10', 'Fuel — Shell', 'transport', 45.60, 'expense'],
  ['2026-11-10', 'Pharmacy — vitamins', 'health', 24.60, 'expense'],
  ['2026-11-11', 'Metro card top-up', 'transport', 52.00, 'expense'],
  ['2026-11-12', 'Internet bill', 'utilities', 65.00, 'expense'],
  ['2026-11-12', 'Hardware store — light bulbs', 'other', 36.40, 'expense'],
  ['2026-11-13', 'Sushi — date night', 'dining', 52.75, 'expense'],
  ['2026-11-14', 'GreenMart weekly shop', 'groceries', 121.90, 'expense'],
  ['2026-11-14', 'Piano lesson — Sofia', 'kids', 90.00, 'expense'],
  ['2026-11-15', 'Thai takeaway', 'dining', 27.40, 'expense'],
  ['2026-11-16', 'GreenMart top-up shop', 'groceries', 44.20, 'expense'],
  ['2026-11-16', 'Kids’ shoes — Leo', 'clothing', 64.99, 'expense'],
  ['2026-11-17', 'Fuel — Shell', 'transport', 47.85, 'expense'],
  ['2026-11-17', 'Gym membership', 'subscriptions', 29.00, 'expense'],
  ['2026-11-18', 'Gas bill', 'utilities', 38.25, 'expense'],
  ['2026-11-19', 'Film rental — movie night', 'entertainment', 12.99, 'expense'],
  ['2026-11-20', 'Burgers — after soccer', 'dining', 61.20, 'expense'],
  ['2026-11-21', 'GreenMart weekly shop', 'groceries', 133.60, 'expense'],
  ['2026-11-21', 'Dentist — check-up copay', 'health', 85.00, 'expense'],
  ['2026-11-22', 'Board game — family night', 'entertainment', 28.50, 'expense'],
  ['2026-11-23', 'Soccer club fee — Leo', 'kids', 45.00, 'expense'],
  ['2026-11-23', 'Parking — downtown', 'transport', 18.00, 'expense'],
  ['2026-11-24', 'GreenMart top-up shop', 'groceries', 87.15, 'expense'],
  ['2026-11-24', 'Birthday gift — grandma', 'other', 25.00, 'expense'],
  ['2026-11-25', 'Ramen — lunch out', 'dining', 44.90, 'expense'],
];

const GOALS = [
  { id: 'emergency', title: 'Emergency fund', target: 12000, saved: 8450,
    note: 'Six months of essentials, kept in a high-yield savings account.' },
  { id: 'lisbon', title: 'Summer trip — Lisbon', target: 3200, saved: 1875,
    note: 'Flights, a flat in Alfama and pasteis de nata for four.' },
  { id: 'car', title: 'New family car', target: 15000, saved: 4200,
    note: 'Trading in the 2016 hatchback for a used hybrid estate.' },
];

const TIPS = [
  { title: 'Pay yourself first', body: 'Move savings out on payday, before anything else has a chance to spend it. This household auto-transfers $900 on the 1st — it is a bill, not a leftover.' },
  { title: 'Give every dollar a job', body: 'Income minus planned spending should be zero. If $1,665 is still unassigned, assign it — to a goal, an extra debt payment, or next month’s buffer — instead of letting it drift.' },
  { title: 'Track the small leaks', body: 'Five subscriptions add up to $68.46 a month. Once a quarter, list every recurring charge and cancel the ones nobody used in the last 30 days.' },
  { title: 'Budget groceries weekly', body: 'A weekly shop with a list beats one big monthly run. This household’s November grocery spend is $684.30 of a $720 budget — on track because the list is written before the shop.' },
  { title: 'One over-budget category is a signal, not a failure', body: 'Dining out is $4.75 over budget in November. Move the difference from a category with room — Entertainment has $74.51 left — and carry on.' },
  { title: 'Keep a one-month buffer', body: 'When this month’s spending is covered by last month’s income, a late paycheck stops being an emergency. Build the buffer $200 at a time.' },
  { title: 'Review together, weekly', body: 'Fifteen minutes every Sunday: check the week’s spending, move money between envelopes, and agree next week’s plan. Budgets fail quietly when only one person watches them.' },
  { title: 'Round down windfalls', body: 'A refund, a rebate, a birthday cheque — send at least half straight to a savings goal before it feels like spending money.' },
];

const HABITS = [
  'Checked the budget this week',
  'Wrote a shopping list before the weekly shop',
  'Cooked at home five nights or more',
  'Moved savings on payday',
  'Reviewed subscriptions this quarter',
  'Had the Sunday money chat together',
];
