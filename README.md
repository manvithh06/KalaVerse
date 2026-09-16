# Kalaverse

**Culture on Their Terms.** The digital ownership and consent layer for cultural tourism.

> The tourist chooses the experience. The custodian chooses the terms.

A working frontend prototype. Custodians of Tulunadu and coastal Karnataka decide how their culture is represented, experienced, protected and monetised, and visitors enter only on those terms. There is no backend: all state lives in the browser and survives refreshes.

## Run it

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open http://localhost:3000. For a production build:

```bash
npm run build
npm start
```

Demo state is saved in `localStorage` under `kalaverse-demo`. Use **Reset demo data** in the footer (or the custodian sidebar) before presenting.

## The 3-minute demo

1. **Home.** Scroll past the hero to *Culture is not content* and *We begin with the custodian.*
2. Click **Explore Karnataka**.
3. Open **Yakshagana — Beyond the Stage**.
4. Point to the **Cultural Consent Card**: GUIDED, photography and video not allowed, maximum group of 10.
5. **Continue to book**, then on *Enter with respect* tick the four commitments and press **I agree & book**.
6. The confirmation shows booking **CST-2026-1042** and **₹1,350 → Custodian**. Press **Switch to custodian mode**.
7. The dashboard (*Your culture. Your rules.*) shows earnings up by ₹1,350 and a new-booking notification.
8. **Create experience** → **Fill with an example** → choose **PROTECTED** → **Publish with my terms**.
9. Press **Check visitor discovery**. A notice shows a practice was removed from public discovery, and the new practice is not listed.
10. Say: *Preservation doesn't always mean putting culture online.*
11. Open **AI Assistant**. The draft conflicts with the no-photography rule. Press **Reject** → *Rejected by custodian*.
12. Open **Governance**, press **Walk a listing through review** (Custodian → Community Review → Approval → Publish), then **Attempt override**, which is refused.

Close on the homepage's final screen: *The tourist chooses the experience. The custodian chooses the terms.*

## Rules enforced in code

| Rule | Where |
| --- | --- |
| Protected experiences never appear in discovery | `isDiscoverable` in `lib/consent.ts`, used by every visitor list |
| Protected experiences cannot be booked | `isBookable` checked again inside `bookExperience` in `store/kalaverse.ts` |
| Protected content cannot be described by AI | `canUseAI`; `generateAIDraft` and `decideAI` refuse protected items |
| AI text needs approve, edit or reject | `components/ai/ai-veto-panel.tsx`; nothing is published on generate |
| Custodians control price, schedule, group size, rules, access and description | Create/edit form, consent manager, My Culture |
| Admins cannot override protection | No admin action exists; the governance and admin pages show the refusal |
| Bookings update custodian earnings | `bookExperience` writes a transaction and a notification |
| Visitors accept the custodian's terms before booking | `RESPECT_PLEDGES`, validated in the store as well as the UI |

Changing an experience from GUIDED to PROTECTED removes it from discovery immediately. Releasing it back needs the custodian to confirm community consent.

## Screens

**Visitor:** `/` home · `/discover` search and filters · `/experiences/[id]` detail and consent card · `/experiences/[id]/book` enter with respect · `/experiences` bookings and saved · `/crafts` · `/impact` · `/custodians/[id]` public profile · `/register` custodian onboarding · `/governance` · `/admin`

**Custodian:** `/custodian` dashboard · `/custodian/culture` boundary map · `/custodian/experiences` (+ `new`, `[id]/edit`) · `/custodian/consent` · `/custodian/vault` · `/custodian/ai` · `/custodian/earnings` · `/custodian/governance` · `/custodian/profile`

## Project structure

```
app/                  routes: (site) for visitors, custodian/ for the workspace
components/ui         shadcn-style primitives on Radix (button, dialog, sheet, switch, tabs…)
components/consent    consent card, access badge and selector, consent fields
components/cultural   illustrated plates, ornaments, trust badges, loading/empty states
components/home       homepage storytelling sections
components/dashboard  custodian workspace screens
components/…          booking, discovery, experience, ai, vault, governance, economics, crafts
data/                 fictional custodians, experiences, products, seed activity
lib/                  consent rules, economics, availability, AI drafting, stats, utils
store/                Zustand store persisted to localStorage, hooks
types/                domain model
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Radix primitives in the shadcn/ui pattern · Framer Motion · Zustand · Lucide.

## Content and cultural respect

- Every custodian, booking and figure is fictional demo data.
- Cultural descriptions are deliberately general. Nothing sacred, secret or ritual is described.
- Daivaradhane and all protected practices appear only as abstract visuals and labels.
- Illustrated plates are the fallback for every visual. Where `data/photos.ts` holds a photograph for a practice, craft or product, that photo is shown instead. Protected practices have none and never will.
- Those photos are loaded from Bing image links for the prototype only. Get permission from the photographers, or swap in your own pictures, before publishing anything. A platform about consent should not publish real people's likenesses without it.
