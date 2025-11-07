import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./UFCPage.css";
import { fetchSchedule, fetchEvent, fetchFighters } from "../api/sportsdata";

const ANALYSIS_TABS = ["Matchup", "Result", "Strikes", "Grappling", "Odds"];
const PYRAMID_TEMPLATE = [4, 3, 3, 2, 2, 1];
const FEATURED_CARDS = 2;
const MIN_LOADING_MS = 650;

const FLAG_IMAGE = {
  us: "/flags/us.svg",
  ug: "/flags/ug.svg",
  do: "/flags/do.svg",
  hr: "/flags/hr.svg",
  zw: "/flags/zw.svg",
  cu: "/flags/cu.svg",
  ro: "/flags/ro.svg",
  br: "/flags/br.svg",
  kr: "/flags/kr.svg",
  mx: "/flags/mx.svg",
  gb: "/flags/gb.svg",
  ca: "/flags/ca.svg",
  au: "/flags/au.svg",
  nz: "/flags/nz.svg",
  ru: "/flags/ru.svg",
  jp: "/flags/jp.svg",
  cn: "/flags/cn.svg",
  de: "/flags/de.svg",
  es: "/flags/es.svg",
  it: "/flags/it.svg",
  se: "/flags/se.svg",
  no: "/flags/no.svg",
  fi: "/flags/fi.svg",
  pl: "/flags/pl.svg",
  za: "/flags/za.svg",
  ng: "/flags/ng.svg",
  il: "/flags/il.svg",
  ae: "/flags/ae.svg",
  ie: "/flags/ie.svg",
  nl: "/flags/nl.svg",
  be: "/flags/be.svg",
  ch: "/flags/ch.svg",
  cz: "/flags/cz.svg",
  sk: "/flags/sk.svg",
  at: "/flags/at.svg",
  ar: "/flags/ar.svg",
  cl: "/flags/cl.svg",
  co: "/flags/co.svg",
  pe: "/flags/pe.svg",
  ph: "/flags/ph.svg",
  th: "/flags/th.svg",
  vn: "/flags/vn.svg",
  in: "/flags/in.svg",
  pk: "/flags/pk.svg",
  ma: "/flags/ma.svg",
  cm: "/flags/cm.svg",
  gh: "/flags/gh.svg",
  pr: "/flags/pr.svg",
  pt: "/flags/pt.svg",
  dk: "/flags/dk.svg",
  hu: "/flags/hu.svg",
  fr: "/flags/fr.svg",
};

const COUNTRY_TO_CODE = {
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  america: "us",
  "united kingdom": "gb",
  england: "gb",
  scotland: "gb",
  "north ireland": "gb",
  britain: "gb",
  brazil: "br",
  canada: "ca",
  mexico: "mx",
  france: "fr",
  spain: "es",
  italy: "it",
  germany: "de",
  ireland: "ie",
  sweden: "se",
  norway: "no",
  denmark: "dk",
  netherlands: "nl",
  belgium: "be",
  "costa rica": "cr",
  "dominican republic": "do",
  poland: "pl",
  croatia: "hr",
  serbia: "rs",
  georgia: "ge",
  russia: "ru",
  ukraine: "ua",
  belarus: "by",
  australia: "au",
  "new zealand": "nz",
  china: "cn",
  japan: "jp",
  korea: "kr",
  "south korea": "kr",
  "republic of korea": "kr",
  uganda: "ug",
  nigeria: "ng",
  ghana: "gh",
  cameroon: "cm",
  morocco: "ma",
  cuba: "cu",
  romania: "ro",
  argentina: "ar",
  chile: "cl",
  peru: "pe",
  colombia: "co",
  "puerto rico": "pr",
  "czech republic": "cz",
  slovakia: "sk",
  switzerland: "ch",
  austria: "at",
  lithuania: "lt",
  latvia: "lv",
  estonia: "ee",
  philippines: "ph",
  thailand: "th",
  vietnam: "vn",
  "south africa": "za",
  zimbabwe: "zw",
  "bosnia and herzegovina": "ba",
  albania: "al",
  greece: "gr",
  turkey: "tr",
  israel: "il",
  india: "in",
  pakistan: "pk",
  "united arab emirates": "ae",
  kazakhstan: "kz",
  uzbekistan: "uz",
  kyrgyzstan: "kg",
  moldova: "md",
  "north korea": "kp",
  "trinidad and tobago": "tt",
  "new caledonia": "nc",
  dominica: "dm",
};

const ISO3_TO_ISO2 = {
  USA: "us",
  CAN: "ca",
  MEX: "mx",
  BRA: "br",
  ARG: "ar",
  CHL: "cl",
  PER: "pe",
  COL: "co",
  FRA: "fr",
  GBR: "gb",
  ENG: "gb",
  IRL: "ie",
  ESP: "es",
  ITA: "it",
  DEU: "de",
  GER: "de",
  SWE: "se",
  NOR: "no",
  DNK: "dk",
  FIN: "fi",
  POL: "pl",
  NLD: "nl",
  BEL: "be",
  PRT: "pt",
  CHE: "ch",
  AUT: "at",
  ROU: "ro",
  HRV: "hr",
  SRB: "rs",
  SVN: "si",
  SVK: "sk",
  CZE: "cz",
  RUS: "ru",
  UKR: "ua",
  BLR: "by",
  GEO: "ge",
  ARM: "am",
  KAZ: "kz",
  UZB: "uz",
  KGZ: "kg",
  CHN: "cn",
  JPN: "jp",
  KOR: "kr",
  PRK: "kp",
  THA: "th",
  VNM: "vn",
  PHL: "ph",
  AUS: "au",
  NZL: "nz",
  ZAF: "za",
  NGA: "ng",
  GHA: "gh",
  CMR: "cm",
  MAR: "ma",
  EGY: "eg",
  TUN: "tn",
  DZA: "dz",
  UGA: "ug",
  KEN: "ke",
  TZA: "tz",
  ZWE: "zw",
  DOM: "do",
  CUB: "cu",
  PRI: "pr",
  BHS: "bs",
  JAM: "jm",
  PAN: "pa",
  CRI: "cr",
  ECU: "ec",
  BOL: "bo",
  VEN: "ve",
  LKA: "lk",
  IND: "in",
  PAK: "pk",
  ARE: "ae",
  QAT: "qa",
  SAU: "sa",
  ISR: "il",
  TUR: "tr",
  GRC: "gr",
  ALB: "al",
  BIH: "ba",
  MNE: "me",
  MKD: "mk",
  HUN: "hu",
  LTU: "lt",
  LVA: "lv",
  EST: "ee",
  MDA: "md",
  BGR: "bg",
  CYP: "cy",
  SGP: "sg",
  MYS: "my",
  IDN: "id",
};

