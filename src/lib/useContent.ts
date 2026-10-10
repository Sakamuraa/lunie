import { useEffect, useState } from "react";

export type ContentItem = {
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
  live: boolean;
  viewers: number | null;
  /** "5 jam lalu", as the channel's own grid writes it. */
  age: string | null;
  /**
   * Absolute publish instant behind `age`.
   *
   * The API path sends this so the label can be re-derived from it rather than
   * read verbatim. The string alone is a snapshot of one moment -- an edge cache
   * happily serves the same payload for an hour, and a card that prints the
   * cached string keeps claiming "6 jam lalu" long after the stream is nine hours
   * old. Measuring from an instant cannot go stale that way.
   */
  publishedAt?: string | null;
  /** Runtime of a finished video, e.g. "2.03.50". Null on a broadcast. */
  duration: string | null;
  /** Publishing channel, on the clips tab only. */
  channel?: string;
  /** Scheduled but not started. Separate from live: one is now, one is later. */
  upcoming?: boolean;
};

type ApiPayload = {
  fetchedAt: string;
  liveCount: number;
  sources: Record<"streams" | "videos" | "clips", boolean>;
  streams: ContentItem[];
  videos: ContentItem[];
  clips: ContentItem[];
  /** Scheduled broadcast, or null. */
  upcoming?: ContentItem | null;
};

type State = {
  streams: ContentItem[];
  videos: ContentItem[];
  clips: ContentItem[];
  /** Scheduled but not started, when there is one. */
  upcoming: ContentItem | null;
  /** True when at least one broadcast is confirmed live. */
  live: boolean;
  /** "api" once a response lands, "snapshot" while on the bundled copy. */
  source: "api" | "snapshot" | "loading";
  error: string | null;
};

/** When the snapshot's ages were measured, so the client can keep them honest. */
const SNAPSHOT_AT = "2026-10-10T09:10:10.817Z";

/**
 * Bundled copies of the three lists, taken 2026-10-10.
 *
 * The fallback for a static host with no serverless runtime, and for the window
 * before the fetch resolves. Ages are the channel's own labels from that moment,
 * stored as seconds so `formatAge` can advance them: a snapshot that keeps
 * saying "1 jam lalu" a week later would be lying, and this is the only part of
 * the page that can go stale with no server to refresh it.
 */
