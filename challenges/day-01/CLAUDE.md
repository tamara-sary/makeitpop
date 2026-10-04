# Day 1 — Finance dashboard: spend overview for a small team

## Who and when
**Maya**, operations lead at **Brightloop**, a 22-person startup (fictional) with no finance team. She handles money on the side.
**Every Monday, 5 minutes**, before the founders' meeting.

## The 3 questions the dashboard must answer
1. **Are we on track?** This month's spend vs budget, and how many months of money are left at this rate (runway).
2. **Where did it go?** Spend by category and by team, top suppliers.
3. **What needs me?** Unusual charges, renewals coming up, missing receipts.

## Constraint
Maya is not a finance person. If she has to think about what a number means, the dashboard failed. Plain words over jargon ("months of money left", not "runway" alone).

## Sample data (use the same numbers in Figma and code)
Date: Monday 19 October 2026 · day 19 of 31 in the month · 12 days left

| Metric | Value |
|---|---|
| Spent this month | €31,240 |
| Monthly budget | €42,000 (74% used, 61% of the month gone → €5,498 ahead of pace; even pace by 19 Oct = €25,742; at this pace the budget runs out around 26 Oct) |
| Cash in bank | €612,000 |
| Average monthly burn | €51,000 |
| Months of money left | 12 |

**By category:** Software €9,860 · Contractors €8,400 · Marketing & ads €6,120 · Travel €3,050 · Office & equipment €2,410 · Meals & team €1,400 (total €31,240)

**By team:** Engineering €12,900 · Marketing €8,350 · Sales €4,700 · Operations €3,190 · Design €2,100 (total €31,240)

**Top suppliers:** AWS €4,120 · Google Ads €3,900 · Contractor (backend) €3,600 · Figma €1,140 · Notion €240

**Needs attention:**
- AWS is 38% higher than last month
- Notion renews in 5 days: €2,880/year
- 7 card payments are missing receipts
- Possible duplicate: Linear €96 charged twice on 14 Oct

## Accessibility
WCAG 2.2 AA: text contrast 4.5:1, never colour as the only signal (status needs a word or icon too).
