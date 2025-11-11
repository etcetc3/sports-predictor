import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./UFCPage.css";
import { fetchSchedule, fetchEvent, fetchFighters } from "../api/sportsdata";

const ANALYSIS_TABS = ["Matchup", "Result", "Strikes", "Grappling", "Odds"];
const PYRAMID_TEMPLATE = [4, 3, 3, 2, 2, 1];
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

function resolveFighterName(full = {}, entry = {}) {
  const direct = full.Name || entry.Name;
  if (direct) {
    return direct;
  }

  const preferred =
    full.PreferredName ||
    entry.PreferredName ||
    full.ShortName ||
    entry.ShortName ||
    full.KnownName ||
    entry.KnownName;
  if (preferred) {
    return preferred;
  }

  const first = full.FirstName || entry.FirstName;
  const last = full.LastName || entry.LastName;
  const nickname = full.Nickname || entry.Nickname || full.NickName || entry.NickName;

  const pieces = [first, nickname ? `"${nickname}"` : null, last].filter(Boolean);
  if (pieces.length) {
    return pieces.join(" ").replace(/\s+/g, " ").trim();
  }

  const alternative =
    full.FullName ||
    entry.FullName ||
    [first, last].filter(Boolean).join(" ") ||
    [last, first].filter(Boolean).join(" ");
  if (alternative) {
    return alternative.replace(/\s+/g, " ").trim();
  }

  const fallback = [last, first, nickname, full.DisplayName, entry.DisplayName].find((value) => value);
  return fallback ? String(fallback) : "";
}

function normalizeDirectoryKey(value) {
  if (value == null) {
    return null;
  }
  const str = String(value).trim();
  if (!str) {
    return null;
  }
  return str.toLowerCase();
}

function registerDirectoryValue(map, value, fighter, options = {}) {
  const key = normalizeDirectoryKey(value);
  if (!key) {
    return;
  }
  if (!options.force && map.has(key)) {
    return;
  }
  map.set(key, fighter);
}

function registerFighterProfile(map, fighter) {
  if (!fighter) {
    return;
  }

  const idCandidates = [
    fighter.FighterId,
    fighter.FighterID,
    fighter.EventFighterId,
    fighter.EventFighterID,
    fighter.PlayerId,
    fighter.PlayerID,
    fighter.PersonId,
    fighter.PersonID,
    fighter.SourceId,
    fighter.SourceID,
    fighter.GlobalId,
    fighter.GlobalID,
    fighter.SportsDataId,
    fighter.SportsDataID,
    fighter.StatsId,
    fighter.StatsID,
    fighter.RotowirePlayerID,
    fighter.RotoWirePlayerID,
    fighter.OddsPlayerID,
    fighter.OddsPlayerId,
  ];

  idCandidates.forEach((candidate) => registerDirectoryValue(map, candidate, fighter));

  const nameCandidates = [
    fighter.Name,
    fighter.FullName,
    fighter.DisplayName,
    fighter.ShortName,
    fighter.PreferredName,
    fighter.Nickname,
    fighter.NickName,
    [fighter.FirstName, fighter.LastName].filter(Boolean).join(" "),
    [fighter.LastName, fighter.FirstName].filter(Boolean).join(" "),
  ];

  nameCandidates
    .filter(Boolean)
    .forEach((candidate) => registerDirectoryValue(map, `name:${candidate}`, fighter));
}

function lookupFighterProfile(map, entry = {}) {
  if (!map || map.size === 0) {
    return null;
  }

  const idCandidates = [
    entry.FighterId,
    entry.FighterID,
    entry.EventFighterId,
    entry.EventFighterID,
    entry.PlayerId,
    entry.PlayerID,
    entry.PersonId,
    entry.PersonID,
    entry.SourceId,
    entry.SourceID,
    entry.GlobalId,
    entry.GlobalID,
    entry.SportsDataId,
    entry.SportsDataID,
    entry.StatsId,
    entry.StatsID,
  ];

  for (const candidate of idCandidates) {
    const key = normalizeDirectoryKey(candidate);
    if (!key) {
      continue;
    }
    const profile = map.get(key);
    if (profile) {
      return profile;
    }
  }

  const nameCandidates = [
    entry.Name,
    entry.FullName,
    entry.DisplayName,
    entry.PreferredName,
    entry.ShortName,
    entry.Nickname,
    entry.NickName,
    [entry.FirstName, entry.LastName].filter(Boolean).join(" "),
    [entry.LastName, entry.FirstName].filter(Boolean).join(" "),
  ];

  for (const candidate of nameCandidates) {
    if (!candidate) {
      continue;
    }
    const key = normalizeDirectoryKey(`name:${candidate}`);
    if (!key) {
      continue;
    }
    const profile = map.get(key);
    if (profile) {
      return profile;
    }
  }

  return null;
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
  "Charles Radtke": {
    card: "/assets/fighters/RADTKE_CHARLES_L_06-08.avif",
    full: "/assets/fighters/RADTKE_CHARLES_L_06-08.avif",
    flag: FLAG_IMAGE.us,
  },
  "Daniel Frunza": {
    card: "/assets/fighters/FRUNZA_DANIEL_R_04-05.avif",
    full: "/assets/fighters/FRUNZA_DANIEL_R_04-05.avif",
    flag: FLAG_IMAGE.ro,
  },
  "Allan Nascimento": {
    card: "/assets/fighters/NASCIMENTO_ALLAN_L_01-14.avif",
    full: "/assets/fighters/NASCIMENTO_ALLAN_L_01-14.avif",
    flag: FLAG_IMAGE.br,
  },
  "Rafael Estevam": {
    card: "/assets/fighters/ESTEVAM_RAFAEL_R_11-18.avif",
    full: "/assets/fighters/ESTEVAM_RAFAEL_R_11-18.avif",
    flag: FLAG_IMAGE.br,
  },
  "Billy Elekana": {
    card: "/assets/fighters/ELEKANA_BILLY_L_01-18.avif",
    full: "/assets/fighters/ELEKANA_BILLY_L_01-18.avif",
    flag: FLAG_IMAGE.us,
  },
  "Kevin Christian": {
    card: "/assets/fighters/CHRISTIAN_KEVIN_L_09-24.avif",
    full: "/assets/fighters/CHRISTIAN_KEVIN_L_09-24.avif",
    flag: FLAG_IMAGE.br,
  },
  "Timothy Cuamba": {
    card: "/assets/fighters/CUAMBA_TIMOTHY_L_04-26.avif",
    full: "/assets/fighters/CUAMBA_TIMOTHY_L_04-26.avif",
    flag: FLAG_IMAGE.us,
  },
  "Timmy Cuamba": {
    card: "/assets/fighters/CUAMBA_TIMOTHY_L_04-26.avif",
    full: "/assets/fighters/CUAMBA_TIMOTHY_L_04-26.avif",
    flag: FLAG_IMAGE.us,
  },
  "ChangHo Lee": {
    card: "/assets/fighters/LEE_CHANGHO_R_04-05.avif",
    full: "/assets/fighters/LEE_CHANGHO_R_04-05.avif",
    flag: FLAG_IMAGE.kr,
  },
  "Chang Ho Lee": {
    card: "/assets/fighters/LEE_CHANGHO_R_04-05.avif",
    full: "/assets/fighters/LEE_CHANGHO_R_04-05.avif",
    flag: FLAG_IMAGE.kr,
  },
  "Donte Johnson": {
    card: "/assets/fighters/JOHNSON_DONTE_L_08-26.avif",
    full: "/assets/fighters/JOHNSON_DONTE_L_08-26.avif",
    flag: FLAG_IMAGE.us,
  },
  "Sedriques Dumas": {
    card: "/assets/fighters/DUMAS_SEDRIQUES_R_06-24.avif",
    full: "/assets/fighters/DUMAS_SEDRIQUES_R_06-24.avif",
    flag: FLAG_IMAGE.us,
  },
  "Ketlen Vieira": {
    card: "/assets/fighters/VIEIRA_KETLEN_L_05-31.avif",
    full: "/assets/fighters/VIEIRA_KETLEN_L_05-31.avif",
    flag: FLAG_IMAGE.br,
  },
  "Norma Dumont": {
    card: "/assets/fighters/DUMONT_NORMA_R_09-14.avif",
    full: "/assets/fighters/DUMONT_NORMA_R_09-14.avif",
    flag: FLAG_IMAGE.br,
  },
  "Alice Ardelean": {
    card: "/assets/fighters/ARDELEAN_ALICE_R_07-27.avif",
    full: "/assets/fighters/ARDELEAN_ALICE_R_07-27.avif",
    flag: FLAG_IMAGE.ro,
  },
  "Montserrat Ruiz": {
    card: "/assets/fighters/RUIZ_MONTSERRAT_CONEJO_R_11-04.avif",
    full: "/assets/fighters/RUIZ_MONTSERRAT_CONEJO_R_11-04.avif",
    flag: FLAG_IMAGE.mx,
  },
  "Phil Rowe": {
    card: "/assets/fighters/ROWE_PHIL_L_06-14.avif",
    full: "/assets/fighters/ROWE_PHIL_L_06-14.avif",
    flag: FLAG_IMAGE.us,
  },
  "Seokhyeon Ko": {
    card: "/assets/fighters/KO_SEOKHYEON_L_06-21.avif",
    full: "/assets/fighters/KO_SEOKHYEON_L_06-21.avif",
    flag: FLAG_IMAGE.kr,
  },
  "Seok Hyeon Ko": {
    card: "/assets/fighters/KO_SEOKHYEON_L_06-21.avif",
    full: "/assets/fighters/KO_SEOKHYEON_L_06-21.avif",
    flag: FLAG_IMAGE.kr,
  },
  "Talita Alencar": {
    card: "/assets/fighters/ALENCAR_TALITA_L_12-09.avif",
    full: "/assets/fighters/ALENCAR_TALITA_L_12-09.avif",
    flag: FLAG_IMAGE.br,
  },
  "Ariane Carnelossi": {
    card: "/assets/fighters/CARNELOSSI_ARIANE_R_05-18.avif",
    full: "/assets/fighters/CARNELOSSI_ARIANE_R_05-18.avif",
    flag: FLAG_IMAGE.br,
  },
};

