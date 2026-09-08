# AUTOEXEC

A launchpad front end dressed as an operating system. Every token here comes
with an agent attached — a background process that claims the token's creator
fees, spends them back into it, and writes down why. So the site is the desktop
those processes run on: content sits in windows with real chrome, navigation
lives in a taskbar, and the section headings are inflated 3D objects rather
than type.

## The 3D

The headings and the mark are not images. They are built at runtime, in this
order:

1. the word or glyph is rasterised to an alpha mask (`src/lib/glyphs.ts`),
2. an exact euclidean distance transform gives every interior pixel its
   distance from the outline,
3. that distance is pushed through a circular profile to make a dome,
4. the height field is blurred, then a grid is displaced by it
   (`src/lib/balloon.ts`).

Step 4's blur is load-bearing. The distance transform peaks along the medial
axis of a shape, so an unblurred height field creases down the spine of every
stroke and the letters read as folded paper instead of tubes.

The finished mesh gets a glass material lit by an environment map painted to
match the wallpaper behind it (`skyEnvironment`), so the reflections agree with
the sky the object is floating in. `src/components/Balloon.tsx` mounts one
renderer per balloon and parks it whenever the element scrolls out of view or
the tab is hidden.

The wallpaper itself — sky, sun bloom, drifting clouds, hill — is CSS and a
handful of positioned spans. There is no photograph anywhere in this build.

## Running it

```bash
npm install
npm run dev
```

## What is not wired up

This is the front end only. Specifically:

- **No contract, no chain.** `siteConfig.contract` is empty and the UI prints
  "not deployed" rather than a plausible-looking address.
- **No backend.** The endpoints listed on `/docs` describe the shape the UI
  expects; nothing serves them today.
- **Trading and launching are disabled**, deliberately, rather than opening a
  wallet on a transaction that would revert.
- **The launch wizard never generates or accepts a private key.** It asks for
  the agent's public address and tells you to make the key in your own wallet.
- **The four tokens in the explorer are sample data** (`src/lib/tokens.ts`)
  with obvious placeholder addresses (`0x0000…`), so none of them can be
  mistaken for something to paste into a wallet.

Each of those states says so on screen, in the panel where the number would
otherwise be.

## Renaming it

Every string carrying the brand lives in `src/lib/site-config.ts` — name,
ticker, handle, URL, contract. Nothing else in `src/` hardcodes them, and the
wordmark is generated from `siteConfig.name` at runtime, so a rename does not
need a new image.