const DEFAULT_FLAG = "/flags/default.svg";
const DEFAULT_CARD_IMAGE = "/assets/fighters/default-avatar.png";

function sanitizeHttps(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith("http://")) {
    return trimmed.replace("http://", "https://");
  }
  return trimmed;
}

const FIGHTER_MEDIA = {
  "Steve Garcia": {
    card: "/assets/fighters/GARCIA_STEVE_L_09-07.avif",
    full: "/assets/fighters/GARCIA_STEVE_L_09-07.avif",
    flag: FLAG_IMAGE.us,
  },
  "David Onama": {
    card: "/assets/fighters/ONAMA_DAVID_R_04-26.avif",
    full: "/assets/fighters/ONAMA_DAVID_R_04-26.avif",
    flag: FLAG_IMAGE.ug,
  },
  "Waldo Acosta": {
    card: "/assets/fighters/CORTES-ACOSTA_WALDO_L_03-15.avif",
    full: "/assets/fighters/CORTES-ACOSTA_WALDO_L_03-15.avif",
    flag: FLAG_IMAGE.do,
  },
  "Waldo Cortes-Acosta": {
    card: "/assets/fighters/CORTES-ACOSTA_WALDO_L_03-15.avif",
    full: "/assets/fighters/CORTES-ACOSTA_WALDO_L_03-15.avif",
    flag: FLAG_IMAGE.do,
  },
  "Ante Delija": {
    card: "/assets/fighters/DELIJA_ANTE_R_09-06.avif",
    full: "/assets/fighters/DELIJA_ANTE_R_09-06.avif",
    flag: FLAG_IMAGE.hr,
  },
  "Jeremiah Wells": {
    card: "/assets/fighters/WELLS_JEREMIAH_L_08-05.avif",
    full: "/assets/fighters/WELLS_JEREMIAH_L_08-05.avif",
    flag: FLAG_IMAGE.us,
  },
  "Themba Gorimbo": {
    card: "/assets/fighters/GORIMBO_THEMBA_R_12-07.avif",
    full: "/assets/fighters/GORIMBO_THEMBA_R_12-07.avif",
    flag: FLAG_IMAGE.zw,
  },
  "Isaac Dulgarian": {
    card: "/assets/fighters/DULGARIAN_ISAAC_L_09-07.avif",
    full: "/assets/fighters/DULGARIAN_ISAAC_L_09-07.avif",
    flag: FLAG_IMAGE.us,
  },
  "Yadier del Valle": {
    card: "/assets/fighters/DELVALLE_YADIER_R_10-15.avif",
    full: "/assets/fighters/DELVALLE_YADIER_R_10-15.avif",
    flag: FLAG_IMAGE.cu,
  },
};

const FALLBACK_EVENT_ID = "offline-event";

const FALLBACK_EVENT = {
  meta: {
    name: "UFC Fight Night (Offline Mode)",
    date: "2024-11-01",
    location: "UFC APEX — Las Vegas, NV",
    startTime: null,
  },
  mainCard: [
    {
      fighter1: "Steve Garcia",
      record1: "14-5-0",
      flag1: "us",
      fighter2: "David Onama",
      record2: "13-2-0",
      flag2: "ug",
    },
    {
      fighter1: "Waldo Acosta",
      record1: "10-1-0",
      flag1: "do",
      fighter2: "Ante Delija",
      record2: "24-5-0",
      flag2: "hr",
    },
    {
      fighter1: "Jeremiah Wells",
      record1: "12-3-1",
      flag1: "us",
      fighter2: "Themba Gorimbo",
      record2: "12-4-0",
      flag2: "zw",
    },
    {
      fighter1: "Isaac Dulgarian",
      record1: "7-0-0",
      flag1: "us",
      fighter2: "Yadier del Valle",
      record2: "6-1-0",
      flag2: "cu",
    },
    {
      fighter1: "Charles Radtke",
      record1: "9-3-0",
      flag1: "us",
      fighter2: "Daniel Frunza",
      record2: "7-2-0",
      flag2: "ro",
    },
    {
      fighter1: "Allan Nascimento",
      record1: "21-6-0",
      flag1: "br",
      fighter2: "Rafael Estevam",
      record2: "12-0-0",
      flag2: "br",
    },
  ],
  prelims: [
    {
      fighter1: "Billy Elekana",
      record1: "5-1-0",
      flag1: "us",
      fighter2: "Kevin Christian",
      record2: "7-3-0",
      flag2: "br",
    },
    {
      fighter1: "Timmy Cuamba",
      record1: "9-2-0",
      flag1: "us",
      fighter2: "ChangHo Lee",
      record2: "8-3-0",
      flag2: "kr",
    },
    {
      fighter1: "Donte Johnson",
      record1: "4-0-0",
      flag1: "us",
      fighter2: "Sedriques Dumas",
      record2: "9-1-0",
      flag2: "us",
    },
    {
      fighter1: "Ketlen Vieira",
      record1: "14-3-0",
      flag1: "br",
      fighter2: "Norma Dumont",
      record2: "10-2-0",
      flag2: "br",
    },
    {
      fighter1: "Alice Ardelean",
      record1: "9-2-0",
      flag1: "ro",
      fighter2: "Montserrat Ruiz",
      record2: "11-3-0",
      flag2: "mx",
    },
    {
      fighter1: "Phil Rowe",
      record1: "10-4-0",
      flag1: "us",
      fighter2: "Seokhyeon Ko",
      record2: "8-2-0",
      flag2: "kr",
    },
    {
      fighter1: "Talita Alencar",
      record1: "8-0-0",
      flag1: "br",
      fighter2: "Ariane Carnelossi",
      record2: "14-3-0",
      flag2: "br",
    },
  ],
};