const STATIC_FIGHTER_ASSETS = [
  "7c76e7f9-1248-4c83-84d4-e9afba9f5247%2FDAUKAUS_KYLE_L_06-18.avif",
  "ALENCAR_TALITA_L_12-09.avif",
  "AMIL_HYDER_L_06-28.avif",
  "ARDELEAN_ALICE_R_07-27.avif",
  "BARCELOS_RAONI_R_06-14.avif",
  "BLANCHFIELD_ERIN_L_05-31.avif",
  "BONFIM_GABRIEL_L_07-25.avif",
  "BONFIM_ISMAEL_R_11-04.avif",
  "BRADY_SEAN_L_09-07.avif",
  "BROWN_RANDY_R_06-01.avif",
  "BUENO_SILVA_MAYRA_L_06-29.avif",
  "CARNELOSSI_ARIANE_R_05-18.avif",
  "CAVALCANTI_JACQUELINE_R_02-15.avif",
  "CHRISTIAN_KEVIN_L_09-24.avif",
  "CORTES-ACOSTA_WALDO_L_03-15.avif",
  "CORTEZ_TRACY_R_06-28.avif",
  "CUAMBA_TIMOTHY_L_04-26.avif",
  "DARIUSH_BENEIL_L_06-28.avif",
  "DELIJA_ANTE_R_09-06.avif",
  "DELLA_MADDALENA_JACK_L_BELTMOCK.avif",
  "DELVALLE_YADIER_R_10-15.avif",
  "DULGARIAN_ISAAC_L_09-07.avif",
  "DUMAS_SEDRIQUES_R_06-24.avif",
  "DUMONT_NORMA_R_09-14.avif",
  "DUNCAN_CHRISTIAN_LEROY_L_03-22.avif",
  "EDWARDS_LEON_L_03-22.avif",
  "ELEKANA_BILLY_L_01-18.avif",
  "EMMERS_JAMALL_R_03-30.avif",
  "ESTEVAM_RAFAEL_R_11-18.avif",
  "FRUNZA_DANIEL_R_04-05.avif",
  "GARCIA_STEVE_L_09-07.avif",
  "GOMES_DENISE_R_05-17.avif",
  "GORIMBO_THEMBA_R_12-07.avif",
  "HADDON_CODY_R_10-12.avif",
  "HILL_ANGELA_L_02-15.avif",
  "HOKIT_JOSH_L_08-19.avif",
  "JOHNS_MILES_L_08-09.avif",
  "JOHNSON_DONTE_L_08-26.avif",
  "KLINE_FATIMA_R_07-13.avif",
  "KO_SEOKHYEON_L_06-21.avif",
  "KOPYLOV_ROMAN_L_01-11.avif",
  "LEE_CHANGHO_R_04-05.avif",
  "MAKHACHEV_ISLAM_R_10-22.avif",
  "MARCOS_DANIEL_R_05-03.avif",
  "MARISCAL_CHEPE_R_03-01.avif",
  "MCCONICO_ERIC_R_08-09.avif",
  "MCVEY_JACKSON_R_07-19.avif",
  "MEDIC_UROS_R_01-11.avif",
  "MEERSCHAERT_GERALD_R_04-05.avif",
  "MORALES_JOSEPH_R_08-16.avif",
  "MORALES_MICHAEL_R_05-17.avif",
  "NASCIMENTO_ALLAN_L_01-14.avif",
  "NICKAL_BO_L_11-16.avif",
  "ONAMA_DAVID_R_04-26.avif",
  "PADILLA_CHRIS_L_04-27.avif",
  "PENNINGTON_TECIA_L_05-17.avif",
  "PRATES_CARLOS_R_08-16.avif",
  "RADTKE_CHARLES_L_06-08.avif",
  "ROWE_PHIL_L_06-14.avif",
  "RUIZ_MONTSERRAT_CONEJO_R_11-04.avif",
  "SABATINI_PAT_L_04-05.avif",
  "SAINT_DENIS_BENOIT_R_09-28.avif",
  "SALIKHOV_MUSLIM_L_07-26.avif",
  "SCHNELL_MATT_L_04-26.avif",
  "SHADOW_Fighter_fullLength_BLUE.avif",
  "SHEVCHENKO_VALENTINA_BELT_L_05-10.avif",
  "SIMON_RICKY_L_06-14.avif",
  "SUSURKAEV_BAYSANGUR_L_08-16.avif",
  "TULIO_MARCO_R_04-12.avif",
  "VALENTIN_ROBERT_R_07-19.avif",
  "VIEIRA_KETLEN_L_05-31.avif",
  "VIEIRA_RODOLFO_R_04-29.avif",
  "WEILI_ZHANG_R_06-11.avif",
  "WELLMAN_MALCOLM_L_06-14.avif",
  "WELLS_JEREMIAH_L_08-05.avif",
];

