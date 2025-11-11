import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./UFCPage.css";
import { fetchSchedule, fetchEvent, fetchFighters } from "../api/sportsdata";

const ANALYSIS_TABS = ["Matchup", "Result", "Strikes", "Grappling", "Odds"];
const PYRAMID_TEMPLATE = [4, 3, 3, 2, 2, 1];
const FEATURED_CARDS = 2;
const MIN_LOADING_MS = 650;
const UPCOMING_EVENT_STATUSES = new Set(["Scheduled", "PreFight", "InProgress"]);

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

function coerceHttps(value) {
  if (!value || typeof value !== "string") {
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
    return `https://${trimmed.slice(7)}`;
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
    height: "6'0",
    weight: "146 lb",
    reach: "75 in",
    leg_reach: "41 in",
    significantStrikes: 3.8,
    takedownAvg: 0.6,
    odds: -115,
  },
  "David Onama": {
    country: "Uganda",
    height: "5'11",
    weight: "146 lb",
    reach: "74 in",
    leg_reach: "40 in",
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

function sanitizeImageUrl(value) {
  const normalized = coerceHttps(value);
  if (!normalized) {
    return null;
  }
  return normalized.replace(/\s+/g, "%20");
}

function resolveFlagCode(primary, secondary) {
  const attempts = [primary, secondary];
  for (const attempt of attempts) {
    if (!attempt) continue;

    const raw = String(attempt).trim();
    if (!raw) continue;

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

function getFlagImage(code, fighterName) {
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
    profile.FightMetricProfileImage,
    profile.FanDuelImageUrl,
    profile.DraftKingsImageUrl,
    profile.FantasyDraftImageUrl,
  ];

  const match = candidates.map(sanitizeImageUrl).find(Boolean);
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

function formatDiff(a, b) {
  if (a == null || b == null) {
    return "—";
  }

  const numA = parseFloat(String(a).replace(/[^\d.]/g, "")) || 0;
  const numB = parseFloat(String(b).replace(/[^\d.]/g, "")) || 0;
  const diff = Math.abs((numA - numB).toFixed(1));

  if (numA === numB) {
    return "0";
  }

  return numA > numB ? `+${diff}` : `-${diff}`;
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

function inchesToHeight(value) {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "string" && value.includes("'")) {
    return value;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  const feet = Math.floor(num / 12);
  const inches = Math.round(num % 12);
  return `${feet}'${inches}"`;
}

function withUnit(value, unit) {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "string" && value.toLowerCase().includes(unit)) {
    return value;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return String(value);
  }
  return `${num} ${unit}`;
}

function buildRecord(source = {}) {
  if (source.Record) {
    return source.Record;
  }
  const wins = source.Wins ?? source.PreFightWins ?? source.PrevWins ?? 0;
  const losses = source.Losses ?? source.PreFightLosses ?? source.PrevLosses ?? 0;
  const draws = source.Draws ?? source.PreFightDraws ?? source.PrevDraws ?? 0;
  const noContests = source.NoContests ?? source.PreFightNoContests ?? source.PrevNoContests ?? 0;
  if (noContests) {
    return `${wins}-${losses}-${draws} (${noContests} NC)`;
  }
  return `${wins}-${losses}-${draws}`;
}

function deriveFighterStats(full = {}, entry = {}) {
  const height = inchesToHeight(full.HeightInches ?? full.Height ?? entry.Height);
  const weight = withUnit(full.Weight ?? entry.Weight, "lb");
  const reach = withUnit(full.Reach, "in") || withUnit(entry.Reach, "in");
  const legReach = withUnit(full.LegReach, "in") || withUnit(entry.LegReach, "in");
  const strikes = full.StrikesLandedPerMinute ?? entry.SignificantStrikesLandedPerMinute;
  const takedownAvg = full.TakedownAveragePer15Minutes ?? entry.TakedownAveragePer15Minutes;

  return {
    country: full.Country || entry.Country || entry.Nationality || "—",
    height,
    weight,
    reach,
    leg_reach: legReach,
    significantStrikes: strikes != null ? Number(strikes).toFixed(2) : null,
    takedownAvg: takedownAvg != null ? Number(takedownAvg).toFixed(2) : null,
    odds: entry.Moneyline ?? entry.PreFightMoneyline ?? null,
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
    rows.push(reversed.slice(index, index + size));
    index += size;
    if (templateIndex < PYRAMID_TEMPLATE.length - 1) {
      templateIndex += 1;
    }
  }

  return rows;
}

function extractEventLocation(details = {}) {
  const { Venue, Location, Site, Arena, City, State, Country } = details || {};
  const composedCity = [City, State, Country].filter(Boolean).join(", ");
  const candidates = [Venue, Location, Site, Arena, composedCity].filter(Boolean);
  return candidates[0] || "Location TBA";
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

function detectTitleFight(fight = {}) {
  return Boolean(
    fight.IsTitleFight ||
      fight.TitleFight ||
      fight.ChampionshipBout ||
      (fight.WeightClass && fight.WeightClass.toLowerCase().includes("title"))
  );
}

function FightCard({ fight, accent, autoFocus, onAutoHandled }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState(ANALYSIS_TABS[0]);
  const isInteractive = fight.isInteractive;

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
    if (autoFocus && isInteractive) {
      setActiveTab(ANALYSIS_TABS[0]);
      setShowAnalysis(true);
      onAutoHandled?.();
    }
  }, [autoFocus, isInteractive, onAutoHandled]);

  const fighter1Name = fight.fighter1 || "TBA";
  const fighter2Name = fight.fighter2 || "TBA";
  const fighter1Record = fight.record1 || "0-0-0";
  const fighter2Record = fight.record2 || "0-0-0";
  const fighter1Flag = fight.flag1 || "us";
  const fighter2Flag = fight.flag2 || "us";
  const flagSrc1 = fight.flagAsset1 || getFlagImage(fighter1Flag, fighter1Name);
  const flagSrc2 = fight.flagAsset2 || getFlagImage(fighter2Flag, fighter2Name);
  const cardImage1 = getFighterImage(fighter1Name, "card", fight.cardImage1);
  const cardImage2 = getFighterImage(fighter2Name, "card", fight.cardImage2);
  const fullImage1 = getFighterImage(fighter1Name, "full", fight.fullImage1 || fight.cardImage1 || cardImage1);
  const fullImage2 = getFighterImage(fighter2Name, "full", fight.fullImage2 || fight.cardImage2 || cardImage2);

  const s1 = fight.stats1 || BASELINE_STATS[fighter1Name] || {};
  const s2 = fight.stats2 || BASELINE_STATS[fighter2Name] || {};

  const cardClass = ["fight-card", accent ? `accent-${accent}` : "", isInteractive ? "" : "locked"]
    .filter(Boolean)
    .join(" ");

  const openAnalysis = useCallback(() => {
    if (!isInteractive) {
      return;
    }
    setActiveTab(ANALYSIS_TABS[0]);
    setShowAnalysis(true);
  }, [isInteractive]);

  return (
    <>
      <article className={cardClass}>
        <header className="fight-header">
          <div className="fighter-block">
            <span className="fighter-name">{fighter1Name}</span>
            <span className="fighter-record">{fighter1Record}</span>
            {fight.odds1 != null && <span className="fighter-odds">{formatOdds(fight.odds1)}</span>}
          </div>
          <div className="matchup-flags">
            <img src={flagSrc1} alt={`${fighter1Name} flag`} onError={(event) => fallbackImage(event, "flag")} />
            <span className="vs-label">VS</span>
            <img src={flagSrc2} alt={`${fighter2Name} flag`} onError={(event) => fallbackImage(event, "flag")} />
          </div>
          <div className="fighter-block align-right">
            <span className="fighter-name">{fighter2Name}</span>
            <span className="fighter-record">{fighter2Record}</span>
            {fight.odds2 != null && <span className="fighter-odds">{formatOdds(fight.odds2)}</span>}
          </div>
        </header>

        {(fight.mainEvent || fight.titleFight) && (
          <div className="fight-tags">
            {fight.mainEvent && <span className="fight-tag">Main Event</span>}
            {fight.titleFight && <span className="fight-tag highlight">Title Fight</span>}
          </div>
        )}

        {(fight.weightClass || fight.detailLine) && (
          <div className="fight-meta">
            {fight.weightClass && <span className="fight-detail primary">{fight.weightClass}</span>}
            {fight.detailLine && <span className="fight-detail subtle">{fight.detailLine}</span>}
          </div>
        )}

        <div className="torso-row">
          <div className="torso left">
            <img
              src={cardImage1}
              alt={fighter1Name}
              loading="lazy"
              onError={(event) => fallbackImage(event, "fighter")}
            />
          </div>
          <div className="torso right">
            <img
              src={cardImage2}
              alt={fighter2Name}
              loading="lazy"
              onError={(event) => fallbackImage(event, "fighter")}
            />
          </div>
        </div>

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
          <div className="analysis-overlay" onClick={() => setShowAnalysis(false)}>
            <div className="analysis-window" onClick={(event) => event.stopPropagation()}>
              <div className="analysis-header">
                <div className="analysis-athlete">
                  <img src={fullImage1} alt={fighter1Name} onError={(event) => fallbackImage(event, "fighter")} />
                  <div className="analysis-meta">
                    <strong>{fighter1Name}</strong>
                    <span>{fighter1Record}</span>
                    {fight.weightClass && <span className="analysis-weight">{fight.weightClass}</span>}
                    {fight.odds1 != null && <span className="analysis-odds">{formatOdds(fight.odds1)}</span>}
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
                    {fight.weightClass && <span className="analysis-weight">{fight.weightClass}</span>}
                    {fight.odds2 != null && <span className="analysis-odds">{formatOdds(fight.odds2)}</span>}
                    <div className="analysis-flag">
                      <img src={flagSrc2} alt={`${fighter2Name} flag`} onError={(event) => fallbackImage(event, "flag")} />
                      <span>{s2.country || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {(fight.mainEvent || fight.titleFight || fight.detailLine) && (
                <div className="analysis-overview">
                  {fight.mainEvent && <span className="analysis-tag">Main Event</span>}
                  {fight.titleFight && <span className="analysis-tag highlight">Title Fight</span>}
                  {fight.detailLine && <span className="analysis-meta-item">{fight.detailLine}</span>}
                </div>
              )}

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
                        <span className="value">{s1.significantStrikes ?? "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Takedown Avg</span>
                        <span className="value">{s1.takedownAvg ?? "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Odds</span>
                        <span className="value">{formatOdds(fight.odds1 ?? s1.odds)}</span>
                      </div>
                    </div>

                    <div className="stat-col diff">
                      <div className="diff-item">{formatDiff(s1.height, s2.height)}</div>
                      <div className="diff-item">{formatDiff(s1.weight, s2.weight)}</div>
                      <div className="diff-item">{formatDiff(s1.reach, s2.reach)}</div>
                      <div className="diff-item">{formatDiff(s1.leg_reach, s2.leg_reach)}</div>
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
                        <span className="value">{s2.significantStrikes ?? "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Takedown Avg</span>
                        <span className="value">{s2.takedownAvg ?? "—"}</span>
                      </div>
                      <div className="stat-item">
                        <span className="label">Odds</span>
                        <span className="value">{formatOdds(fight.odds2 ?? s2.odds)}</span>
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
                <button type="button" className="close-analysis-btn" onClick={() => setShowAnalysis(false)}>
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
  const [eventInsights, setEventInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fightersCache = useRef({ list: [], map: new Map() });
  const loadingStartRef = useRef(null);
  const [analysisTarget, setAnalysisTarget] = useState(null);

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
          const candidateDate = item.Date || item.Day || item.DateTime || item.Updated;
          if (!existing || new Date(candidateDate) < new Date(existing.Date || 0)) {
            map.set(item.EventId, {
              EventId: item.EventId,
              Name: item.Name,
              Date: candidateDate,
              Status: item.Status,
            });
          }
        });

        const now = Date.now();
        const upcoming = Array.from(map.values())
          .filter((event) => {
            if (UPCOMING_EVENT_STATUSES.has(event.Status)) {
              return true;
            }
            if (!event.Date) {
              return false;
            }
            const time = new Date(event.Date).getTime();
            if (Number.isNaN(time)) {
              return false;
            }
            return time >= now - 1000 * 60 * 60 * 12;
          })
          .sort((a, b) => {
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
        setEventInsights([]);
        return;
      }

      loadingStartRef.current = Date.now();
      setIsLoading(true);
      setAnalysisTarget(null);

      const fallbackMapper = (fight, index, cardType) => ({
        ...fight,
        cardType,
        fightKey: `${cardType}-${index}`,
        fightId: `${cardType}-${index}`,
        isInteractive: cardType === "main" && index < FEATURED_CARDS,
        stats1: BASELINE_STATS[fight.fighter1],
        stats2: BASELINE_STATS[fight.fighter2],
        weightClass: fight.weightClass || fight.WeightClass || "",
        detailLine: fight.detailLine || "",
        titleFight: Boolean(fight.titleFight || fight.weightClass?.toLowerCase().includes("title")),
        mainEvent: false,
      });

      if (selectedEvent === FALLBACK_EVENT_ID) {
        const featuredMain = FALLBACK_EVENT.mainCard.map((fight, index) => fallbackMapper(fight, index, "main"));
        const featuredPrelims = FALLBACK_EVENT.prelims.map((fight, index) => fallbackMapper(fight, index, "prelim"));
        if (featuredMain.length) {
          featuredMain[featuredMain.length - 1].mainEvent = true;
        }
        setCurrentEvent({ mainCard: featuredMain, prelims: featuredPrelims });
        setEventMeta(FALLBACK_EVENT.meta);
        const totalFallback = featuredMain.length + featuredPrelims.length;
        const titleFallback = featuredMain.filter((item) => item.titleFight).length;
        const headline = featuredMain[featuredMain.length - 1] || null;
        setEventInsights([
          headline
            ? {
                label: "Main Event",
                value: `${headline.fighter1} vs ${headline.fighter2}`,
                hint: headline.weightClass || "Headline bout",
              }
            : null,
          {
            label: "Total Fights",
            value: totalFallback,
            hint: `${featuredMain.length} main • ${featuredPrelims.length} prelim`,
          },
          {
            label: "Title Fights",
            value: titleFallback,
            hint: titleFallback ? "Championship stakes" : "None scheduled",
          },
          {
            label: "Analysis Ready",
            value: featuredMain.filter((item) => item.isInteractive).length,
            hint: "Featured matchups",
          },
        ].filter(Boolean));
        finishLoading();
        return;
      }

      try {
        if (!fightersCache.current.list.length) {
          try {
            const fighters = await fetchFighters();
            if (!isMounted) {
              return;
            }
            const map = new Map();
            fighters.forEach((athlete) => {
              if (athlete?.FighterId) {
                map.set(athlete.FighterId, athlete);
              }
            });
            fightersCache.current = { list: fighters, map };
          } catch (directoryError) {
            console.error("Fighter directory error:", directoryError);
            fightersCache.current = { list: [], map: new Map() };
          }
        }

        const details = await fetchEvent(selectedEvent);
        if (!isMounted) {
          return;
        }

        if (!details || !Array.isArray(details.Fights)) {
          setCurrentEvent({ mainCard: [], prelims: [] });
          setEventMeta({
            name: details?.Name || "Event",
            date: details?.DateTime || "",
            location: extractEventLocation(details),
          });
          setEventInsights([]);
          finishLoading();
          return;
        }

        const fighterDirectory = fightersCache.current.map || new Map();
        const enrichedFights = details.Fights.map((fight) => {
          const fightersInFight = (fight.Fighters || []).map((entry) => {
            const full = fighterDirectory.get(entry.FighterId) || {};
            const resolvedName =
              full?.Name ||
              [full?.FirstName, full?.LastName, full?.Nickname ? `"${full.Nickname}"` : null]
                .filter(Boolean)
                .join(" ") ||
              entry.Name;

            const profile = {
              ...entry,
              ...full,
              resolvedName,
            };

            const flagCode = resolveFlagCode(
              full?.CountryCode || entry.CountryCode,
              full?.Country || entry.Country || entry.Nationality,
            );

            return {
              ...profile,
              flag: flagCode,
              stats: deriveFighterStats(full, entry),
              cardImage: selectFighterImage(profile, "card"),
              fullImage: selectFighterImage(profile, "full"),
              record: buildRecord({
                Record: full?.Record || entry.Record,
                Wins: full?.Wins ?? entry.Wins ?? entry.PreFightWins,
                Losses: full?.Losses ?? entry.Losses ?? entry.PreFightLosses,
                Draws: full?.Draws ?? entry.Draws ?? entry.PreFightDraws,
                NoContests: full?.NoContests ?? entry.NoContests ?? entry.PreFightNoContests,
              }),
              odds: entry.Moneyline ?? entry.PreFightMoneyline ?? null,
            };
          });

          return { ...fight, Fighters: fightersInFight };
        }).filter((fight) => (fight.Fighters || []).length >= 2);

        enrichedFights.sort((a, b) => (a.Order || a.Sequence || 0) - (b.Order || b.Sequence || 0));

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
          const flag1 = f1?.flag || resolveFlagCode(f1?.CountryCode, f1?.Country || f1?.Nationality);
          const flag2 = f2?.flag || resolveFlagCode(f2?.CountryCode, f2?.Country || f2?.Nationality);
          const weightClass = fight.WeightClass || fight.FightWeightClass || "";
          const rounds = fight.ScheduledRounds || fight.NumberOfRounds || fight.Rounds || null;
          const titleFight = detectTitleFight(fight);

          const broadcast = fight.Broadcast || fight.TvStation || fight.Network || "";
          const detailParts = [];
          if (titleFight) {
            detailParts.push("Championship Bout");
          }
          if (rounds) {
            detailParts.push(`${rounds} Rounds`);
          }
          if (broadcast) {
            detailParts.push(broadcast);
          }
          const detailLine = detailParts.join(" • ");

          const fightId = fight.FightId || fight.FightID || fight.EventFightId;
          const mainEvent = Boolean(fight.MainEvent || fight.IsMainEvent || fight.Sequence === "Main");

          return {
            fightKey: String(fightId || `${cardType}-${index}`),
            fightId: fightId || `${cardType}-${index}`,
            fighter1: name1,
            fighter2: name2,
            record1: f1?.record || f1?.Record || buildRecord(f1) || buildRecord(),
            record2: f2?.record || f2?.Record || buildRecord(f2) || buildRecord(),
            flag1,
            flag2,
            flagAsset1: getFlagImage(flag1, name1),
            flagAsset2: getFlagImage(flag2, name2),
            cardImage1: f1?.cardImage,
            cardImage2: f2?.cardImage,
            fullImage1: f1?.fullImage,
            fullImage2: f2?.fullImage,
            cardType,
            isInteractive: cardType === "main" && index < FEATURED_CARDS,
            stats1: f1?.stats,
            stats2: f2?.stats,
            odds1: f1?.odds,
            odds2: f2?.odds,
            weightClass,
            detailLine,
            titleFight,
            mainEvent,
            rounds,
          };
        };

        const formattedMain = mainCard.map((fight, index) => toFightCard(fight, index, "main"));
        const formattedPrelims = prelims.map((fight, index) => toFightCard(fight, index, "prelim"));

        if (formattedMain.length) {
          formattedMain[formattedMain.length - 1].mainEvent = true;
        }

        const totalFights = formattedMain.length + formattedPrelims.length;
        const titleCount = formattedMain.filter((fight) => fight.titleFight).length;
        const analyticsReady = formattedMain.filter((fight) => fight.isInteractive).length;
        const headline = formattedMain[formattedMain.length - 1] || null;

        const insightPayload = [];
        if (headline) {
          insightPayload.push({
            label: "Main Event",
            value: `${headline.fighter1} vs ${headline.fighter2}`,
            hint: headline.weightClass || "Headline bout",
          });
        }
        insightPayload.push({
          label: "Total Fights",
          value: totalFights || "—",
          hint: `${formattedMain.length} main • ${formattedPrelims.length} prelim`,
        });
        insightPayload.push({
          label: "Title Fights",
          value: titleCount || "0",
          hint: titleCount ? "Championship stakes" : "None scheduled",
        });
        insightPayload.push({
          label: "Analysis Ready",
          value: analyticsReady || "0",
          hint: analyticsReady ? "Featured matchups" : "Coming soon",
        });

        setCurrentEvent({ mainCard: formattedMain, prelims: formattedPrelims });
        setEventMeta({
          name: details?.Name || details?.ShortName || "UFC Event",
          date: details?.DateTime || details?.StartTime || details?.Date,
          location: extractEventLocation(details),
        });
        setEventInsights(insightPayload);
      } catch (error) {
        console.error("Event Error:", error);
        if (isMounted) {
          const featuredMain = FALLBACK_EVENT.mainCard.map((fight, index) => fallbackMapper(fight, index, "main"));
          const featuredPrelims = FALLBACK_EVENT.prelims.map((fight, index) => fallbackMapper(fight, index, "prelim"));
          if (featuredMain.length) {
            featuredMain[featuredMain.length - 1].mainEvent = true;
          }
          setCurrentEvent({ mainCard: featuredMain, prelims: featuredPrelims });
          setEventMeta(FALLBACK_EVENT.meta);
          const totalFallback = featuredMain.length + featuredPrelims.length;
          const titleFallback = featuredMain.filter((item) => item.titleFight).length;
          const headline = featuredMain[featuredMain.length - 1] || null;
          setEventInsights([
            headline
              ? {
                  label: "Main Event",
                  value: `${headline.fighter1} vs ${headline.fighter2}`,
                  hint: headline.weightClass || "Headline bout",
                }
              : null,
            {
              label: "Total Fights",
              value: totalFallback,
              hint: `${featuredMain.length} main • ${featuredPrelims.length} prelim`,
            },
            {
              label: "Title Fights",
              value: titleFallback,
              hint: titleFallback ? "Championship stakes" : "None scheduled",
            },
            {
              label: "Analysis Ready",
              value: featuredMain.filter((item) => item.isInteractive).length,
              hint: "Featured matchups",
            },
          ].filter(Boolean));
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

  const handleGenerateAnalysis = () => {
    const featured = currentEvent?.mainCard?.find((fight) => fight.isInteractive);
    if (featured) {
      setAnalysisTarget(featured.fightKey);
    }
  };

  const handleAutoHandled = () => {
    setAnalysisTarget(null);
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
              <select
                id="event-select"
                value={selectedEvent || ""}
                onChange={(event) => setSelectedEvent(event.target.value || null)}
              >
                {events.map((event) => (
                  <option key={event.EventId} value={String(event.EventId)}>
                    {event.Name} — {formatOptionDate(event.Date)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="event-actions">
            <div className="event-shortcuts">
              <button
                type="button"
                onClick={() => document.getElementById("main-card")?.scrollIntoView({ behavior: "smooth" })}
              >
                Main Card
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("prelims")?.scrollIntoView({ behavior: "smooth" })}
              >
                Prelims
              </button>
            </div>
            <button
              type="button"
              className="generate-btn"
              onClick={handleGenerateAnalysis}
              disabled={!currentEvent?.mainCard?.some((fight) => fight.isInteractive)}
            >
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
          <div className="insight-grid">
            {eventInsights.map((insight) => (
              <div className="insight-card" key={insight.label}>
                <span className="insight-label">{insight.label}</span>
                <strong className="insight-value">{insight.value}</strong>
                {insight.hint && <span className="insight-hint">{insight.hint}</span>}
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
                  <div className="fight-row" key={`main-row-${rowIndex}`}>
                    {row.map((fight, index) => (
                      <FightCard
                        fight={fight}
                        accent="main"
                        key={fight.fightKey || `main-${rowIndex}-${index}`}
                        autoFocus={analysisTarget === fight.fightKey}
                        onAutoHandled={handleAutoHandled}
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
                    <div className="fight-row" key={`prelim-row-${rowIndex}`}>
                      {row.map((fight, index) => (
                        <FightCard
                          fight={fight}
                          accent="prelim"
                          key={fight.fightKey || `prelim-${rowIndex}-${index}`}
                          autoFocus={analysisTarget === fight.fightKey}
                          onAutoHandled={handleAutoHandled}
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
