/**
 * Central site configuration.
 *
 * Everything a site normally needs to change lives here: the brand name,
 * navigation, footer, contact and business details, commerce defaults, and
 * which products are promoted on the homepage. Components read from this file
 * rather than hardcoding copy, so re-scoping the site does not mean editing
 * markup.
 *
 * Optional values (contact email, social links, business registration, featured
 * products) default to empty. Components render nothing for an empty value, so
 * the site never ships placeholder contact details or invented facts — fill them
 * in as they become real.
 *
 * The canonical domain is NOT here — it is `site` in astro.config.mjs, so
 * there is only ever one source of truth for it.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: NavItem[];
}

export const siteConfig = {
  /** Brand name. Used in the wordmark, metadata, JSON-LD and the footer. */
  name: "NOOKS",

  /** One-line positioning statement. Emitted as the Organization slogan. */
  tagline: "머무는 자리를 위한 물건",

  /** Default meta description for pages that do not set their own. */
  description:
    "NOOKS는 집과 일상 곳곳의 작은 자리를 위한 프리미엄 라이프스타일 브랜드입니다. 오래 곁에 두고 싶은 물건을 차분하게 선보입니다.",

  /** Default <title> for pages that do not set their own. */
  defaultTitle: "NOOKS — 머무는 자리를 위한 물건",

  /** Document language (BCP 47) and Open Graph locale. */
  lang: "ko",
  ogLocale: "ko_KR",

  /**
   * Customer contact email, linked in the footer and on the brand page.
   * Leave empty until a real address exists — nothing is rendered for "".
   */
  email: "",

  /**
   * Business disclosure shown in the footer. Korean e-commerce law requires
   * the operator's registration details to be visible once the shop sells
   * directly. Each field renders only when filled in.
   */
  business: {
    companyName: "",
    representative: "",
    registrationNumber: "",
    mailOrderNumber: "",
    address: "",
    phone: "",
    privacyOfficer: "",
  },

  /** Browser theme colour. Keep in step with `--canvas` in src/styles.css. */
  themeColor: "#f6f3ee",

  /**
   * Fallback social share card, served from public/. Used by any page that
   * does not pass its own `image` — product pages pass their photography, so
   * this covers the homepage, catalogue, brand page and 404.
   */
  socialImage: {
    src: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "NOOKS — 머무는 자리를 위한 물건",
  },

  /** Primary navigation, in order. Also drives the mobile menu. */
  navigation: [
    { label: "홈", href: "/" },
    { label: "상품", href: "/catalog/" },
    { label: "브랜드", href: "/about/" },
  ] satisfies NavItem[],

  /** Short paragraph in the first footer column. */
  footerBlurb:
    "집과 일상 곳곳의 작은 자리를 위한 프리미엄 라이프스타일 브랜드. 오래 곁에 두고 싶은 물건을 차분하게 선보입니다.",

  /** Footer link columns. Add or remove columns freely. */
  footerColumns: [
    {
      heading: "둘러보기",
      links: [
        { label: "상품", href: "/catalog/" },
        { label: "브랜드 이야기", href: "/about/" },
      ],
    },
  ] satisfies FooterColumn[],

  /** External profiles, rendered in the footer. Empty list renders nothing. */
  social: [] as NavItem[],

  /**
   * Newsletter / opening-notice signup. Disabled until a provider exists:
   * the footer renders the form only when `actionUrl` is set, so the site
   * never claims to have saved an address it sent nowhere.
   */
  newsletter: {
    actionUrl: "",
  },

  /** Commerce defaults. */
  commerce: {
    /** BCP 47 locale used to format every price. */
    locale: "ko-KR",
    /** ISO 4217 currency code. */
    currency: "KRW",
    /** Flat delivery charge added once when the cart is not empty. */
    shippingFlatRate: 0,
    /**
     * Client-side cart (header badge, drawer, /cart). Off while the purchase
     * flow is undecided; the cart route then shows a notice instead of a
     * checkout form.
     */
    cartEnabled: false,
  },

  /**
   * Which products the theme promotes. Each value is a filename in
   * src/content/products without the .md extension. A slug that does not
   * resolve fails the build rather than rendering an empty section; leaving a
   * slot empty hides its section.
   */
  featured: {
    /** Cards in the homepage product grid. */
    homepageGrid: [] as string[],
    /** The single large product given its own homepage section. */
    homepageSolo: "",
    /** The product shown at the foot of the mobile menu. */
    mobileMenu: "",
  },
};

export type SiteConfig = typeof siteConfig;

/**
 * Builds a page <title> in the house format: "Page — Brand".
 * Change the separator here to restyle every title at once.
 */
export function pageTitle(page: string): string {
  return `${page} — ${siteConfig.name}`;
}