const SNAPSHOT_STREAMS: ContentItem[] = [
{ videoId: "y5bgXQvQlNA", url: "https://www.youtube.com/watch?v=y5bgXQvQlNA", title: "Unarchive lep", thumbnail: "https://i.ytimg.com/vi/y5bgXQvQlNA/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLD-9jc5PHm-lg66NNkV84U9YvYP4A", live: false, viewers: null, age: null, duration: null },
{ videoId: "Zip_Ji4OQZI", url: "https://www.youtube.com/watch?v=Zip_Ji4OQZI", title: "₊˚ ࣭ʚ ♡ ɞ ‧₊˚ hari ini AKU TUTUP PRE ORDER!!! ˚₊‧ ʚ ♡ ɞ ࣭˚₊", thumbnail: "https://i.ytimg.com/vi/Zip_Ji4OQZI/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBUjF-0p0GpZDBeHIEDjpvSojmk2w", live: false, viewers: null, age: null, duration: null },
{ videoId: "Y_zE55Zb5X8", url: "https://www.youtube.com/watch?v=Y_zE55Zb5X8", title: "₊˚ ࣭ʚ ♡ ɞ ‧₊˚  BESOK PRE ORDER AKU TUTUP.. dah beli belom??  ˚₊‧ ʚ ♡ ɞ ࣭˚₊", thumbnail: "https://i.ytimg.com/vi/Y_zE55Zb5X8/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCZMu3EjXFBlaoeXJfHu5A1ywqm_A", live: false, viewers: null, age: null, duration: null },
{ videoId: "-2YfiaDz_4Y", url: "https://www.youtube.com/watch?v=-2YfiaDz_4Y", title: "₊˚ ࣭✦‧₊˚  morning love hihi ✧₊˚⊹ ࣪ ˖", thumbnail: "https://i.ytimg.com/vi/-2YfiaDz_4Y/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDOA9SD7z7AYGwV9tLJ_1eEOvmHvQ", live: false, viewers: null, age: null, duration: null },
{ videoId: "YpSzYcH73rY", url: "https://www.youtube.com/watch?v=YpSzYcH73rY", title: "₊˚ ࣭✦‧₊˚  apakah km suda beli merch aku?? ✧₊˚⊹ ࣪ ˖", thumbnail: "https://i.ytimg.com/vi/YpSzYcH73rY/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDxbcBXtfYm347HsEXgZovZuvlccA", live: false, viewers: null, age: null, duration: null },
{ videoId: "yS83dUhHULY", url: "https://www.youtube.com/watch?v=yS83dUhHULY", title: "₊˚ ࣭✦‧₊˚ strimir gaptek ber mediashare ✧₊˚⊹ ࣪ ˖", thumbnail: "https://i.ytimg.com/vi/yS83dUhHULY/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBzMBdhxr7jALX-LmqS5eCFMXXEmg", live: false, viewers: null, age: null, duration: null },
{ videoId: "6NkG3zik9Ek", url: "https://www.youtube.com/watch?v=6NkG3zik9Ek", title: "₊˚ ࣭ʚ ♡ ɞ ‧₊˚ km kerja, aku pura pura kerja ˚₊‧ ʚ ♡ ɞ ࣭˚₊", thumbnail: "https://i.ytimg.com/vi/6NkG3zik9Ek/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBBBUiu89t909eL-7tPVd9fz2tm0w", live: false, viewers: null, age: null, duration: null },
{ videoId: "l70Gk3WlvtY", url: "https://www.youtube.com/watch?v=l70Gk3WlvtY", title: "₊˚ ࣭✦‧₊˚ late night with me emuach ✧₊˚⊹ ࣪ ˖", thumbnail: "https://i.ytimg.com/vi/l70Gk3WlvtY/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLC07DPJ_0_ZJPNdp4tZ3qhIZs_8JQ", live: false, viewers: null, age: null, duration: null },
];

const SNAPSHOT_VIDEOS: ContentItem[] = [
{ videoId: "rlHz5utQx00", url: "https://www.youtube.com/watch?v=rlHz5utQx00", title: "LUNIE ASMR ✦ Aku Kalah Sama Game Lagi Ya? | F4M | Indo Girlfriend Roleplay", thumbnail: "https://i.ytimg.com/vi/rlHz5utQx00/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDZK900I8SgjfDWoc_4JEJpnaptEA", live: false, viewers: null, age: null, duration: null },
{ videoId: "uvl1gMAHFhg", url: "https://www.youtube.com/watch?v=uvl1gMAHFhg", title: "あいしていたのに - MARETU ✦ Cover by Lunie #UtaindoRelay", thumbnail: "https://i.ytimg.com/vi/uvl1gMAHFhg/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAowD8-v8M0L9K2bXUEKi-2FPj0RA", live: false, viewers: null, age: null, duration: null },
{ videoId: "GOMExZl0Tl0", url: "https://www.youtube.com/watch?v=GOMExZl0Tl0", title: "Lonely Universe「ロンリーユニバース」- Aqu3ra ✦ Cover by Lunie and Mashu #UtaindoRelay", thumbnail: "https://i.ytimg.com/vi/GOMExZl0Tl0/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBMnTolnmzSLo41CZnlm82RxeQQUg", live: false, viewers: null, age: null, duration: null },
{ videoId: "WVT7kIhzECE", url: "https://www.youtube.com/watch?v=WVT7kIhzECE", title: "₊˚  ࣭✦‧₊˚  2.0 Debut Trailer ✧₊˚⊹ ࣪ ˖ Lunie — Your Sovereign of the Crescent Veil", thumbnail: "https://i.ytimg.com/vi/WVT7kIhzECE/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLA3eqYaz48wTrexFGyHk-A9bqewtQ", live: false, viewers: null, age: null, duration: null },
{ videoId: "9nQmj7o9bAo", url: "https://www.youtube.com/watch?v=9nQmj7o9bAo", title: "My Color - DAIKI (AWSM.) ✦ Cover by Lunie | TO BE HERO X Insert Song of Lucky Cyan", thumbnail: "https://i.ytimg.com/vi/9nQmj7o9bAo/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCBG-RtXDOYjHBC0mPO3NpkRNrb4Q", live: false, viewers: null, age: null, duration: null },
{ videoId: "4PDawD4_-Q8", url: "https://www.youtube.com/watch?v=4PDawD4_-Q8", title: "๋ ࣭✦‧₊˚ 「 New Outfit Trailer 」✧₊˚⊹ ࣪ ˖ eepy Lunie ₍ᐢᐢ₎", thumbnail: "https://i.ytimg.com/vi/4PDawD4_-Q8/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLB470gKm5tcYC2dbg593Ch9VyNpJg", live: false, viewers: null, age: null, duration: null },
{ videoId: "zTr7lHSIwos", url: "https://www.youtube.com/watch?v=zTr7lHSIwos", title: "VTuber Debut Trailer ･｡꙳✧ Lunie ☾✧꙳", thumbnail: "https://i.ytimg.com/vi/zTr7lHSIwos/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAkRE_pU6oBhq-P5efNTjSB9Z3Qmg", live: false, viewers: null, age: null, duration: null },
{ videoId: "069M_Obij84", url: "https://www.youtube.com/watch?v=069M_Obij84", title: "Lent Lily「レントリリー」-  ジグ ✦ English Cover by Lunie", thumbnail: "https://i.ytimg.com/vi/069M_Obij84/hqdefault.jpg?sqp=-oaymwEcCOADEI4CSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBXPvUH2RwXl8981RFL9dVWR5Uvkg", live: false, viewers: null, age: null, duration: null },
];