function safeDecodeAsset(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function normalizeText(value) {
  if (value == null) {
    return "";
  }
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toUpperCase();
}

function addNameTokens(target, value) {
  if (!target || value == null) {
    return;
  }

  const normalized = normalizeText(value);
  if (!normalized) {
    return;
  }

  const spaceTokens = normalized.split(/\s+/).filter(Boolean);
  if (spaceTokens.length === 0) {
    const sanitized = normalized.replace(/[^A-Z-]/g, "");
    if (sanitized) {
      target.add(sanitized);
      const collapsed = sanitized.replace(/-/g, "");
      if (collapsed && collapsed !== sanitized) {
        target.add(collapsed);
      }
      sanitized
        .split("-")
        .filter(Boolean)
        .forEach((part) => target.add(part));
    }
    return;
  }

  const sanitizedTokens = spaceTokens.map((token) => token.replace(/[^A-Z-]/g, "")).filter(Boolean);
  sanitizedTokens.forEach((token) => {
    target.add(token);
    const collapsed = token.replace(/-/g, "");
    if (collapsed && collapsed !== token) {
      target.add(collapsed);
    }
    const hyphenParts = token.split("-").filter(Boolean);
    if (hyphenParts.length > 1) {
      hyphenParts.forEach((part) => target.add(part));
      target.add(hyphenParts.join(""));
    }
  });

  for (let start = 0; start < sanitizedTokens.length; start += 1) {
    for (let end = start + 2; end <= sanitizedTokens.length; end += 1) {
      const slice = sanitizedTokens.slice(start, end);
      if (!slice.length) {
        continue;
      }
      target.add(slice.join(""));
      target.add(slice.join("-"));
    }
  }

  if (sanitizedTokens.length) {
    target.add(sanitizedTokens.join(""));
    target.add(sanitizedTokens.join("-"));
  }

  const collapsedAll = normalized.replace(/[^A-Z]/g, "");
  if (collapsedAll) {
    target.add(collapsedAll);
  }
}

const FIGHTER_ASSET_INDEX = STATIC_FIGHTER_ASSETS.map((filename) => {
  const decoded = safeDecodeAsset(filename);
  const base = decoded.replace(/\.[^.]+$/, "");
  const [identifier] = base.split(/_[LR]_/);
  const tokens = new Set();
  identifier
    .split("_")
    .filter(Boolean)
    .forEach((segment) => addNameTokens(tokens, segment));
  const primaryRaw = identifier.split("_")[0] || "";
  const primaryToken = normalizeText(primaryRaw).replace(/[^A-Z-]/g, "");
  const sanitizedPrimary = primaryToken.replace(/-/g, "");
  if (sanitizedPrimary && sanitizedPrimary !== primaryToken) {
    tokens.add(sanitizedPrimary);
  }

  const requiredMatchCount = Math.max(1, tokens.size <= 2 ? tokens.size : tokens.size - 1);

  return {
    filename,
    path: `/assets/fighters/${filename}`,
    identifier,
    tokens,
    primaryToken,
    requiredMatchCount,
  };
});

function resolveLocalFighterAsset(profile = {}) {
  const candidateTokens = new Set();
  const nameCandidates = [
    profile.resolvedName,
    profile.Name,
    profile.FullName,
    profile.DisplayName,
    profile.PreferredName,
    profile.ShortName,
    profile.KnownName,
    [profile.FirstName, profile.LastName].filter(Boolean).join(" "),
    [profile.LastName, profile.FirstName].filter(Boolean).join(" "),
  ];

  nameCandidates.forEach((candidate) => addNameTokens(candidateTokens, candidate));
  addNameTokens(candidateTokens, profile.Nickname);
  addNameTokens(candidateTokens, profile.NickName);

  if (!candidateTokens.size) {
    return null;
  }

  let bestEntry = null;
  let bestScore = 0;

  FIGHTER_ASSET_INDEX.forEach((entry) => {
    if (
      entry.primaryToken &&
      !candidateTokens.has(entry.primaryToken) &&
      !candidateTokens.has(entry.primaryToken.replace(/-/g, ""))
    ) {
      return;
    }

    let matchCount = 0;
    entry.tokens.forEach((token) => {
      if (candidateTokens.has(token)) {
        matchCount += 1;
      }
    });

    if (matchCount < entry.requiredMatchCount) {
      return;
    }

    const score = matchCount * 100 + entry.tokens.size;
    if (!bestEntry || score > bestScore) {
      bestEntry = entry;
      bestScore = score;
    }
  });

  if (bestEntry) {
    return bestEntry.path;
  }

  let fallbackEntry = null;
  let fallbackScore = 0;

  FIGHTER_ASSET_INDEX.forEach((entry) => {
    if (
      entry.primaryToken &&
      !candidateTokens.has(entry.primaryToken) &&
      !candidateTokens.has(entry.primaryToken.replace(/-/g, ""))
    ) {
      return;
    }

    let matchCount = 0;
    entry.tokens.forEach((token) => {
      if (candidateTokens.has(token)) {
        matchCount += 1;
      }
    });

    if (matchCount >= 2) {
      const score = matchCount * 10 + entry.tokens.size;
      if (!fallbackEntry || score > fallbackScore) {
        fallbackEntry = entry;
        fallbackScore = score;
      }
    }
  });

  return fallbackEntry ? fallbackEntry.path : null;
}

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

  const localAsset = resolveLocalFighterAsset(profile);
  if (localAsset) {
    return localAsset;
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

function computeAgeFromBirthDate(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function formatDateDisplay(value, fallback = "—") {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAgeValue(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return `${value} yrs`;
}

function composeHometown({ City, State, Country, BirthCity, BirthState, BirthCountry } = {}) {
  const primary = [City, State, Country].filter(Boolean).join(", ");
  if (primary) {
    return primary;
  }
  const birth = [BirthCity, BirthState, BirthCountry].filter(Boolean).join(", ");
  return birth || null;
}

function formatFightTime(value) {
  if (value == null || value === "") {
    return "—";
  }
  if (typeof value === "string" && value.includes(":")) {
    return value;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }
  return formatClockValue(numeric) || "—";
}

function parseNumeric(value) {
  if (value == null || value === "") {
    return null;
  }
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function secondsToClock(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }
  const totalSeconds = Math.max(0, Math.floor(Number(value)));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatClockValue(value) {
  if (value == null || value === "") {
    return "—";
  }
  if (typeof value === "number") {
    return secondsToClock(value) || "—";
  }
  const trimmed = String(value).trim();
  if (!trimmed) {
    return "—";
  }
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return secondsToClock(parseFloat(trimmed)) || "—";
  }
  return trimmed;
}

function formatPercentage(value) {
  if (value == null || value === "") {
    return "—";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }
  const percentage = numeric <= 1 && numeric >= 0 ? numeric * 100 : numeric;
  return `${percentage.toFixed(percentage % 1 === 0 ? 0 : 1)}%`;
}

function formatNumber(value, options = {}) {
  if (value == null || value === "") {
    return "—";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }
  const digits = options.digits ?? (Math.abs(numeric) >= 10 ? 0 : 1);
  return numeric.toFixed(digits);
}

function formatAttempt(landed, attempted) {
  if (landed == null && attempted == null) {
    return "—";
  }
  const landedText = landed == null ? "—" : formatNumber(landed, { digits: 0 });
  const attemptedText = attempted == null ? "—" : formatNumber(attempted, { digits: 0 });
  return `${landedText} / ${attemptedText}`;
}

function formatList(value) {
  if (!value && value !== 0) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  return String(value);
}

function buildFightMetrics(entry = {}) {
  const metrics = {
    result: entry.Result || entry.Outcome || entry.FightOutcome || null,
    resultDetail: entry.ResultComment || entry.ResultDetails || entry.DecisionDetail || null,
    knockdowns: entry.Knockdowns ?? entry.KnockdownsLanded ?? entry.Kd ?? entry.KDs ?? null,
    sigStrikesLanded:
      entry.SignificantStrikesLanded ?? entry.SigStrikesLanded ?? entry.SignificantStrikes ?? null,
    sigStrikesAttempted:
      entry.SignificantStrikesAttempted ?? entry.SigStrikesAttempted ?? entry.SignificantStrikesAttempted ?? null,
    totalStrikesLanded: entry.TotalStrikesLanded ?? entry.StrikesLanded ?? null,
    totalStrikesAttempted: entry.TotalStrikesAttempted ?? entry.StrikesAttempted ?? null,
    strikingAccuracy:
      entry.StrikingAccuracy ?? entry.SignificantStrikesAccuracy ?? entry.SignificantStrikeAccuracy ?? null,
    strikesAbsorbed:
      entry.StrikesAbsorbedPerMinute ?? entry.SignificantStrikesAbsorbedPerMinute ?? entry.StrikesAbsorbed ?? null,
    strikingDefense:
      entry.StrikingDefense ?? entry.SignificantStrikesDefense ?? entry.SignificantStrikeDefense ?? null,
    takedownsLanded: entry.TakedownsLanded ?? entry.Takedowns ?? null,
    takedownsAttempted: entry.TakedownsAttempted ?? null,
    takedownAccuracy: entry.TakedownAccuracy ?? null,
    takedownDefense: entry.TakedownDefense ?? null,
    takedownAverage: entry.TakedownAveragePer15Minutes ?? entry.TakedownAverage ?? null,
    submissionAverage:
      entry.SubmissionAveragePer15Minutes ?? entry.SubmissionAverage ?? entry.SubmissionAttemptsPer15Minutes ?? null,
    submissionAttempts: entry.SubmissionAttempts ?? null,
    reversals: entry.Reversals ?? null,
    controlTime: entry.ControlTimeSeconds ?? entry.ControlTime ?? null,
  };

  return Object.fromEntries(Object.entries(metrics).filter(([, value]) => value != null && value !== ""));
}

function moneylineToProbability(odds) {
  if (odds == null || odds === "") {
    return null;
  }
  const numeric = Number(odds);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return null;
  }
  let probability;
  if (numeric > 0) {
    probability = 100 / (numeric + 100);
  } else {
    probability = -numeric / (-numeric + 100);
  }
  return Math.max(0, Math.min(1, probability));
}

function pickFavorite(odds1, odds2, name1, name2) {
  if (odds1 == null || odds2 == null) {
    return null;
  }
  const a = Number(odds1);
  const b = Number(odds2);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) {
    return null;
  }
  if (a < 0 && b >= 0) {
    return name1;
  }
  if (b < 0 && a >= 0) {
    return name2;
  }
  if (a < 0 && b < 0) {
    return Math.abs(a) > Math.abs(b) ? name1 : name2;
  }
  return Math.abs(a) < Math.abs(b) ? name1 : name2;
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
  const heightSource = full.HeightInches ?? entry.HeightInches ?? full.Height ?? entry.Height;
  const weightSource = full.WeightInPounds ?? entry.WeightInPounds ?? full.Weight ?? entry.Weight;
  const reachSource = full.Reach ?? entry.Reach;
  const legReachSource = full.LegReach ?? entry.LegReach;
  const strikes =
    full.StrikesLandedPerMinute ?? entry.SignificantStrikesLandedPerMinute ?? entry.SignificantStrikesPerMinute;
  const takedownAvg =
    full.TakedownAveragePer15Minutes ?? entry.TakedownAveragePer15Minutes ?? entry.TakedownsPer15Minutes;
  const knockdownAvg =
    full.KnockdownAveragePer15Minutes ?? entry.KnockdownAveragePer15Minutes ?? entry.KnockdownsPer15Minutes ?? null;
  const avgFightTimeSeconds =
    parseNumeric(
      full.AverageFightTimeSeconds ??
        entry.AverageFightTimeSeconds ??
        full.AverageFightTime ??
        entry.AverageFightTime,
    );
  const careerFightTimeSeconds =
    parseNumeric(full.CareerFightTimeSeconds ?? entry.CareerFightTimeSeconds ?? entry.TotalFightTimeSeconds);

  const winsRaw = full.Wins ?? entry.Wins ?? entry.PreFightWins;
  const lossesRaw = full.Losses ?? entry.Losses ?? entry.PreFightLosses;
  const drawsRaw = full.Draws ?? entry.Draws ?? entry.PreFightDraws;
  const noContestsRaw = full.NoContests ?? entry.NoContests ?? entry.PreFightNoContests;

  const wins = winsRaw != null ? Number(winsRaw) : null;
  const losses = lossesRaw != null ? Number(lossesRaw) : null;
  const draws = drawsRaw != null ? Number(drawsRaw) : null;
  const noContests = noContestsRaw != null ? Number(noContestsRaw) : null;
  const totalFights =
    [wins, losses, draws, noContests].some((value) => value != null)
      ? (wins ?? 0) + (losses ?? 0) + (draws ?? 0) + (noContests ?? 0)
      : null;

  const birthDate =
    full.BirthDate || entry.BirthDate || full.DateOfBirth || entry.DateOfBirth || full.DOB || entry.DOB || null;
  const age = full.Age ?? entry.Age ?? computeAgeFromBirthDate(birthDate);
  const hometown = composeHometown({ ...full, ...entry });
  const camp =
    formatList([
      full.TrainingCamp,
      full.Camp,
      full.Gym,
      full.Team,
      entry.TrainingCamp,
      entry.Camp,
      entry.Gym,
      entry.Team,
    ]) || null;
  const coach = formatList([full.Coach, entry.Coach, entry.Trainer]) || null;
  const manager = formatList([full.Manager, entry.Manager]) || null;

  const weightClass = full.WeightClass || entry.WeightClass || entry.Class || entry.Division || null;
  const ranking = full.Rank ?? entry.Rank ?? entry.ChampionshipRank ?? entry.Ranking ?? null;

  const winsByKnockout =
    parseNumeric(full.WinsByKnockout ?? full.KnockoutWins ?? entry.WinsByKnockout ?? entry.KnockoutWins);
  const winsBySubmission = parseNumeric(full.WinsBySubmission ?? entry.WinsBySubmission);
  const winsByDecision = parseNumeric(full.WinsByDecision ?? entry.WinsByDecision);
  const winsByOther = parseNumeric(full.WinsByOther ?? entry.WinsByOther);

  const lossesByKnockout = parseNumeric(full.LossesByKnockout ?? entry.LossesByKnockout);
  const lossesBySubmission = parseNumeric(full.LossesBySubmission ?? entry.LossesBySubmission);
  const lossesByDecision = parseNumeric(full.LossesByDecision ?? entry.LossesByDecision);

  const finishRate =
    wins && (winsByKnockout != null || winsBySubmission != null)
      ? (Number(winsByKnockout ?? 0) + Number(winsBySubmission ?? 0)) / wins
      : null;

  return {
    country: full.Country || entry.Country || entry.Nationality || "—",
    height: inchesToHeight(heightSource),
    heightInches: parseNumeric(heightSource),
    weight: withUnit(weightSource, "lb"),
    weightPounds: parseNumeric(weightSource),
    reach: withUnit(reachSource, "in"),
    reachInches: parseNumeric(reachSource),
    leg_reach: withUnit(legReachSource, "in"),
    legReachInches: parseNumeric(legReachSource),
    significantStrikes: strikes != null ? Number(strikes).toFixed(2) : null,
    takedownAvg: takedownAvg != null ? Number(takedownAvg).toFixed(2) : null,
    knockdownAvg: knockdownAvg != null ? Number(knockdownAvg).toFixed(2) : null,
    odds: entry.Moneyline ?? entry.PreFightMoneyline ?? null,
    stance: full.Stance || entry.Stance || null,
    strikingAccuracy:
      full.StrikingAccuracy ?? entry.StrikingAccuracy ?? entry.SignificantStrikesAccuracy ?? null,
    strikesAbsorbed:
      full.StrikesAbsorbedPerMinute ??
      entry.StrikesAbsorbedPerMinute ??
      entry.SignificantStrikesAbsorbedPerMinute ??
      null,
    strikingDefense:
      full.StrikingDefense ?? entry.StrikingDefense ?? entry.SignificantStrikesDefense ?? null,
    takedownAccuracy: full.TakedownAccuracy ?? entry.TakedownAccuracy ?? null,
    takedownDefense: full.TakedownDefense ?? entry.TakedownDefense ?? null,
    submissionAverage:
      full.SubmissionAveragePer15Minutes ?? entry.SubmissionAveragePer15Minutes ?? entry.SubmissionAverage ?? null,
    submissionAttempts: entry.SubmissionAttempts ?? null,
    knockdowns: entry.Knockdowns ?? full.Knockdowns ?? null,
    controlTime: entry.ControlTimeSeconds ?? entry.ControlTime ?? null,
    age,
    birthDate,
    hometown,
    camp,
    coach,
    manager,
    ranking,
    weightClass,
    wins,
    losses,
    draws,
    noContests,
    totalFights,
    winsByKnockout,
    winsBySubmission,
    winsByDecision,
    winsByOther,
    lossesByKnockout,
    lossesBySubmission,
    lossesByDecision,
    finishRate,
    averageFightTimeSeconds: avgFightTimeSeconds,
    careerFightTimeSeconds,
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
    if (typeof document === "undefined") {
      return () => {};
    }

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

  const weightClassLabel = fight.weightClass || s1.weightClass || s2.weightClass || "";
  const matchupRows = [
    {
      label: "Height",
      left: s1.height || "—",
      right: s2.height || "—",
    },
    {
      label: "Weight",
      left: s1.weight || "—",
      right: s2.weight || "—",
    },
    {
      label: "Reach",
      left: s1.reach || "—",
      right: s2.reach || "—",
    },
    {
      label: "Leg Reach",
      left: s1.leg_reach || "—",
      right: s2.leg_reach || "—",
    },
    {
      label: "Age",
      left: formatAgeValue(s1.age),
      right: formatAgeValue(s2.age),
    },
    {
      label: "Stance",
      left: s1.stance || "—",
      right: s2.stance || "—",
    },
    {
      label: "Weight Class",
      left: s1.weightClass || weightClassLabel || "—",
      right: s2.weightClass || weightClassLabel || "—",
    },
    {
      label: "Ranking",
      left: s1.ranking || "—",
      right: s2.ranking || "—",
    },
    {
      label: "Odds",
      left: formatOdds(fight.odds1 ?? s1.odds),
      right: formatOdds(fight.odds2 ?? s2.odds),
    },
  ].filter((row) => row.left !== "—" || row.right !== "—");

  const profileRows = [
    {
      label: "Birthdate",
      left: formatDateDisplay(s1.birthDate),
      right: formatDateDisplay(s2.birthDate),
    },
    {
      label: "Country",
      left: s1.country || "—",
      right: s2.country || "—",
    },
    {
      label: "Hometown",
      left: s1.hometown || "—",
      right: s2.hometown || "—",
    },
    {
      label: "Camp",
      left: s1.camp || "—",
      right: s2.camp || "—",
    },
    {
      label: "Coach",
      left: s1.coach || "—",
      right: s2.coach || "—",
    },
    {
      label: "Manager",
      left: s1.manager || "—",
      right: s2.manager || "—",
    },
  ].filter((row) => row.left !== "—" || row.right !== "—");

  const performanceRows = [
    {
      label: "Pro Record",
      left: fighter1Record,
      right: fighter2Record,
    },
    {
      label: "Total Fights",
      left: s1.totalFights != null ? formatNumber(s1.totalFights, { digits: 0 }) : "—",
      right: s2.totalFights != null ? formatNumber(s2.totalFights, { digits: 0 }) : "—",
    },
    {
      label: "KO/TKO Wins",
      left: formatNumber(s1.winsByKnockout, { digits: 0 }),
      right: formatNumber(s2.winsByKnockout, { digits: 0 }),
    },
    {
      label: "Submission Wins",
      left: formatNumber(s1.winsBySubmission, { digits: 0 }),
      right: formatNumber(s2.winsBySubmission, { digits: 0 }),
    },
    {
      label: "Decision Wins",
      left: formatNumber(s1.winsByDecision, { digits: 0 }),
      right: formatNumber(s2.winsByDecision, { digits: 0 }),
    },
    {
      label: "Finish Rate",
      left: s1.finishRate != null ? formatPercentage(s1.finishRate) : "—",
      right: s2.finishRate != null ? formatPercentage(s2.finishRate) : "—",
    },
    {
      label: "Average Fight Time",
      left: formatFightTime(s1.averageFightTimeSeconds),
      right: formatFightTime(s2.averageFightTimeSeconds),
    },
    {
      label: "Career Fight Time",
      left: formatFightTime(s1.careerFightTimeSeconds),
      right: formatFightTime(s2.careerFightTimeSeconds),
    },
    {
      label: "Knockdown Avg / 15m",
      left: s1.knockdownAvg != null ? `${formatNumber(s1.knockdownAvg)} / 15m` : "—",
      right: s2.knockdownAvg != null ? `${formatNumber(s2.knockdownAvg)} / 15m` : "—",
    },
  ].filter((row) => row.left !== "—" || row.right !== "—");

  const outcome1 = (s1.result || "").toLowerCase();
  const outcome2 = (s2.result || "").toLowerCase();
  const winnerName =
    fight.winnerName ||
    (outcome1.startsWith("win") ? fighter1Name : outcome2.startsWith("win") ? fighter2Name : null);
  const methodText = fight.method || s1.resultDetail || s2.resultDetail || "";
  const fightStatus = fight.fightStatus || (winnerName ? "Final" : "Scheduled");
  const resultSummary =
    fight.resultSummary || (winnerName && methodText ? `${winnerName} • ${methodText}` : methodText || fightStatus);
  const finishRoundText = fight.finishRound ? `Round ${fight.finishRound}` : "—";
  const finishTimeText = formatClockValue(fight.finishTime);
  const refereeText = fight.referee || "—";
  const judgesText = fight.judges || fight.scorecard || "—";
  const oddsDisplay1 = formatOdds(fight.odds1 ?? s1.odds);
  const oddsDisplay2 = formatOdds(fight.odds2 ?? s2.odds);
  const implied1 = moneylineToProbability(fight.odds1 ?? s1.odds);
  const implied2 = moneylineToProbability(fight.odds2 ?? s2.odds);
  const overUnderText = fight.overUnder != null && fight.overUnder !== "" ? fight.overUnder : null;
  const overOddsDisplay = fight.overOdds != null ? formatOdds(fight.overOdds) : null;
  const underOddsDisplay = fight.underOdds != null ? formatOdds(fight.underOdds) : null;
  const baseFavorite = fight.favoriteName || null;
  const projectedFavorite =
    baseFavorite ||
    (winnerName
      ? winnerName
      : implied1 != null && implied2 != null
      ? implied1 > implied2
        ? fighter1Name
        : implied2 > implied1
        ? fighter2Name
        : null
      : null);
  const controlTime1 = s1.controlTime != null ? formatClockValue(s1.controlTime) : "—";
  const controlTime2 = s2.controlTime != null ? formatClockValue(s2.controlTime) : "—";
  const resultLabel1 = s1.result || (winnerName ? (winnerName === fighter1Name ? "Win" : "Loss") : "—");
  const resultLabel2 = s2.result || (winnerName ? (winnerName === fighter2Name ? "Win" : "Loss") : "—");

  const strikeRows = [
    {
      label: "Significant Strikes",
      left: formatAttempt(
        s1.sigStrikesLanded ?? s1.significantStrikesLanded ?? s1.significantStrikes,
        s1.sigStrikesAttempted ?? s1.significantStrikesAttempted,
      ),
      right: formatAttempt(
        s2.sigStrikesLanded ?? s2.significantStrikesLanded ?? s2.significantStrikes,
        s2.sigStrikesAttempted ?? s2.significantStrikesAttempted,
      ),
    },
    {
      label: "Sig. Strikes / Min",
      left: s1.significantStrikes != null ? formatNumber(s1.significantStrikes) : "—",
      right: s2.significantStrikes != null ? formatNumber(s2.significantStrikes) : "—",
    },
    {
      label: "Striking Accuracy",
      left: formatPercentage(s1.strikingAccuracy),
      right: formatPercentage(s2.strikingAccuracy),
    },
    {
      label: "Strikes Absorbed / Min",
      left: formatNumber(s1.strikesAbsorbed, { digits: 2 }),
      right: formatNumber(s2.strikesAbsorbed, { digits: 2 }),
    },
    {
      label: "Striking Defense",
      left: formatPercentage(s1.strikingDefense),
      right: formatPercentage(s2.strikingDefense),
    },
    {
      label: "Knockdown Avg / 15m",
      left: s1.knockdownAvg != null ? `${formatNumber(s1.knockdownAvg)} / 15m` : "—",
      right: s2.knockdownAvg != null ? `${formatNumber(s2.knockdownAvg)} / 15m` : "—",
    },
    {
      label: "Knockdowns",
      left: formatNumber(s1.knockdowns, { digits: 0 }),
      right: formatNumber(s2.knockdowns, { digits: 0 }),
    },
  ].filter((row) => row.left !== "—" || row.right !== "—");

  const grapplingRows = [
    {
      label: "Takedowns",
      left: formatAttempt(s1.takedownsLanded, s1.takedownsAttempted),
      right: formatAttempt(s2.takedownsLanded, s2.takedownsAttempted),
    },
    {
      label: "Takedown Accuracy",
      left: formatPercentage(s1.takedownAccuracy),
      right: formatPercentage(s2.takedownAccuracy),
    },
    {
      label: "Takedown Defense",
      left: formatPercentage(s1.takedownDefense),
      right: formatPercentage(s2.takedownDefense),
    },
    {
      label: "Takedown Avg / 15m",
      left: s1.takedownAvg != null ? `${formatNumber(s1.takedownAvg)} / 15m` : "—",
      right: s2.takedownAvg != null ? `${formatNumber(s2.takedownAvg)} / 15m` : "—",
    },
    {
      label: "Submission Avg / 15m",
      left: s1.submissionAverage != null ? `${formatNumber(s1.submissionAverage)} / 15m` : "—",
      right: s2.submissionAverage != null ? `${formatNumber(s2.submissionAverage)} / 15m` : "—",
    },
    {
      label: "Submission Attempts",
      left: formatNumber(s1.submissionAttempts, { digits: 0 }),
      right: formatNumber(s2.submissionAttempts, { digits: 0 }),
    },
    {
      label: "Control Time",
      left: controlTime1,
      right: controlTime2,
    },
  ].filter((row) => row.left !== "—" || row.right !== "—");

  const hasOddsData =
    (fight.odds1 ?? s1.odds ?? null) != null ||
    (fight.odds2 ?? s2.odds ?? null) != null ||
    overUnderText != null;

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

        {(weightClassLabel || fight.detailLine) && (
          <div className="fight-meta">
            {weightClassLabel && <span className="fight-detail primary">{weightClassLabel}</span>}
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

      {showAnalysis && typeof document !== "undefined" &&
        createPortal(
          <div className="analysis-overlay" onClick={() => setShowAnalysis(false)}>
            <div className="analysis-window" onClick={(event) => event.stopPropagation()}>
              <div className="analysis-header">
                <div className="analysis-athlete">
                  <img src={fullImage1} alt={fighter1Name} onError={(event) => fallbackImage(event, "fighter")} />
                  <div className="analysis-meta">
                    <strong>{fighter1Name}</strong>
                    <span>{fighter1Record}</span>
                    {weightClassLabel && <span className="analysis-weight">{weightClassLabel}</span>}
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
                    {weightClassLabel && <span className="analysis-weight">{weightClassLabel}</span>}
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
                {activeTab === "Matchup" && (
                  <div className="matchup-panels">
                    {matchupRows.length > 0 ? (
                      <div className="analysis-subsection">
                        <h3 className="stat-section-title">Vitals</h3>
                        <div className="stat-matrix">
                          <div className="stat-header">
                            <span>{fighter1Name}</span>
                            <span>Metric</span>
                            <span>{fighter2Name}</span>
                          </div>
                          {matchupRows.map((row) => (
                            <div className="stat-row" key={`vital-${row.label}`}>
                              <span className="stat-value">{row.left}</span>
                              <span className="stat-label">{row.label}</span>
                              <span className="stat-value">{row.right}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {profileRows.length > 0 ? (
                      <div className="analysis-subsection">
                        <h3 className="stat-section-title">Profile</h3>
                        <div className="stat-matrix">
                          <div className="stat-header">
                            <span>{fighter1Name}</span>
                            <span>Detail</span>
                            <span>{fighter2Name}</span>
                          </div>
                          {profileRows.map((row) => (
                            <div className="stat-row" key={`profile-${row.label}`}>
                              <span className="stat-value">{row.left}</span>
                              <span className="stat-label">{row.label}</span>
                              <span className="stat-value">{row.right}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {performanceRows.length > 0 ? (
                      <div className="analysis-subsection">
                        <h3 className="stat-section-title">Performance</h3>
                        <div className="stat-matrix">
                          <div className="stat-header">
                            <span>{fighter1Name}</span>
                            <span>Metric</span>
                            <span>{fighter2Name}</span>
                          </div>
                          {performanceRows.map((row) => (
                            <div className="stat-row" key={`performance-${row.label}`}>
                              <span className="stat-value">{row.left}</span>
                              <span className="stat-label">{row.label}</span>
                              <span className="stat-value">{row.right}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {matchupRows.length === 0 && profileRows.length === 0 && performanceRows.length === 0 && (
                      <div className="placeholder-panel">
                        <h3>Matchup details</h3>
                        <p>Fight metrics will appear here once the data provider releases official numbers.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Result" && (
                  <div className="result-grid">
                    <div className="result-summary">
                      <div className="result-col">
                        <span className="result-name">{fighter1Name}</span>
                        <span className={`result-outcome ${resultLabel1.toLowerCase()}`}>{resultLabel1}</span>
                      </div>
                      <div className="result-center">
                        <span className="result-status">{fightStatus}</span>
                        <strong className="result-headline">{resultSummary}</strong>
                        {methodText && methodText !== resultSummary && (
                          <span className="result-detail">{methodText}</span>
                        )}
                      </div>
                      <div className="result-col align-right">
                        <span className="result-name">{fighter2Name}</span>
                        <span className={`result-outcome ${resultLabel2.toLowerCase()}`}>{resultLabel2}</span>
                      </div>
                    </div>
                    <div className="result-meta-grid">
                      {[
                        { label: "Status", value: fightStatus },
                        { label: "Winner", value: winnerName || "TBA" },
                        { label: "Method", value: methodText || "—" },
                        { label: "Round", value: finishRoundText },
                        { label: "Time", value: finishTimeText },
                        { label: "Referee", value: refereeText },
                        { label: "Judges", value: judgesText },
                      ].map((row) => (
                        <div className="result-item" key={row.label}>
                          <span className="label">{row.label}</span>
                          <span className="value">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Strikes" && (
                  strikeRows.length ? (
                    <div className="stat-matrix">
                      <div className="stat-header">
                        <span>{fighter1Name}</span>
                        <span>Metric</span>
                        <span>{fighter2Name}</span>
                      </div>
                      {strikeRows.map((row) => (
                        <div className="stat-row" key={`strike-${row.label}`}>
                          <span className="stat-value">{row.left}</span>
                          <span className="stat-label">{row.label}</span>
                          <span className="stat-value">{row.right}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="placeholder-panel">
                      <h3>Striking data</h3>
                      <p>Detailed striking metrics will populate once the event provides official stats.</p>
                    </div>
                  )
                )}

                {activeTab === "Grappling" && (
                  grapplingRows.length ? (
                    <div className="stat-matrix">
                      <div className="stat-header">
                        <span>{fighter1Name}</span>
                        <span>Metric</span>
                        <span>{fighter2Name}</span>
                      </div>
                      {grapplingRows.map((row) => (
                        <div className="stat-row" key={`grappling-${row.label}`}>
                          <span className="stat-value">{row.left}</span>
                          <span className="stat-label">{row.label}</span>
                          <span className="stat-value">{row.right}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="placeholder-panel">
                      <h3>Grappling data</h3>
                      <p>Control, submission, and takedown metrics will be available post-fight.</p>
                    </div>
                  )
                )}

                {activeTab === "Odds" && (
                  hasOddsData ? (
                    <div className="odds-section">
                      <div className="odds-grid">
                        <div className={`odds-card ${projectedFavorite === fighter1Name ? "favorite" : ""}`}>
                          <span className="odds-label">{fighter1Name}</span>
                          <strong className="odds-value">{oddsDisplay1}</strong>
                          <span className="odds-hint">{implied1 != null ? formatPercentage(implied1) : "—"}</span>
                        </div>
                        <div className={`odds-card ${projectedFavorite === fighter2Name ? "favorite" : ""}`}>
                          <span className="odds-label">{fighter2Name}</span>
                          <strong className="odds-value">{oddsDisplay2}</strong>
                          <span className="odds-hint">{implied2 != null ? formatPercentage(implied2) : "—"}</span>
                        </div>
                      </div>
                      {projectedFavorite && <p className="odds-footnote">Projected favorite: {projectedFavorite}</p>}
                      {overUnderText && (
                        <div className="overunder-card">
                          <span className="overunder-title">Total Rounds {overUnderText}</span>
                          <div className="overunder-splits">
                            <span>Over {overOddsDisplay || "—"}</span>
                            <span>Under {underOddsDisplay || "—"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="placeholder-panel">
                      <h3>Odds outlook</h3>
                      <p>Moneyline and totals will appear here as soon as the sportsbooks publish them.</p>
                    </div>
                  )
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

      const fallbackMapper = (fight, index, cardType) => {
        const stats1 = { ...(BASELINE_STATS[fight.fighter1] || {}) };
        const stats2 = { ...(BASELINE_STATS[fight.fighter2] || {}) };
        const weightClass = fight.weightClass || fight.WeightClass || "";
        if (!stats1.weightClass && weightClass) {
          stats1.weightClass = weightClass;
        }
        if (!stats2.weightClass && weightClass) {
          stats2.weightClass = weightClass;
        }
        const odds1 = stats1.odds ?? null;
        const odds2 = stats2.odds ?? null;
        const favoriteName = pickFavorite(odds1, odds2, fight.fighter1, fight.fighter2);

        return {
          ...fight,
          cardType,
          fightKey: `${cardType}-${index}`,
          fightId: `${cardType}-${index}`,
          isInteractive: true,
          stats1,
          stats2,
          odds1,
          odds2,
          weightClass,
          detailLine: fight.detailLine || "",
          titleFight: Boolean(fight.titleFight || fight.weightClass?.toLowerCase().includes("title")),
          mainEvent: false,
          fightStatus: "Scheduled",
          method: "",
          resultSummary: "Scheduled",
          finishRound: null,
          finishTime: null,
          referee: "",
          scorecard: "",
          judges: "",
          winnerId: null,
          winnerName: null,
          overUnder: null,
          overOdds: null,
          underOdds: null,
          favoriteName,
        };
      };

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
              registerFighterProfile(map, athlete);
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
            const full = lookupFighterProfile(fighterDirectory, entry) || {};
            const resolvedName = resolveFighterName(full, entry) || entry.Name || "";

            const profile = {
              ...entry,
              ...full,
              resolvedName,
            };

            const flagCode = resolveFlagCode(
              full?.CountryCode || entry.CountryCode,
              full?.Country || entry.Country || entry.Nationality,
            );

            const baseStats = deriveFighterStats(full, entry);
            const fightMetrics = buildFightMetrics(entry);
            const combinedStats = { ...baseStats, ...fightMetrics };

            const cardImage = selectFighterImage(profile, "card");
            const fullImage = selectFighterImage(profile, "full");

            const resultText = combinedStats.result || entry.Result || entry.Outcome || null;
            const resultDetail =
              combinedStats.resultDetail || entry.ResultComment || entry.DecisionDetail || entry.ResultDetails || null;

            return {
              ...profile,
              flag: flagCode,
              stats: combinedStats,
              cardImage,
              fullImage,
              record: buildRecord({
                Record: full?.Record || entry.Record,
                Wins: full?.Wins ?? entry.Wins ?? entry.PreFightWins,
                Losses: full?.Losses ?? entry.Losses ?? entry.PreFightLosses,
                Draws: full?.Draws ?? entry.Draws ?? entry.PreFightDraws,
                NoContests: full?.NoContests ?? entry.NoContests ?? entry.PreFightNoContests,
              }),
              odds: entry.Moneyline ?? entry.PreFightMoneyline ?? null,
              resultText,
              resultDetail,
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

          const stats1 = { ...(f1?.stats || {}) };
          const stats2 = { ...(f2?.stats || {}) };
          if (!stats1.weightClass && weightClass) {
            stats1.weightClass = weightClass;
          }
          if (!stats2.weightClass && weightClass) {
            stats2.weightClass = weightClass;
          }
          if (!stats1.result && (f1?.Result || f1?.Outcome)) {
            stats1.result = f1.Result || f1.Outcome;
          }
          if (!stats1.result && f1?.resultText) {
            stats1.result = f1.resultText;
          }
          if (!stats2.result && (f2?.Result || f2?.Outcome)) {
            stats2.result = f2.Result || f2.Outcome;
          }
          if (!stats2.result && f2?.resultText) {
            stats2.result = f2.resultText;
          }
          if (!stats1.resultDetail && (f1?.ResultComment || f1?.DecisionDetail)) {
            stats1.resultDetail = f1.ResultComment || f1.DecisionDetail;
          }
          if (!stats1.resultDetail && f1?.resultDetail) {
            stats1.resultDetail = f1.resultDetail;
          }
          if (!stats2.resultDetail && (f2?.ResultComment || f2?.DecisionDetail)) {
            stats2.resultDetail = f2.ResultComment || f2.DecisionDetail;
          }
          if (!stats2.resultDetail && f2?.resultDetail) {
            stats2.resultDetail = f2.resultDetail;
          }

          const odds1 = f1?.odds ?? f1?.Moneyline ?? f1?.PreFightMoneyline ?? null;
          const odds2 = f2?.odds ?? f2?.Moneyline ?? f2?.PreFightMoneyline ?? null;
          const favoriteName = pickFavorite(odds1, odds2, name1, name2);

          const winnerId =
            fight.WinningFighterId ||
            fight.WinnerFighterID ||
            fight.WinnerId ||
            fight.FighterWinnerId ||
            null;
          const declaredWinner =
            winnerId && winnerId === f1?.FighterId
              ? name1
              : winnerId && winnerId === f2?.FighterId
              ? name2
              : fight.Winner || fight.WinningFighter || null;
          const fightStatus = fight.Status || fight.FightStatus || fight.EventStatus || fight.Stage || "Scheduled";
          const method =
            fight.Result || fight.Outcome || fight.Method || fight.MethodOfVictory || fight.ResultDescription || "";
          const finishRound = fight.EndingRound || fight.ResultRound || fight.RoundEnded || null;
          const finishTime = fight.EndingTime || fight.ResultTime || fight.Time || null;
          const referee = fight.Referee || fight.Official || fight.RefereeName || "";
          const scorecard = formatList(fight.Scorecard || fight.Scorecards || fight.Judges || fight.Decision);
          const overUnder = fight.OverUnder ?? fight.TotalRounds ?? fight.Total ?? null;
          const overOdds = fight.OverOdds ?? fight.OverPayout ?? fight.OverLine ?? null;
          const underOdds = fight.UnderOdds ?? fight.UnderPayout ?? fight.UnderLine ?? null;

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
            isInteractive: true,
            stats1,
            stats2,
            odds1,
            odds2,
            weightClass,
            detailLine,
            titleFight,
            mainEvent,
            rounds,
            fightStatus,
            method,
            resultSummary: declaredWinner && method ? `${declaredWinner} • ${method}` : method || fightStatus,
            finishRound,
            finishTime,
            referee,
            scorecard,
            judges: scorecard,
            winnerId,
            winnerName: declaredWinner,
            overUnder,
            overOdds,
            underOdds,
            favoriteName,
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

  const scrollToSection = useCallback((sectionId) => {
    if (typeof document === "undefined") {
      return;
    }
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
              <button type="button" onClick={() => scrollToSection("main-card")}>
                Main Card
              </button>
              <button type="button" onClick={() => scrollToSection("prelims")}>
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
