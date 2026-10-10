/**
 * Identity strings, sourced from the real channel.
 *
 * Provenance, so nothing here has to be trusted on faith:
 *   - name, bio ................. YouTube channel description + X profile bio
 *   - avatar .................... yt3.googleusercontent.com (channel avatar)
 *   - join date ................. channel /about page, "Bergabung pada 23 Jun 2023"
 *   - character credits ......... the creator's own X bio
 *   - channels .................. the "Social Media" block of her own video
 *                                  descriptions, which lists every one of them
 *   - hashtags .................. her own posts and video descriptions, NOT the
 *                                  channel bio. Her bio carries no hashtag at
 *                                  all, so every tag below was read off a
 *                                  timeline or a description she wrote.
 *   - series .................... counted from the feed titles
 *
 * The content lists are NOT here. They come from /api/content at request time
 * and keep only a bundled snapshot in src/lib/useContent.ts, so there is one
 * place to look for broadcast data instead of two that can drift apart.
 */

export const site = {
  name: "Lunie",
  /** Name as it appears on the channel, verbatim. */
  channelTitle: "Lunie",
  /**
   * Her channel description, kept exactly as published including the decorative
   * glyphs -- they are her styling and appear on every post she writes, so
   * tidying them would be editing her voice. Read plainly it says
   * "The Moon of Eternal Gryph".
   */
  bio: "𝔗𝔥𝔢 𝔐𝔬𝔬𝔫 𝔬𝔣 𝔈𝔱𝔢𝔯𝔫𝔞𝔩 𝔊𝔯𝔦𝔢𝔣  ๋ ࣭✦‧₊˚",
  /**
   * Production origin. The site is served from its own subdomain, so the origin
   * and the site URL are the same thing. Kept in sync with index.html,
   * robots.txt, and sitemap.xml.
   */
  url: "https://lunie.vtube-info.xyz",
  locale: "id_ID",
  avatar: "/media/avatar-youtube.webp",
  avatarAlt:
    "Ilustrasi Lunie: karakter animegirl bergaya moe dengan rambut ungu indigo gelap dan cardigan ungu",
  /** Smaller crop used for the nav mark, where the square version is too heavy. */
  avatarSmall: "/media/avatar-x.webp",
  joined: "Bergabung pada Juni 2023",
  /**
   * Character work credits, from the creator's own X bio.
   *
   * Her bio writes them as two "ママ" lines with different marks, so the marks
   * are kept rather than replaced with invented job titles. What ママ is doing on
   * each line is not something she states in English, and guessing at it is how a
   * credit ends up asserting something nobody checked.
   */
  credits: [
    { role: "ママ✍︎", name: "@KSHIKO1 @baihuahuahua" },
    { role: "ママ⚙︎", name: "@amyllis_" },
  ],
} as const;

export const channels = {
  youtube: {
    label: "YouTube",
    handle: "@YourLuLunie",
    url: "https://www.youtube.com/@YourLuLunie",
    note: "Stream dan cover",
  },
  x: {
    label: "X",
    handle: "@YourLuLunie",
    url: "https://x.com/YourLuLunie",
    note: "Update harian",
  },
  instagram: {
    label: "Instagram",
    handle: "@yourlulunie",
    url: "https://www.instagram.com/yourlulunie",
    note: "Foto dan story",
  },
  tiktok: {
    label: "TikTok",
    handle: "@YourLuLunie",
    url: "https://www.tiktok.com/@YourLuLunie",
    note: "Potongan pendek",
  },
  discord: {
    label: "Discord",
    handle: "Server Discord",
    url: "https://discord.gg/DgNVsgtZbW",
    note: "Komunitas",
  },
  trakteer: {
    label: "Trakteer",
    handle: "trakteer.id/YourLuLunie",
    url: "https://trakteer.id/YourLuLunie",
    note: "Support lewat gift",
  },
} as const;

/**
 * Route table.
 *
 * Owned here rather than in App.tsx so the nav and the router cannot disagree
 * about which paths exist. App imports the type; nothing else needs the list.
 */
export const ROUTES = [
  "/",
  "/tentang",
  "/konten",
  "/konten/streams",
  "/konten/video",
  "/konten/clips",
  "/tweets",
  "/fanart",
  "/channel",
] as const;

export type Route = (typeof ROUTES)[number];

/**
 * Hashtags, every one read off something she wrote.
 *
 * Provenance per tag, because the interesting part here is that her bio has none:
 *
 *   from X posts        #CF23  #cf23catalogue  #comifuro  #comifuro23
 *   from video titles   #UtaindoRelay  #TOBEHEROX  #LonelyUniverse
 *                       #EvenThoughIHadLovedYou
 *
 * The four X tags are her event run: CF23 is the con she is announcing, and the
 * other three are the doujin-market tags that go with it. The four YouTube tags
 * are what her covers carry. Nothing was invented to fill the list, and the page
 * says so rather than implying a fixed set exists.
 *
 * Case is kept as she wrote it. X search is case-insensitive so #CF23 and #cf23
 * are the same tag to her, but they are not the same string, and picking one over
 * the other would be a decision made here rather than by her.
 *
 * A "#m" also turned up in the timeline scrape and is deliberately absent: it is
 * the anchor on a Nitter permalink, not a tag she uses.
 */
export const hashtags = [
  { tag: "#CF23", use: "Event" },
  { tag: "#comifuro", use: "Furo" },
  { tag: "#comifuro23", use: "Furo" },
  { tag: "#cf23catalogue", use: "Catalogue" },
  { tag: "#UtaindoRelay", use: "Cover relay" },
  { tag: "#TOBEHEROX", use: "Cover" },
  { tag: "#LonelyUniverse", use: "Cover" },
  { tag: "#EvenThoughIHadLovedYou", use: "Cover" },
] as const;

/**
 * Series names exactly as they appear in the feed titles.
 * The "kind" column is a plain reading of what the title is about, not a claim
 * from the creator.
 *
 * Read off the titles rather than assumed: "WEEKLY SCHEDULE" is bracketed the way
 * she brackets a standing appointment, four of her videos are covers, two of them
 * are debut trailers, and the pre-order streams recur around each con.
 */
export const series = [
  { name: "WEEKLY SCHEDULE", kind: "Jadwal" },
  { name: "ASMR", kind: "ASMR" },
  { name: "Cover by Lunie", kind: "Musik" },
  { name: "Debut Trailer", kind: "Trailer" },
  { name: "Pre-Order", kind: "Merch" },
] as const;

/**
 * Colophon. A credit line naming who built the page. Kept as a footnote, not a
 * showcase section.
 */
export const colophon = {
  /** Credit line. Replaces a former tool list, which described the stack rather than the person. */
  credit: "Developed by Sakamura",
} as const;

/**
 * Nav links.
 *
 * Every href is a full route, never a bare "#anchor". That is the fix for the
 * footer bug: on /konten, "#tentang" and "#channel" resolved against a page that
 * has neither section, so both looked clickable and did nothing. A path always
 * resolves, and the nav and the router now read the same table.
 *
 * `satisfies` ties every href to the Route union, so a typo becomes a type error
 * rather than a link that quietly goes nowhere.
 */
export const navigation = [
  { label: "Tentang", href: "/tentang" },
  { label: "Konten", href: "/konten" },
  { label: "Tweets", href: "/tweets" },
  { label: "Fan Art", href: "/fanart" },
  { label: "Channel", href: "/channel" },
] as const satisfies ReadonlyArray<{ label: string; href: Route }>;