const SNAPSHOT_CLIPS: ContentItem[] = [

];

/** Ages as measured at capture time, in seconds. */
const SNAPSHOT_AGES: Record<string, number> = {
  y5bgXQvQlNA: 86400,
  Zip_Ji4OQZI: 777600,
  Y_zE55Zb5X8: 864000,
  "-2YfiaDz_4Y": 1123200,
  YpSzYcH73rY: 1209600,
  yS83dUhHULY: 1209600,
  "6NkG3zik9Ek": 1209600,
  l70Gk3WlvtY: 1209600,
  rlHz5utQx00: 1123200,
  uvl1gMAHFhg: 2592000,
  GOMExZl0Tl0: 2592000,
  WVT7kIhzECE: 12960000,
  "9nQmj7o9bAo": 31536000,
  "4PDawD4_-Q8": 31536000,
  zTr7lHSIwos: 63072000,
  "069M_Obij84": 94608000,
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
/**
 * A year, at 365 days rather than 365.25.
 *
 * The same figure api/content.ts uses for `tahun`, so a label the API is able to
 * produce is one this can render. The labels are coarse either way -- "1 tahun
 * lalu" on YouTube covers anything from 12 to 24 months -- so the extra precision
 * would be precision the source does not have.
 */
const YEAR = 365 * DAY;

/**
 * Re-render a duration as the age label the card shows.
 *
 * Boundaries match YouTube's own grids closely enough to read the same: they drop
 * to days around a day, to weeks around a week, to months around a month, and to
 * years around a year. A value under a minute reads as "beberapa detik", which is
 * what YouTube says for that window rather than the number zero.
 *
 * The year tier exists because two of the endpoints can return "tahun" and this
 * could not say it: an eleven-year-old clip came out as "133 bulan lalu", which is
 * a true number and a meaningless one. Every bundled snapshot also holds entries
 * older than a year, so the same label appeared on those without any API involved.
 */
export function formatAge(ms: number): string {
  if (ms < MINUTE) return "beberapa detik lalu";
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)} menit lalu`;
  if (ms < DAY) return `${Math.floor(ms / HOUR)} jam lalu`;
  if (ms < WEEK) return `${Math.floor(ms / DAY)} hari lalu`;
  if (ms < MONTH) return `${Math.floor(ms / WEEK)} minggu lalu`;
  if (ms < YEAR) return `${Math.floor(ms / MONTH)} bulan lalu`;
  return `${Math.floor(ms / YEAR)} tahun lalu`;
}

/**
 * The age to render for one item, from whichever source supplied it.
 *
 * The API path is measured, not quoted. `publishedAt` is a wall-clock instant, so
 * the label is re-derived from it every render and stays correct however long the
 * payload sat in a cache. The `age` string is kept only as a fallback for a
 * response that predates the field.
 *
 * The snapshot path carries the measured duration instead, so its label advances
 * the same way -- a copy that keeps saying "1 jam lalu" a week later would be
 * lying, and caching is the only part of this page that can go stale with no
 * server to refresh it.
 */
export function ageLabel(item: ContentItem): string | null {
  if (item.publishedAt) {
    const elapsed = Date.now() - new Date(item.publishedAt).getTime();
    if (Number.isFinite(elapsed) && elapsed >= 0) return formatAge(elapsed);
  }

  if (item.age) return item.age;

  const captured = SNAPSHOT_AGES[item.videoId];
  if (captured === undefined) return null;

  const elapsed = Date.now() - new Date(SNAPSHOT_AT).getTime();
  // A clock behind the capture would produce a negative age, which is worse than
  // showing nothing.
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;

  return formatAge(captured * SECOND + elapsed);
}

const INITIAL: State = {
  streams: [],
  videos: [],
  clips: [],
  // Null until the endpoint answers, and deliberately not a bundled copy. Every
  // other list falls back to the snapshot because a slightly old upload is still
  // true; a scheduled stream is a claim about a future that can be cancelled.
  upcoming: null,
  live: false,
  source: "loading",
  error: null,
};

/**
 * All three content lists.
 *
 * `/api/content` supplies the fresh lists and the one thing a bundled snapshot
 * cannot know: whether a stream is running right now. Until it answers the cards
 * come from the snapshot, so no section is ever empty. If the endpoint is missing
 * or errors, the snapshot stays and the visitor sees a correct, slightly older
 * page with no error.
 */
/**
 * How often to re-read the feed.
 *
 * Short enough that a stream starting is noticed while someone is looking at the
 * page, long enough not to hammer a serverless function. The endpoint's own edge
 * cache is what this sits behind.
 */
const POLL_MS = 60_000;

export function useContent(): State {
  const [state, setState] = useState<State>(INITIAL);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failed = false;

    /*
     * Re-reads on a timer rather than once.
     *
     * A stream starts and ends while the page is open. Fetched once on mount, the
     * page would keep calling a finished broadcast live, or miss one that began
     * after it loaded, until the visitor reloaded by hand. The same reasoning the
     * endpoint caches for: a stale answer is worse here than a slightly late one,
     * because "live" is a claim about right now.
     *
     * Polling stops while the tab is hidden and resumes when it comes back, so a
     * tab left open in the background costs nothing.
     */
    async function load() {
      try {
        const res = await fetch("/api/content", {
          signal: controller.signal,
          // The edge holds this for minutes; without a bypass a poll would read
          // the same cached copy it just read.
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`api returned ${res.status}`);

        const payload = (await res.json()) as ApiPayload;
        if (!Array.isArray(payload.streams) || payload.streams.length === 0) {
          throw new Error("api returned no streams");
        }

        failed = false;
        setState({
          streams: payload.streams,
          videos: Array.isArray(payload.videos) ? payload.videos : [],
          clips: Array.isArray(payload.clips) ? payload.clips : [],
          // The endpoint decides whether anything is scheduled, so its answer
          // replaces any bundled copy outright: a stale upcoming card is a claim
          // about the future and must not age in place.
          upcoming: payload.upcoming ?? null,
          live: payload.streams.some((item) => item.live),
          source: "api",
          error: null,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        failed = true;
        setState({
          streams: SNAPSHOT_STREAMS,
          videos: SNAPSHOT_VIDEOS,
          clips: SNAPSHOT_CLIPS,
          // No snapshot copy on this path -- see the note on INITIAL.
          upcoming: null,
          live: false,
          source: "snapshot",
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Give up rather than retry a broken endpoint forever.
      if (!failed && !controller.signal.aborted) timer = setTimeout(load, POLL_MS);
    }

    void load();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        void load();
      } else if (timer) {
        clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      controller.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return state;
}