# Fern & Frond

A light, watercolor botanical atlas for **https://3e3dev.github.io/fern-atlas/**.

Plain HTML, CSS, and JavaScript. No build step, framework, backend, analytics, remote fonts, or runtime package dependencies. GitHub Actions publishes the static assets to GitHub Pages.

## The collection

The September 2026 snapshot of the direct entries in [Wikipedia's Ferns of the Americas category](https://en.wikipedia.org/wiki/Category:Ferns_of_the_Americas) resolves to 164 unique articles: 150 species entries and 14 genus overviews. One duplicate redirect was merged. Regional subcategories are outside this snapshot; it is not an exhaustive taxonomic inventory of every American fern.

Every entry has an individually generated watercolor. The built-in imagegen tool was used, interpreting “autobahn” as Audubon-era botanical watercolor. The complete prompt and reference manifest is in `docs/artwork-manifest.json`. Final web assets are in `assets/*.webp`; the maidenhair hero is `assets/adiantum-capillus-veneris.webp`.

102 entries had usable source images (photographs, herbarium sheets, or historical plates). The other 62 are artistic interpretations from species descriptions, including one article whose image was only a location map. The Asplenium auritum source photo has a conflicting plant label and is flagged in the species view. None of the generated illustrations should be treated as a diagnostic specimen record.

Descriptions and expanded article extracts are reproduced from Wikipedia contributors under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Each detail panel links to its source article, contributor history, and available reference image and credits. Generated illustrations are offered under CC BY-SA 4.0; reference photographs retain their individual licenses and are not redistributed in the published site. DM Sans and Italiana are self-hosted under the SIL Open Font License; licenses are in `assets/fonts/`.

## Interaction

- Search names, common names, genera, and places mentioned in article introductions.
- Filter by genus or switch between species, genera, and all entries.
- Load the collection in groups of 24; images load lazily.
- Independent frond layers sway and respond to pointer position.
- A card's fern moves into the centered native dialog when opened.
- Wind can be paused; reduced-motion preferences disable animation.
- Native modal keyboard behavior, close controls, and focus restoration.

## Local preview

```sh
python3 -m http.server 8767 --directory .
```

Open http://localhost:8767. Serving over HTTP is required for the local JSON fetch.

## Verification

The DOM integration test covers pagination, every catalog entry, search, filters, detail content, close/focus behavior, wind, reduced motion, notes, unique IDs, source data, and artwork completeness.

```sh
npm install --prefix /tmp/fern-check jsdom
NODE_PATH=/tmp/fern-check/node_modules node scripts/check.cjs --assets
```

This dependency is only for development; it is not deployed. An isolated Chromium check also passed at 1440px desktop and 390px mobile widths: dialog opening, Escape, focus restoration, search, pagination, wind, reduced motion, no horizontal overflow, and no JavaScript errors. `scripts/browser-check.cjs` reproduces that check with Playwright and an optional `CHROMIUM_PATH`. The hero, collection, modal, mobile views, and artwork contact sheets were visually reviewed.

## Publishing

Push `main` to run `.github/workflows/pages.yml`. Enable GitHub Pages with GitHub Actions as the source. Only `index.html`, `style.css`, `app.js`, `assets/`, and `data/` are published. Reference downloads, generation prompts, and development scripts stay out of the deployed artifact.

The data collection scripts are archival helpers. Running `scripts/collect.py` replaces the curated JSON with a fresh raw collection, so review redirect deduplication, image mappings, reference exceptions, and `scripts/details.py` enrichment before publishing updated data. The reference downloader uses small thumbnails and a low request rate.