const FALLBACK_SCHEDULE = [
  {
    EventId: FALLBACK_EVENT_ID,
    Name: FALLBACK_EVENT.meta.name,
    Date: FALLBACK_EVENT.meta.date,
  },
];

const BASELINE_STATS = {
  "Steve Garcia": {
    country: "United States",
    height: "6'0\"",
    heightRaw: 72,
    weight: "146 lb",
    weightRaw: 146,
    reach: "75 in",
    reachRaw: 75,
    leg_reach: "41 in",
    legReachRaw: 41,
    significantStrikes: 3.8,
    takedownAvg: 0.6,
    odds: -115,
  },
  "David Onama": {
    country: "Uganda",
    height: "5'11\"",
    heightRaw: 71,
    weight: "146 lb",
    weightRaw: 146,
    reach: "74 in",
    reachRaw: 74,
    leg_reach: "40 in",
    legReachRaw: 40,
    significantStrikes: 4.2,
    takedownAvg: 1.4,
    odds: 105,
  },
  "Waldo Acosta": {
    country: "Dominican Republic",
  },
  "Ante Delija": {
    country: "Croatia",
  },
};

function normalizeImageUrl(value) {
  return sanitizeHttps(value);
}

function resolveFlagCode(primary, secondary) {
  const attempts = [primary, secondary];
  for (const attempt of attempts) {
    if (!attempt) {
      continue;
    }
    const raw = String(attempt).trim();
    if (!raw) {
      continue;
    }
    if (/^[a-z]{2}$/i.test(raw)) {
      return raw.toLowerCase();
    }
    const upper = raw.toUpperCase();
    if (ISO3_TO_ISO2[upper]) {
      return ISO3_TO_ISO2[upper];
    }
    const normalized = raw.toLowerCase();
    if (COUNTRY_TO_CODE[normalized]) {
      return COUNTRY_TO_CODE[normalized];
    }
    const cleaned = normalized.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
    if (COUNTRY_TO_CODE[cleaned]) {
      return COUNTRY_TO_CODE[cleaned];
    }
    const token = cleaned.split(" ").find(Boolean);
    if (token && COUNTRY_TO_CODE[token]) {
      return COUNTRY_TO_CODE[token];
    }
  }
  return "us";
}

function getFlagAsset(code, fighterName) {
  const mediaFlag = FIGHTER_MEDIA[fighterName]?.flag;
  if (mediaFlag) {
    return mediaFlag;
  }
  const normalized = (code || "").toLowerCase();
  if (normalized && FLAG_IMAGE[normalized]) {
    return FLAG_IMAGE[normalized];
  }
  return normalized ? `/flags/${normalized}.svg` : DEFAULT_FLAG;
}

function selectFighterImage(profile = {}, variant = "card") {
  const name = profile.resolvedName || profile.Name || profile.FullName;
  if (name && FIGHTER_MEDIA[name]?.[variant]) {
    return FIGHTER_MEDIA[name][variant];
  }
  const candidates = [
    profile.CardImage,
    profile.cardImage,
    profile.FullImage,
    profile.fullImage,
    profile.PhotoUrl,
    profile.ProfileImageUrl,
    profile.ImageUrl,
    profile.HeadshotUrl,
    profile.FullBodyImageUrl,
    profile.PhotoUrlHiRes,
    profile.FightMetricProfileImage,
    profile.FanDuelImageUrl,
    profile.DraftKingsImageUrl,
    profile.FantasyDraftImageUrl,
  ];
  const match = candidates.map(normalizeImageUrl).find(Boolean);
  if (match) {
    return match;
  }
  if (name && FIGHTER_MEDIA[name]?.card && variant === "full") {
    return FIGHTER_MEDIA[name].card;
  }
  return null;
}

function getFighterImage(name, variant = "card", fallback) {
  if (FIGHTER_MEDIA[name]?.[variant]) {
    return FIGHTER_MEDIA[name][variant];
  }
  if (fallback) {
    return fallback;
  }
  return DEFAULT_CARD_IMAGE;
}

function fallbackImage(event, type = "flag") {
  if (event?.currentTarget) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = type === "flag" ? DEFAULT_FLAG : DEFAULT_CARD_IMAGE;
  }
}

function formatDiff(a, b, unit = "") {
  if (a == null || b == null) {
    return "—";
  }
  const diff = Number(a) - Number(b);
  if (!Number.isFinite(diff)) {
    return "—";
  }
  if (Math.abs(diff) < 0.05) {
    return `0${unit}`.trim();
  }
  const magnitude = Math.abs(diff);
  const display = Number.isInteger(magnitude) ? magnitude : magnitude.toFixed(1);
  const sign = diff > 0 ? "+" : "-";
  return `${sign}${display}${unit}`.trim();
}

function formatOdds(odds) {
  if (odds == null) {
    return "—";
  }
  const num = Number(odds);
  if (!Number.isFinite(num)) {
    return String(odds);
  }
  return num > 0 ? `+${num}` : String(num);
}

function formatEventDate(value) {
  if (!value) {
    return "Date TBA";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date TBA";
  }
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatOptionDate(value) {
  if (!value) {
    return "TBA";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBA";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function parseInches(value) {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 100) {
      return Math.round(value / 2.54);
    }
    return value;
  }
  const str = String(value).trim();
  if (!str) {
    return null;
  }
  const feetMatch = str.match(/^(\d+)'(\d+)?/);
  if (feetMatch) {
    const feet = Number(feetMatch[1]);
    const inches = feetMatch[2] != null ? Number(feetMatch[2]) : 0;
    return feet * 12 + inches;
  }
  const numeric = Number(str.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric)) {
    return null;
  }
  if (numeric > 100) {
    return Math.round(numeric / 2.54);
  }
  return numeric;
}

