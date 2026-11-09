# Stampcraft Shores

Kids island-building game: explore gentle shores → earn **transparent stamps** (never gacha) → unlock build pieces → decorate a **6×6** shore → tour friend islands, leave stickers, join a weekly showcase, and share an island link.

Live: https://stampcraft-shores.vercel.app

## Run

```bash
npm install
npm run dev
npm run build
```

## Core loop

1. **Explore** — six short tap shores with fixed stamp payouts + daily bonuses (1 / 3 / 5)
2. **Album** — ledger of eight stamp types; spend stamps to unlock 16 pieces (costs shown up front)
3. **Build** — place/remove modes on a 6×6 grid; name your island; clear without losing stamps
4. **Visit** — tour five friend shores, guestbook stickers (no chat), weekly Showcase (+Moon), shareable shore codes/links

Progress saves in `localStorage` (`stampcraft-shores-v2`).

## Share codes

Island links use a hash like `#shore=SC2.My%20Shore.a23...`. Opening a link shows a preview; the player can load the layout locally.
