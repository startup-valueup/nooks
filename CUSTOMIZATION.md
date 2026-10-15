# Customization Guide

How the NOOKS site is put together and how to change it. NOOKS is built on the Atelier Kō Astro theme (MIT, Andrei Alba); the structure below is the theme's, adapted for a Korean-language lifestyle brand. Brand rules live in [docs/brand/BRAND_GUIDE.md](./docs/brand/BRAND_GUIDE.md).

## Site Settings

Edit [src/config/site.ts](./src/config/site.ts) first. It holds the brand name, tagline, default title and description, language, contact email, business disclosure, theme colour, navigation, footer, newsletter, commerce defaults, and which products are promoted. Components read from it rather than hardcoding copy.

`name` fills the wordmark, the footer, `og:site_name`, the `author` meta tag, the JSON-LD, and — through `pageTitle()` — every page title ("페이지 — NOOKS").

`tagline` is used for the homepage `<title>`, the footer statement and the Organization `slogan`.

`defaultTitle` and `description` are the fallbacks for any page that does not pass its own.

`lang` and `ogLocale` set `<html lang>` and `og:locale` (`ko` / `ko_KR`).

**Optional values default to empty and render nothing when empty.** This is deliberate: no placeholder address, handle or registration number is ever published.

- `email` — the contact address. When set it is linked from the footer and from the "문의하기" button on the brand page, and emitted in the Organization JSON-LD.
- `business` — 상호, 대표자, 사업자등록번호, 통신판매업 신고번호, 주소, 고객센터, 개인정보 보호책임자. Korean e-commerce law requires these to be visible once the shop sells directly. Each filled field appears in the footer; empty ones are skipped.
- `social` — a list of `{ label, href }` profile links. They appear in the footer and as `sameAs` in the JSON-LD.
- `newsletter.actionUrl` — when set, the footer renders a real `<form method="post">` pointed at it; when empty there is no form. The site never fakes a signup it did not send anywhere.

`themeColor` fills the `theme-color` meta tag. Keep it in step with `--canvas` in [src/styles.css](./src/styles.css).

`socialImage` is the fallback share card, served from `public/`. Its source is [docs/brand/og-image.html](./docs/brand/og-image.html): open it in Chromium at 1200×630 and save a PNG over `public/og-image.png`. Product pages pass their own photography instead.

The canonical domain is deliberately **not** in this file. It is `site` in [astro.config.mjs](./astro.config.mjs), read from the `SITE` environment variable. Without it the build uses the reserved `https://nooks.example`:

```bash
SITE=https://your-domain npm run build
```

`trailingSlash: "always"` is set there too, so every URL has one canonical form (`/catalog/`) that matches how static hosts serve `catalog/index.html`.

## Navigation

`siteConfig.navigation` drives both the desktop header and the mobile menu, in order:

```ts
navigation: [
  { label: "홈", href: "/" },
  { label: "상품", href: "/catalog/" },
  { label: "브랜드", href: "/about/" },
];
```

Write `href` values with a trailing slash. The active item is matched by prefix, except `/`, which matches exactly, and is marked with `aria-current="page"` and an accent rule — colour is never the only signal.

The mobile menu numbers its items from this list, so adding a link renumbers everything. When the cart is enabled it takes the next number automatically.

## Footer

`siteConfig.footerBlurb` fills the first column and `siteConfig.footerColumns` is an array of `{ heading, links }` — add, remove, or reorder freely. A "문의 · 소식" column is appended automatically from `email` and `social`, and disappears while both are empty. The business disclosure renders as a line of term/value pairs above the copyright.

The top band shows the tagline with two buttons, or — once `newsletter.actionUrl` is set — an email field.

The grid in [src/components/SiteFooter.astro](./src/components/SiteFooter.astro) assumes one wide column plus up to two narrow ones; adjust the `md:col-span-*` classes if you add more.

## Featured Products

`siteConfig.featured` decides which products are promoted. Each value is a filename in [src/content/products](./src/content/products) without the `.md`:

```ts
featured: {
  homepageGrid: ["my-first-item", "my-second-item", "my-third-item"],
  homepageSolo: "my-first-item",
  mobileMenu: "my-first-item",
}
```

All three are empty today, and an empty slot hides its section — the homepage shows a "첫 컬렉션을 준비하고 있습니다" panel instead. A slug that is set but does not exist fails the build with a named error (`requireProduct()` in [src/data/products.ts](./src/data/products.ts)), so a typo can never silently hide a section.

## Product Frontmatter

Products live in [src/content/products](./src/content/products), one Markdown file per product. The filename becomes the slug. The schema is in [src/content.config.ts](./src/content.config.ts). Copy [`_sample.md`](./src/content/products/_sample.md) as a starting point and delete its `draft` line:

```md
---
name: 상품명
collection: 컬렉션 이름
category: 카테고리
material: 소재
price: 0
shortDescription: 한 줄 설명
dimensions: W 00 × D 00 × H 00 cm
finish: 마감
leadTime: 준비 기간
images:
  - ../../assets/my-item-1.jpg
  - ../../assets/my-item-2.jpg
order: 1
---

상품 설명 한두 문단.
```

The Markdown body is the long description, used on the product page, in the meta description, and in the Product JSON-LD.

`order` controls the default "추천순" sort; ties fall back to the name. `category` and `material` are free text — whatever values you use become the catalogue filter chips automatically.

`draft: true` keeps a product out of production builds. It still renders under `npm run dev`, which is how the bundled sample lets layouts be checked without publishing a fake product.

`images` are relative paths into [src/assets](./src/assets). The first is the card and social image. The gallery grid is three columns wide, so three images per product sits best.

> The schema still requires `price`, `dimensions`, `finish` and `leadTime`. Making them optional for products whose details are not final is part of the next stage.

## Catalogue Filters and Sorting

[src/pages/catalog.astro](./src/pages/catalog.astro) builds its chips from `getProductFilters()`, which collects the distinct `category` and `material` values across all products. Filtering, sorting, the result count, and the empty state are handled by one inline script that toggles the `hidden` attribute and reorders nodes in place — no re-rendering and no framework.

Active chips are marked with `aria-pressed`, and the `.chip` styles in [src/styles.css](./src/styles.css) key off that attribute rather than a separate class, so state and styling cannot drift apart.

To add a sort option, add an `<option>` to the `[data-catalog-sort]` select and a matching branch in the comparator.

## Cart and Checkout

**The cart is switched off.** `siteConfig.commerce.cartEnabled` is `false`, so the header cart link, the drawer, the cart scripts and the add-to-cart controls are not rendered, the product page says purchasing is being prepared, no `Offer` is added to the Product JSON-LD, and `/cart/` shows a short notice instead of a checkout form.

The inherited implementation is kept for the next stage, which replaces it with the Cafe24 and external-marketplace purchase flow. It is `localStorage` only: [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro) defines `window.NooksCart` — `read`, `write`, `count`, `add`, `remove`, `setQuantity` — and dispatches a `nooks-cart-change` event. The cart view itself is [src/components/CartView.astro](./src/components/CartView.astro). **Its payment fields are demo-only and not connected to any processor; do not enable it on a live site.**

Commerce defaults come from `siteConfig.commerce`:

```ts
commerce: {
  locale: "ko-KR",
  currency: "KRW",
  shippingFlatRate: 0,
  cartEnabled: false,
}
```

`locale` and `currency` feed `formatPrice()` in [src/data/products.ts](./src/data/products.ts), so prices render as `₩12,000`.

## Cart Drawer

[src/components/CartDrawer.astro](./src/components/CartDrawer.astro) renders once per page from `SiteHeader`. The panel slides in from the right over a backdrop, and lists each line with a thumbnail, a `.qty` stepper, a remove control, a subtotal, and a link through to the full cart page.

Open and close is delegated from [src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro), which owns focus, the scroll lock, Escape, and the focus trap. Two attributes are the whole API:

- `data-cart-toggle` on any element opens or closes the panel.
- `data-cart-close` on any element inside it closes it.

Pages never wire up their own handlers. The header cart is a real `<a href="/cart">` that the script upgrades, so with JavaScript off it stays an ordinary link to the cart page and the drawer never appears.

Because the stored cart holds only `{ slug, quantity }`, the drawer ships a small catalogue snapshot — name, price, material, thumbnail — built in its frontmatter. Thumbnails go through `getImage()` at build time, so the panel is on optimized WebP without an `<Image>` per line.

## Add to Cart

Any control can add to the cart. Give it `data-add-to-cart="<slug>"` and, optionally, `data-add-quantity`:

```html
<button type="button" data-add-to-cart="my-item" data-add-quantity="1">장바구니 담기</button>
```

The delegated handler in `BaseLayout` reads both, adds the line, and opens the drawer — the drawer is the confirmation, so there is no label that swaps to "Added" and back.

The product page pairs this with a `.qty` stepper that writes the chosen value into `data-add-quantity` and resets to 1 after a successful add. That is the only page-level cart script in the theme.

## Newsletter

There is no built-in newsletter. Set `siteConfig.newsletter.actionUrl` to your provider's form endpoint and the footer renders an email field posting to it (`method="post"`, field name `email`); leave it empty and no form is shown. Add provider-specific hidden fields in [src/components/SiteFooter.astro](./src/components/SiteFooter.astro) if the provider needs them.

The input uses `.newsletter-field`, the underlined `.field` treatment.

## Theme Tokens

All colour, geometry, easing and layout values are custom properties on `:root` in [src/styles.css](./src/styles.css). Nothing below that block hardcodes a colour, so retheming is a single edit:

```css
:root {
  --canvas: #f6f3ee; /* page background — warm paper */
  --surface: #ece7df; /* image and panel backgrounds */
  --surface-strong: #e0d9ce; /* the next step down */

  --ink: #1a1816; /* body and headings */
  --muted: #5e5850; /* secondary copy, labels */

  --accent: #3b5645; /* NOOKS moss — links, active states, focus */
  --accent-ink: #ffffff; /* text on accent fills */

  --night: #1d201c; /* the one inverted band */
  --night-ink: #f6f3ee;
  --night-muted: #b4b0a6;
  --night-accent: #a9c4b1;

  --line: color-mix(in oklab, var(--ink) 14%, transparent); /* hairlines */
  --line-strong: color-mix(in oklab, var(--ink) 28%, transparent); /* field underlines */

  --radius: 0px; /* square by default */
  --gutter: 1.5rem; /* page inset, 2.5rem from lg */
  --shell: 96rem; /* max content width */
}
```

Measured contrast: ink on canvas 16.0:1, muted on canvas 6.4:1 (5.0:1 on `--surface-strong`), accent on canvas 7.3:1, white on accent 8.1:1, night-muted on night 7.6:1.

`--line` and `--line-strong` are derived from `--ink` with `color-mix`, so changing the ink colour keeps every hairline in the same family.

The `@theme inline` block maps these to Tailwind, giving you `bg-canvas`, `text-muted`, `border-line`, `text-accent`, `bg-night` and so on.

`--radius` is `0px`. The only curve in the design is the arch (`.arch-top`, `.arch-icon`, the logo mark), which is the brand's own shape.

If you change `--canvas`, update `siteConfig.themeColor` to match, and regenerate the share card.

## Typography

The scale is fluid and defined as component classes rather than utilities, so headings carry one class instead of three. Hangul is denser than Latin, so line-heights are looser than the original theme's (1.14–1.34 for display, 1.7–1.8 for text) and `<html>` sets `word-break: keep-all` so words are never split mid-eojeol.

| Class        | Use                                               |
| ------------ | ------------------------------------------------- |
| `.type-hero` | Homepage and 404 headline                         |
| `.type-h1`   | Page headlines                                    |
| `.type-h2`   | Section headlines                                 |
| `.type-h3`   | Card and column headings                          |
| `.type-lead` | Intro paragraph under a headline                  |
| `.type-body` | Body copy                                         |
| `.label`     | Small caption — spec terms, form labels           |
| `.mono`      | Plex Mono with tabular numerals — indices, prices |