function formatHeight(inches) {
  if (!Number.isFinite(inches) || inches <= 0) {
    return null;
  }
  const feet = Math.floor(inches / 12);
  const rest = Math.round(inches % 12);
  return `${feet}'${rest}"`;
}

function parsePounds(value) {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function formatWeight(pounds) {
  if (!Number.isFinite(pounds) || pounds <= 0) {
    return null;
  }
  return `${Math.round(pounds)} lb`;
}

function formatReach(inches) {
  if (!Number.isFinite(inches) || inches <= 0) {
    return null;
  }
  return `${Math.round(inches)} in`;
}

function toNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function formatNumeric(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return Number(value).toFixed(digits);
}

function deriveFighterStats(full = {}, entry = {}) {
  const heightRaw = parseInches(full.HeightInches ?? full.Height ?? entry.Height);
  const reachRaw = parseInches(full.Reach ?? entry.Reach);
  const legReachRaw = parseInches(full.LegReach ?? entry.LegReach);
  const weightRaw = parsePounds(full.Weight ?? full.WeightPounds ?? entry.Weight);
  const strikes = toNumber(
    full.StrikesLandedPerMinute ?? full.SignificantStrikesLandedPerMinute ?? entry.SignificantStrikesLandedPerMinute,
  );
  const takedownAvg = toNumber(
    full.TakedownAveragePer15Minutes ?? full.TakedownsLandedPer15Minutes ?? entry.TakedownAveragePer15Minutes,
  );

  return {
    country: full.Country || entry.Country || entry.Nationality || "—",
    height: formatHeight(heightRaw),
    heightRaw,
    weight: formatWeight(weightRaw),
    weightRaw,
    reach: formatReach(reachRaw),
    reachRaw,
    leg_reach: formatReach(legReachRaw),
    legReachRaw,
    significantStrikes: strikes,
    takedownAvg,
    odds: entry.Moneyline ?? null,
  };
}

function buildPyramidLayout(list = []) {
  if (!list.length) {
    return [];
  }
  const reversed = [...list].reverse();
  const rows = [];
  let index = 0;
  let templateIndex = 0;
  while (index < reversed.length) {
    const size = PYRAMID_TEMPLATE[templateIndex] || PYRAMID_TEMPLATE[PYRAMID_TEMPLATE.length - 1];
    const slice = reversed.slice(index, index + size);
    rows.push({
      fights: slice,
      size: slice.length,
    });
    index += size;
    if (templateIndex < PYRAMID_TEMPLATE.length - 1) {
      templateIndex += 1;
    }
  }
  return rows;
}

function isBetterOdds(value, current) {
  if (value == null) {
    return false;
  }
  if (current == null) {
    return true;
  }
  const next = Number(value);
  const prev = Number(current);
  if (!Number.isFinite(next)) {
    return false;
  }
  if (!Number.isFinite(prev)) {
    return true;
  }
  if (next < 0 && prev >= 0) {
    return true;
  }
  if (next >= 0 && prev < 0) {
    return false;
  }
  return Math.abs(next) < Math.abs(prev);
}

function buildEventInsights(main = [], prelim = [], meta = {}) {
  const totalMain = main.length;
  const totalPrelims = prelim.length;
  const total = totalMain + totalPrelims;
  if (!total) {
    return [];
  }

  const featured = main.filter((fight) => fight.isInteractive);
  const reachDiffs = featured
    .map((fight) => {
      if (fight.stats1?.reachRaw == null || fight.stats2?.reachRaw == null) {
        return null;
      }
      return Math.abs(fight.stats1.reachRaw - fight.stats2.reachRaw);
    })
    .filter((value) => value != null);

  const avgReach = reachDiffs.length
    ? reachDiffs.reduce((sum, value) => sum + value, 0) / reachDiffs.length
    : null;

  let favoriteOdds = null;
  let favoriteName = "";
  [...main, ...prelim].forEach((fight) => {
    [
      { value: fight.odds1 ?? fight.stats1?.odds, name: fight.fighter1 },
      { value: fight.odds2 ?? fight.stats2?.odds, name: fight.fighter2 },
    ].forEach(({ value, name }) => {
      if (value == null) {
        return;
      }
      if (isBetterOdds(value, favoriteOdds)) {
        favoriteOdds = value;
        favoriteName = name || "";
      }
    });
  });

  const cards = [
    {
      label: "Total Bouts",
      value: total,
      detail:
        totalPrelims > 0
          ? `${totalMain} main · ${totalPrelims} prelim`
          : `${totalMain} main card`,
    },
    {
      label: "Featured Analysis",
      value: featured.length,
      detail: featured.length ? "Premium breakdowns" : "Locked soon",
    },
    {
      label: "Avg Reach Gap",
      value: avgReach != null ? `${avgReach.toFixed(1)} in` : "—",
      detail: reachDiffs.length ? "Featured fights" : "Awaiting data",
    },
    {
      label: "Shortest Odds",
      value: favoriteOdds != null ? formatOdds(favoriteOdds) : "—",
      detail: favoriteName || "Awaiting lines",
    },
  ];

  const startValue = meta?.startTime || meta?.date;
  if (startValue) {
    const start = new Date(startValue);
    if (!Number.isNaN(start.getTime())) {
      cards.push({
        label: "Broadcast Start",
        value: start.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
        detail: start.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
  }

  return cards;
}

function extractEventLocation(details = {}) {
  const { Venue, Location, Site, Arena, City, State, Country } = details || {};
  const composedCity = [City, State, Country].filter(Boolean).join(", ");
  const candidates = [Venue, Location, Site, Arena, composedCity].filter(Boolean);
  return candidates[0] || "Location TBA";
}

function FightCard({ fight, accent, analysisTrigger, onAnalysisClose }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState(ANALYSIS_TABS[0]);
  const isInteractive = fight.isInteractive;
  const fightKey = fight.fightId || `${fight.fighter1}-${fight.fighter2}-${fight.cardType}`;
  const triggerRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("modal-open", showAnalysis);
    if (showAnalysis) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAnalysis]);

  useEffect(() => {
    if (!analysisTrigger || !isInteractive) {
      return;
    }
    if (analysisTrigger.fightId !== fightKey) {
      if (showAnalysis) {
        setShowAnalysis(false);
      }
      return;
    }
    if (analysisTrigger.token && analysisTrigger.token === triggerRef.current) {
      return;
    }
    triggerRef.current = analysisTrigger.token || Date.now();
    setActiveTab(ANALYSIS_TABS[0]);
    setShowAnalysis(true);
  }, [analysisTrigger, fightKey, isInteractive, showAnalysis]);

  const fighter1Name = fight.fighter1 || "TBA";
  const fighter2Name = fight.fighter2 || "TBA";
  const fighter1Record = fight.record1 || "0-0-0";
  const fighter2Record = fight.record2 || "0-0-0";
  const fighter1Flag = fight.flag1 || "us";
  const fighter2Flag = fight.flag2 || "us";
  const flagSrc1 = fight.flagAsset1 || getFlagAsset(fighter1Flag, fighter1Name);
  const flagSrc2 = fight.flagAsset2 || getFlagAsset(fighter2Flag, fighter2Name);
  const cardImage1 = getFighterImage(fighter1Name, "card", fight.cardImage1);
  const cardImage2 = getFighterImage(fighter2Name, "card", fight.cardImage2);
  const fullImage1 = getFighterImage(fighter1Name, "full", fight.fullImage1 || fight.cardImage1 || cardImage1);
  const fullImage2 = getFighterImage(fighter2Name, "full", fight.fullImage2 || fight.cardImage2 || cardImage2);
  const s1 = fight.stats1 || BASELINE_STATS[fighter1Name] || {};
  const s2 = fight.stats2 || BASELINE_STATS[fighter2Name] || {};

  const cardClass = ["fight-card", accent ? `accent-${accent}` : "", isInteractive ? "" : "locked"].filter(Boolean).join(" ");

  const openAnalysis = () => {
    if (!isInteractive) {
      return;
    }
    triggerRef.current = Date.now();
    setActiveTab(ANALYSIS_TABS[0]);
    setShowAnalysis(true);
  };

  const closeAnalysis = () => {
    setShowAnalysis(false);
    triggerRef.current = null;
    if (onAnalysisClose) {
      onAnalysisClose();
    }
  };

  const oddsLine = fight.odds1 != null || fight.odds2 != null;

  return (
    <>
      <article className={cardClass}>
        <header className="fight-header">
          <div className="fighter-block">
            <span className="fighter-name">{fighter1Name}</span>
            <span className="fighter-record">{fighter1Record}</span>
          </div>
          <div className="matchup-flags">
            <img src={flagSrc1} alt={`${fighter1Name} flag`} onError={(event) => fallbackImage(event, "flag")} />
            <span className="vs-label">VS</span>
            <img src={flagSrc2} alt={`${fighter2Name} flag`} onError={(event) => fallbackImage(event, "flag")} />
          </div>
          <div className="fighter-block align-right">
            <span className="fighter-name">{fighter2Name}</span>
            <span className="fighter-record">{fighter2Record}</span>
          </div>
        </header>

        <div className="torso-row">
          <div className="torso left">
            <img src={cardImage1} alt={fighter1Name} loading="lazy" onError={(event) => fallbackImage(event, "fighter")} />
          </div>
          <div className="torso right">
            <img src={cardImage2} alt={fighter2Name} loading="lazy" onError={(event) => fallbackImage(event, "fighter")} />
          </div>
        </div>

        {(s1.height || s2.height || s1.reach || s2.reach) && (
          <div className="tape-card">
            <div className="tape-row">
              <span className="tape-label">Height</span>
              <span className="tape-value">{s1.height || "—"}</span>
              <span className="tape-diff">{formatDiff(s1.heightRaw, s2.heightRaw, " in")}</span>
              <span className="tape-value align-right">{s2.height || "—"}</span>
            </div>
            <div className="tape-row">
              <span className="tape-label">Reach</span>
              <span className="tape-value">{s1.reach || "—"}</span>
              <span className="tape-diff">{formatDiff(s1.reachRaw, s2.reachRaw, " in")}</span>
              <span className="tape-value align-right">{s2.reach || "—"}</span>
            </div>
          </div>
        )}

        {oddsLine && (
          <div className="odds-line">
            <span>{formatOdds(fight.odds1 ?? s1.odds)}</span>
            <span className="odds-divider">Odds</span>
            <span>{formatOdds(fight.odds2 ?? s2.odds)}</span>
          </div>
        )}

        <div className="card-footer">
          <button type="button" className="analysis-btn" onClick={openAnalysis} disabled={!isInteractive}>
            Detailed Comparison
          </button>
          <p className={`prediction ${isInteractive ? "active" : "inactive"}`}>
            {isInteractive ? "— No Prediction —" : "Analytics coming soon"}
          </p>
        </div>
      </article>

      {showAnalysis &&
        createPortal(
          <div className="analysis-overlay" onClick={closeAnalysis}>
            <div className="analysis-window" onClick={(event) => event.stopPropagation()}>
              <div className="analysis-header">
                <div className="analysis-athlete">
                  <img src={fullImage1} alt={fighter1Name} onError={(event) => fallbackImage(event, "fighter")} />
                  <div className="analysis-meta">
                    <strong>{fighter1Name}</strong>
                    <span>{fighter1Record}</span>
                    <div className="analysis-flag">
                      <img src={flagSrc1} alt={`${fighter1Name} flag`} onError={(event) => fallbackImage(event, "flag")} />
                      <span>{s1.country || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-divider">VS</div>

                <div className="analysis-athlete align-right">
                  <img src={fullImage2} alt={fighter2Name} onError={(event) => fallbackImage(event, "fighter")} />
                  <div className="analysis-meta">
                    <strong>{fighter2Name}</strong>
                    <span>{fighter2Record}</span>
                    <div className="analysis-flag">
                      <img src={flagSrc2} alt={`${fighter2Name} flag`} onError={(event) => fallbackImage(event, "flag")} />
                      <span>{s2.country || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tabs">
                {ANALYSIS_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="analysis-body">
                {activeTab === "Matchup" ? (
                  <div className="stats-grid">
                    <div className="stat-col">
                      <div className="stat-item">
                        <span className="label">Height</span>
                        <span className="value">{s1.height || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Weight</span>
                        <span className="value">{s1.weight || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Reach</span>
                        <span className="value">{s1.reach || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Leg Reach</span>
                        <span className="value">{s1.leg_reach || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Sig. Strikes</span>
                        <span className="value">{formatNumeric(s1.significantStrikes)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Takedown Avg</span>
                        <span className="value">{formatNumeric(s1.takedownAvg)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Odds</span>
                        <span className="value">{formatOdds(s1.odds)}</span>
                      </div>
                    </div>

                    <div className="stat-col diff">
                      <div className="diff-item">{formatDiff(s1.heightRaw, s2.heightRaw, " in")}</div>
                      <div className="diff-item">{formatDiff(s1.weightRaw, s2.weightRaw, " lb")}</div>
                      <div className="diff-item">{formatDiff(s1.reachRaw, s2.reachRaw, " in")}</div>
                      <div className="diff-item">{formatDiff(s1.legReachRaw, s2.legReachRaw, " in")}</div>
                      <div className="diff-item">{formatDiff(s1.significantStrikes, s2.significantStrikes)}</div>
                      <div className="diff-item">{formatDiff(s1.takedownAvg, s2.takedownAvg)}</div>
                    </div>

                    <div className="stat-col">
                      <div className="stat-item">
                        <span className="label">Height</span>
                        <span className="value">{s2.height || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Weight</span>
                        <span className="value">{s2.weight || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Reach</span>
                        <span className="value">{s2.reach || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Leg Reach</span>
                        <span className="value">{s2.leg_reach || "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Sig. Strikes</span>
                        <span className="value">{formatNumeric(s2.significantStrikes)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Takedown Avg</span>
                        <span className="value">{formatNumeric(s2.takedownAvg)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Odds</span>
                        <span className="value">{formatOdds(s2.odds)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="placeholder-panel">
                    <h3>{activeTab} insights</h3>
                    <p>Advanced {activeTab.toLowerCase()} analytics will unlock soon for VIP members.</p>
                  </div>
                )}
              </div>

              <div className="analysis-footer">
                <button type="button" className="close-analysis-btn" onClick={closeAnalysis}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function UFCPage({ onOpenStreams, onOpenBookmakers }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventMeta, setEventMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState(null);
  const fightersCache = useRef({ list: [], map: new Map() });
  const loadingStartRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadSchedule = async () => {
      try {
        const schedule = await fetchSchedule();
        if (!isMounted) {
          return;
        }
        const source = Array.isArray(schedule?.Events)
          ? schedule.Events
          : Array.isArray(schedule)
          ? schedule
          : [];
        if (!source.length) {
          setEvents(FALLBACK_SCHEDULE);
          return;
        }
        const map = new Map();
        source.forEach((item) => {
          if (!item?.EventId) {
            return;
          }
          const existing = map.get(item.EventId);
          if (!existing || new Date(item.Date || item.Day || item.DateTime) < new Date(existing.Date)) {
            map.set(item.EventId, {
              EventId: item.EventId,
              Name: item.Name,
              Date: item.Date || item.Day || item.DateTime,
            });
          }
        });
        const upcoming = Array.from(map.values()).sort((a, b) => {
          const dateA = new Date(a.Date || 0).getTime();
          const dateB = new Date(b.Date || 0).getTime();
          return dateA - dateB;
        });
        setEvents(upcoming.length ? [...upcoming, ...FALLBACK_SCHEDULE] : FALLBACK_SCHEDULE);
      } catch (error) {
        console.error("Schedule Error:", error);
        if (isMounted) {
          setEvents(FALLBACK_SCHEDULE);
        }
      }
    };

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedEvent && events.length) {
      setSelectedEvent(String(events[0].EventId));
    }
  }, [events, selectedEvent]);

  useEffect(() => {
    setAnalysisTarget(null);
  }, [selectedEvent]);

  useEffect(() => {
    setAnalysisTarget(null);
  }, [selectedEvent]);

  useEffect(() => {
    let isMounted = true;

    const finishLoading = () => {
      const start = loadingStartRef.current;
      if (!start) {
        setIsLoading(false);
        return;
      }
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) {
        setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        }, MIN_LOADING_MS - elapsed);
      } else {
        setIsLoading(false);
      }
    };

    const loadEventDetails = async () => {
      if (!selectedEvent) {
        setCurrentEvent(null);
        setEventMeta(null);
        return;
      }

      loadingStartRef.current = Date.now();
      setIsLoading(true);

      const fallbackMapper = (fight, index, cardType) => {
        const name1 = fight.fighter1 || "TBA";
        const name2 = fight.fighter2 || "TBA";
        const flag1 = resolveFlagCode(fight.flag1, BASELINE_STATS[name1]?.country);
        const flag2 = resolveFlagCode(fight.flag2, BASELINE_STATS[name2]?.country);
        const stats1 = BASELINE_STATS[name1] || null;
        const stats2 = BASELINE_STATS[name2] || null;
        const fightId = `${cardType}-${index}-${name1.replace(/\s+/g, "-")}-${name2.replace(/\s+/g, "-")}`;

        return {
          fighter1: name1,
          fighter2: name2,
          record1: fight.record1 || "0-0-0",
          record2: fight.record2 || "0-0-0",
          flag1,
          flag2,
          flagAsset1: getFlagAsset(flag1, name1),
          flagAsset2: getFlagAsset(flag2, name2),
          cardImage1: selectFighterImage({ resolvedName: name1 }, "card"),
          cardImage2: selectFighterImage({ resolvedName: name2 }, "card"),
          fullImage1: selectFighterImage({ resolvedName: name1 }, "full"),
          fullImage2: selectFighterImage({ resolvedName: name2 }, "full"),
          cardType,
          isInteractive: cardType === "main" && index < FEATURED_CARDS,
          stats1,
          stats2,
          odds1: stats1?.odds ?? null,
          odds2: stats2?.odds ?? null,
          fightId,
          isTitleFight: false,
        };
      };

      if (selectedEvent === FALLBACK_EVENT_ID) {
        const featuredMain = FALLBACK_EVENT.mainCard.map((fight, index) => fallbackMapper(fight, index, "main"));
        const featuredPrelims = FALLBACK_EVENT.prelims.map((fight, index) => fallbackMapper(fight, index, "prelim"));
        setCurrentEvent({ mainCard: featuredMain, prelims: featuredPrelims });
        setEventMeta({ ...FALLBACK_EVENT.meta });
        finishLoading();
        return;
      }

      try {
        if (!fightersCache.current.list.length) {
          const fighters = await fetchFighters();
          if (!isMounted) {
            return;
          }
          const map = new Map();
          fighters.forEach((athlete) => {
            if (athlete?.FighterId != null) {
              map.set(Number(athlete.FighterId), athlete);
            }
          });
          fightersCache.current = { list: fighters, map };
        }

        const details = await fetchEvent(selectedEvent);
        if (!isMounted) {
          return;
        }

        if (!details || !Array.isArray(details.Fights)) {
          setCurrentEvent({ mainCard: [], prelims: [] });
          setEventMeta({
            name: details?.Name || "Event",
            date: details?.DateTime || details?.Date || details?.Day || "",
            startTime: details?.StartTime || details?.DateTime || details?.Date || null,
            location: extractEventLocation(details),
          });
          finishLoading();
          return;
        }

        const enrichedFights = details.Fights.map((fight) => {
          const fightersInFight = (fight.Fighters || []).map((entry) => {
            const full = fightersCache.current.map.get(Number(entry.FighterId)) || {};
            const resolvedName = full?.Name || [full?.FirstName, full?.LastName].filter(Boolean).join(" ") || entry.Name;
            const profile = {
              ...entry,
              ...full,
              resolvedName,
            };
            const flagCode = resolveFlagCode(full?.CountryCode || entry.CountryCode, full?.Country || entry.Country || entry.Nationality);
            return {
              ...profile,
              flag: flagCode,
              stats: deriveFighterStats(full, entry),
              cardImage: selectFighterImage(profile, "card"),
              fullImage: selectFighterImage(profile, "full"),
            };
          });
          return { ...fight, Fighters: fightersInFight };
        }).filter((fight) => (fight.Fighters || []).length >= 2);

        enrichedFights.sort((a, b) => (a.Order || 0) - (b.Order || 0));

        let prelims = enrichedFights.filter((fight) => fight.CardSegment?.toLowerCase().includes("prelim"));
        let mainCard = enrichedFights.filter((fight) => fight.CardSegment?.toLowerCase().includes("main"));

        if (!prelims.length && !mainCard.length) {
          const midpoint = Math.floor(enrichedFights.length / 2);
          prelims = enrichedFights.slice(0, midpoint);
          mainCard = enrichedFights.slice(midpoint);
        }

        const toFightCard = (fight, index, cardType) => {
          const [f1, f2] = fight.Fighters;
          const name1 = f1?.resolvedName || "TBA";
          const name2 = f2?.resolvedName || "TBA";
          const record1 = f1?.Record || `${f1?.Wins ?? 0}-${f1?.Losses ?? 0}-${f1?.Draws ?? 0}`;
          const record2 = f2?.Record || `${f2?.Wins ?? 0}-${f2?.Losses ?? 0}-${f2?.Draws ?? 0}`;
          const flag1 = f1?.flag || resolveFlagCode(f1?.CountryCode, f1?.Country || f1?.Nationality);
          const flag2 = f2?.flag || resolveFlagCode(f2?.CountryCode, f2?.Country || f2?.Nationality);

          return {
            fighter1: name1,
            fighter2: name2,
            record1,
            record2,
            flag1,
            flag2,
            flagAsset1: getFlagAsset(flag1, name1),
            flagAsset2: getFlagAsset(flag2, name2),
            cardImage1: f1?.cardImage,
            cardImage2: f2?.cardImage,
            fullImage1: f1?.fullImage,
            fullImage2: f2?.fullImage,
            cardType,
            isInteractive: cardType === "main" && index < FEATURED_CARDS,
            stats1: f1?.stats,
            stats2: f2?.stats,
            odds1: f1?.Moneyline ?? f1?.stats?.odds ?? null,
            odds2: f2?.Moneyline ?? f2?.stats?.odds ?? null,
            fightId: fight.FightId || `${cardType}-${index}`,
            isTitleFight:
              Boolean(fight.IsTitleFight || fight.IsTitleBout || fight.TitleFight) ||
              Boolean(fight.Description && fight.Description.toLowerCase().includes("title")),
          };
        };

        const formattedMain = mainCard.map((fight, index) => toFightCard(fight, index, "main"));
        const formattedPrelims = prelims.map((fight, index) => toFightCard(fight, index, "prelim"));

        setCurrentEvent({ mainCard: formattedMain, prelims: formattedPrelims });
        setEventMeta({
          name: details?.Name || details?.ShortName || "UFC Event",
          date: details?.Date || details?.Day || details?.DateTime || details?.StartTime,
          startTime: details?.StartTime || details?.DateTime || details?.Date || null,
          location: extractEventLocation(details),
        });
      } catch (error) {
        console.error("Event Error:", error);
        if (isMounted) {
          const featuredMain = FALLBACK_EVENT.mainCard.map((fight, index) => fallbackMapper(fight, index, "main"));
          const featuredPrelims = FALLBACK_EVENT.prelims.map((fight, index) => fallbackMapper(fight, index, "prelim"));
          setCurrentEvent({ mainCard: featuredMain, prelims: featuredPrelims });
          setEventMeta({ ...FALLBACK_EVENT.meta });
        }
      } finally {
        if (isMounted) {
          finishLoading();
        }
      }
    };

    loadEventDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedEvent]);

  const mainRows = useMemo(() => buildPyramidLayout(currentEvent?.mainCard || []), [currentEvent]);
  const prelimRows = useMemo(() => buildPyramidLayout(currentEvent?.prelims || []), [currentEvent]);

  const eventInsights = useMemo(() => {
    if (!currentEvent) {
      return [];
    }
    return buildEventInsights(currentEvent.mainCard || [], currentEvent.prelims || [], eventMeta || {});
  }, [currentEvent, eventMeta]);

  const hasInteractiveFights = useMemo(
    () => currentEvent?.mainCard?.some((fight) => fight.isInteractive) ?? false,
    [currentEvent],
  );

  const handleGenerate = () => {
    if (!currentEvent?.mainCard?.length) {
      return;
    }
    const firstInteractive = currentEvent.mainCard.find((fight) => fight.isInteractive);
    if (firstInteractive) {
      document.getElementById("main-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setAnalysisTarget({
        fightId: firstInteractive.fightId || `${firstInteractive.fighter1}-${firstInteractive.fighter2}`,
        token: Date.now(),
      });
    }
  };

  return (
    <div className="ufc-page">
      <section className="ufc-hero" id="hero">
        <div className="hero-copy">
          <span className="hero-kicker">Next level fight analytics</span>
          <h1>UFC Predictor</h1>
          <p>
            Track every matchup, understand stylistic edges and prepare your wagers with a clear, professional-grade
            layout engineered for analysts.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={onOpenStreams}>
              Live Streams
            </button>
            <button type="button" onClick={onOpenBookmakers}>
              Top Bookmakers
            </button>
          </div>
        </div>
        <div className="hero-summary">
          <div className="summary-card">
            <span className="summary-title">Platform Vision</span>
            <p>
              Build one home for combat, traditional and esports intelligence. Football, basketball, boxing and more
              join the line-up soon.
            </p>
          </div>
          <div className="summary-card">
            <span className="summary-title">AI Roadmap</span>
            <p>Automated tape study, AI pick generation and opponent pattern detection are in private testing.</p>
          </div>
        </div>
      </section>

      <section className="event-shell" id="event-shell">
        <header className="event-toolbar">
          <div className="select-group">
            <label htmlFor="event-select">Upcoming Event</label>
            <div className="custom-dropdown">
              <select id="event-select" value={selectedEvent || ""} onChange={(event) => setSelectedEvent(event.target.value || null)}>
                {events.map((event) => (
                  <option key={event.EventId} value={String(event.EventId)}>
                    {event.Name} — {formatOptionDate(event.Date)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="event-actions">
            <button type="button" onClick={() => document.getElementById("main-card")?.scrollIntoView({ behavior: "smooth" })}>
              Main Card
            </button>
            <button type="button" onClick={() => document.getElementById("prelims")?.scrollIntoView({ behavior: "smooth" })}>
              Prelims
            </button>
            <button type="button" className="generate-btn" onClick={handleGenerate} disabled={!hasInteractiveFights}>
              Generate Analysis
            </button>
          </div>
        </header>

        {eventMeta && (
          <div className="event-meta" id="analytics">
            <div>
              <span className="meta-label">Event</span>
              <strong>{eventMeta.name}</strong>
            </div>
            <div>
              <span className="meta-label">Date</span>
              <strong>{formatEventDate(eventMeta.date)}</strong>
            </div>
            <div>
              <span className="meta-label">Location</span>
              <strong>{eventMeta.location}</strong>
            </div>
          </div>
        )}

        {eventInsights.length > 0 && (
          <div className="event-insights">
            {eventInsights.map((card) => (
              <div
                className={`insight-card${card.detail ? " has-detail" : ""}`}
                key={`${card.label}-${card.value}`}
              >
                <span className="insight-label">{card.label}</span>
                <strong className="insight-value">{card.value}</strong>
                {card.detail && <span className="insight-detail">{card.detail}</span>}
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="loading-banner">
            <div className="loading-pulse" />
            <span>Updating fight card…</span>
          </div>
        )}

        {currentEvent ? (
          <>
            <section className="card-section" id="main-card">
              <header className="section-header">
                <h2>Main Card</h2>
                <p>Headline matchups presented in a centered pyramid layout.</p>
              </header>
              <div className="fight-pyramid">
                {mainRows.map((row, rowIndex) => (
                  <div
                    className={`fight-row ${row.size === 1 ? "single" : row.size === 2 ? "duo" : ""}`}
                    key={`main-row-${rowIndex}`}
                  >
                    {row.fights.map((fight, index) => (
                      <FightCard
                        fight={fight}
                        accent="main"
                        analysisTrigger={analysisTarget}
                        onAnalysisClose={() => setAnalysisTarget(null)}
                        key={`main-${rowIndex}-${index}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>

            {currentEvent.prelims?.length > 0 && (
              <section className="card-section" id="prelims">
                <header className="section-header">
                  <h2>Prelims</h2>
                  <p>Prospects and stylistic tests ahead of the marquee attractions.</p>
                </header>
                <div className="fight-pyramid">
                  {prelimRows.map((row, rowIndex) => (
                    <div
                      className={`fight-row ${row.size === 1 ? "single" : row.size === 2 ? "duo" : ""}`}
                      key={`prelim-row-${rowIndex}`}
                    >
                      {row.fights.map((fight, index) => (
                        <FightCard
                          fight={fight}
                          accent="prelim"
                          analysisTrigger={analysisTarget}
                          onAnalysisClose={() => setAnalysisTarget(null)}
                          key={`prelim-${rowIndex}-${index}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="no-event-selected">
            <h3>Select an event</h3>
            <p>The fight grid will populate automatically with the next card.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default UFCPage;