`.label` is for spec terms, form labels and column headings — data, not decoration. Sections are **not** introduced by an eyebrow caption: a headline over a `.rule` carries them. Unlike the original theme it is not uppercase mono, because Hangul has no uppercase and no mono face; it is medium-weight sans instead.

`.label` is `inline-flex`. Do not put a `border-t` on it directly — the rule will only span the text. Wrap it, or use a `.rule` element above it.

## Component Classes

Defined in the `@layer components` block of [src/styles.css](./src/styles.css):

- `.btn` with `.btn-primary` or `.btn-outline` — the accent panel wipes up from the baseline on hover and focus. `.btn-outline` recolours its own rule to match, so the fill never buries the border.
- `.link` — an underline that wipes in from the left, drawn with a background gradient so it never affects layout. `.link-mono` is the small navigational size. The rule is painted across the element box, so the class sets `width: fit-content` to hug its text wherever it has been blockified; that is ignored while the link is inline. To centre a blockified one, add `mx-auto` rather than `w-full`.
- `.chip` — catalogue filter, styled from `aria-pressed`.
- `.field` and `.field-label` — underlined inputs and selects. The underline turns accent on focus.
- `.shell` — the centred page container. Applies `--shell` and `--gutter`.
- `.rule` — a full-width hairline, and the element to attach the self-drawing reveal to.
- `.fact` — one cell of a specification band. Two-up on small screens and four-up from `md`. Cells are separated by space and by the band's own top and bottom rules; there are no vertical dividers between them.
- `.arch-top` / `.arch-icon` — the brand arch as an image frame and as a small outline icon.
- `.band-night` — the single inverted band used for brand statements.
- `.nook-art` — the layered-arch hero illustration (see `NookArt.astro`).
- `.qty` (with `.qty-sm`) — the quantity stepper, shared by the product page, the cart page and every drawer line.

## Motion

Motion is opt-in at runtime. A small script in the document head sets `data-motion="on"` on `<html>` only when JavaScript is running **and** the visitor has not asked for reduced motion. Every reveal rule is scoped to that attribute, so without it each target renders in its final state. Reduced motion and no-JavaScript both get complete, static pages — this is verified, not assumed.

A single `IntersectionObserver` at the end of the body observes `[data-reveal]` and unobserves each target once it fires, so the cost falls to nothing after the first pass down the page.

Four variants:

| Attribute            | Effect                         |
| -------------------- | ------------------------------ |
| `data-reveal`        | Rises 1.75rem and fades in     |
| `data-reveal="fade"` | Fades only, no movement        |
| `data-reveal="mask"` | Unmasks its child image upward |
| `data-reveal="line"` | Draws a hairline left to right |

Stagger a group by setting `--reveal-delay` per item:

```astro
{items.map((item, index) => (
  <div data-reveal style={`--reveal-delay:${index * 110}ms`}>…</div>
))}
```

Two variants clip or scale a **child** rather than the element being observed. This is deliberate: a target clipped to zero height or scaled to zero width reports an empty intersection rectangle, and the observer would never fire for it. Keep that structure if you add variants of your own.

`data-reveal="mask"` therefore expects a plain wrapper around the image:

```html
<a class="group block overflow-hidden" data-reveal="mask">
  <div><img class="transition-transform duration-[1100ms] group-hover:scale-[1.04]" /></div>
</a>
```

The wrapper matters. The mask rule sets the `transition` shorthand on its child, so pointing it straight at the image would replace the image's own transition and its hover would snap instead of easing.

Above-the-fold content uses the `.hero-in` class instead, a plain CSS keyframe that runs immediately, so the hero never waits on the observer.

Two effects need no JavaScript at all where the browser supports `animation-timeline`:

- `.site-header` starts transparent over the hero and fills to a solid, ruled bar over the first 96px of scroll. Where scroll timelines are unsupported it is solid and ruled from the start, which is why the header is always legible.
- `.parallax` drifts an image against the scroll inside its `overflow-hidden` frame. Where unsupported, the image is simply static.

Durations and the two easing curves are tokens (`--ease-out-expo`, `--ease-out-quart`). Change them once to retime the whole theme.

## Images

Every theme image goes through Astro's `<Image>` component with explicit `width` and `height`, `format="webp"`, and an aspect-ratio class on the element, so nothing shifts as images load.

Above-the-fold images — the first product view and the first three catalogue cards — are `loading="eager"` with `decoding="sync"`. Everything else is lazy. If you reorder the homepage, move the eager flag with the first image.

`ProductCard` takes an `eager` prop for exactly this reason:

```astro
<ProductCard product={product} eager={index < 3} index={index} revealDelay={index * 110} />
```

## Product Card

[src/components/ProductCard.astro](./src/components/ProductCard.astro) takes typed props:

- `product` — required.
- `eager` — load the image immediately. Above the fold only.
- `headingLevel` — `"h2"` or `"h3"`. Set it so the card does not break the page's heading order; the product page passes `"h3"` because its related grid sits under an `h2`.
- `index` — renders a mono reference number beside the name.
- `revealDelay` — milliseconds of stagger for the scroll reveal.

The meta row's top rule turns accent on hover. That is the whole hover affordance — the theme has no arrow glyphs.

## Fonts

[Pretendard Variable](https://github.com/orioncactus/pretendard) (SIL OFL 1.1) carries Hangul and Latin. It is self-hosted as its 92-slice dynamic subset in [src/assets/fonts/pretendard](./src/assets/fonts/pretendard), declared in [src/styles/pretendard.css](./src/styles/pretendard.css) and imported by `styles.css`. Each `@font-face` has a `unicode-range`, so a page downloads only the slices holding the characters it shows — typically a dozen files of 10–45 KB, not the 3 MB family. The licence text sits beside the files.

[IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) 400 (latin only, one file) sets indices, prices and spec numerals. Its stack falls back to Pretendard, so Hangul inside a `.mono` element never drops to the browser's default monospace.

[src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro) preloads exactly two slices — 91 (Latin, digits, punctuation, the most frequent Hangul) and 90 (the next most frequent Hangul) — by importing them with `?url`, which resolves to the same hashed assets the stylesheet references. Preloading more would just compete with the page.

To swap the family, replace the files and `@font-face` rules, update `--font-sans` in `@theme inline`, and update the two preload imports. To drop webfonts entirely, delete the `@font-face` blocks and use the system Korean stack that `--font-sans` already falls back to.

## Pages and SEO

[src/layouts/BaseLayout.astro](./src/layouts/BaseLayout.astro) owns all metadata. Its props:

| Prop            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `title`         | Page title. Use `pageTitle("Name")` for the house format. |
| `description`   | Meta and social description                               |
| `image`         | Social image — an imported asset or a root-relative path  |
| `noindex`       | Adds `robots: noindex,nofollow`                           |
| `includeHeader` | Render the site header                                    |
| `includeFooter` | Render the site footer                                    |

Canonical URLs, Open Graph and Twitter tags are derived from `site` and the current pathname. JSON-LD is built in page frontmatter and passed through `set:html`, never assembled inline in the template — Astro 7 does not resolve `Astro.*` inside an `is:inline` script.

Structured data shipped: Organization and WebSite on the homepage, Product and BreadcrumbList on product pages (the Product `Offer` only once a purchase path exists). `@astrojs/sitemap` generates the sitemap, and [src/pages/robots.txt.js](./src/pages/robots.txt.js) generates `robots.txt` from the configured site.

The cart and 404 pages set `noindex`, and `/cart/` is filtered out of the sitemap in `astro.config.mjs`.

To add a page, create it in [src/pages](./src/pages) and wrap it in `BaseLayout` with its own title and description. Give it one `h1`, open with a `.type-h1`, and wrap content in `.shell`.
