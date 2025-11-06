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
};

const DEFAULT_FLAG = "/flags/default.svg";
const DEFAULT_CARD_IMAGE = "/assets/fighters/default-avatar.png";

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
  "Ante Delija": {
    card: "/assets/fighters/DELIJA_ANTE_R_09-06.avif",
    full: "/assets/fighters/DELIJA_ANTE_R_09-06.avif",
    flag: FLAG_IMAGE.hr,
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

const STATS = {
  "Steve Garcia": {
    country: "United States",
    height: `6'0"`,
    weight: "146 lb",
    reach: "75 in",
    leg_reach: "41 in",
    significantStrikes: 3.8,
    takedownAvg: 0.6,
    odds: 1.85,
  },
  "David Onama": {
    country: "Uganda",
    height: `5'11"`,
    weight: "146 lb",
    reach: "74 in",
    leg_reach: "40 in",
    significantStrikes: 4.2,
    takedownAvg: 1.4,
    odds: 2.05,
  },
  "Waldo Acosta": {
    country: "Dominican Republic",
  },
  "Ante Delija": {
    country: "Croatia",
  },
};

function resolveFlagCode(value) {
  if (!value) {
    return "us";
  }
  const str = String(value).trim();
  if (!str) {
    return "us";
  }
  if (str.length === 2) {
    return str.toLowerCase();
  }
  return str.slice(0, 2).toLowerCase();
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

  return DEFAULT_FLAG;
}

function getFighterImage(name, variant = "card") {
  if (FIGHTER_MEDIA[name]?.[variant]) {
    return FIGHTER_MEDIA[name][variant];
  }

  return DEFAULT_CARD_IMAGE;
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
    month: "short",
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

function FightCard({ fight, accent }) {
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

  const fighter1Name = fight.fighter1 || "TBA";
  const fighter2Name = fight.fighter2 || "TBA";
  const fighter1Record = fight.record1 || "0-0-0";
  const fighter2Record = fight.record2 || "0-0-0";
  const fighter1Flag = fight.flag1 || "us";
  const fighter2Flag = fight.flag2 || "us";

  const s1 = STATS[fighter1Name] || {};
  const s2 = STATS[fighter2Name] || {};

  const cardClass = ["fight-card", accent ? `accent-${accent}` : "", isInteractive ? "" : "locked"]
    .filter(Boolean)
    .join(" ");

  const openAnalysis = () => {
    if (!isInteractive) {
      return;
    }
    setActiveTab(ANALYSIS_TABS[0]);
    setShowAnalysis(true);
  };

  return (
    <>
      <article className={cardClass}>
        <header className="fight-header">
          <div className="fighter-block">
            <span className="fighter-name">{fighter1Name}</span>
            <span className="fighter-record">{fighter1Record}</span>
          </div>
          <div className="matchup-flags">
            <img src={getFlagImage(fighter1Flag, fighter1Name)} alt={`${fighter1Name} flag`} />
            <span className="vs-label">VS</span>
            <img src={getFlagImage(fighter2Flag, fighter2Name)} alt={`${fighter2Name} flag`} />
          </div>
          <div className="fighter-block align-right">
            <span className="fighter-name">{fighter2Name}</span>
            <span className="fighter-record">{fighter2Record}</span>
          </div>
        </header>

        <div className="torso-row">
          <div className="torso left">
            <img src={getFighterImage(fighter1Name, "card")} alt={fighter1Name} loading="lazy" />
          </div>
          <div className="torso right">
            <img src={getFighterImage(fighter2Name, "card")} alt={fighter2Name} loading="lazy" />
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
                  <img src={getFighterImage(fighter1Name, "full")} alt={fighter1Name} />
                  <div className="analysis-meta">
                    <strong>{fighter1Name}</strong>
                    <span>{fighter1Record}</span>
                    <div className="analysis-flag">
                      <img src={getFlagImage(fighter1Flag, fighter1Name)} alt={`${fighter1Name} flag`} />
                      <span>{s1.country || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-divider">VS</div>

                <div className="analysis-athlete align-right">
                  <img src={getFighterImage(fighter2Name, "full")} alt={fighter2Name} />
                  <div className="analysis-meta">
                    <strong>{fighter2Name}</strong>
                    <span>{fighter2Record}</span>
                    <div className="analysis-flag">
                      <img src={getFlagImage(fighter2Flag, fighter2Name)} alt={`${fighter2Name} flag`} />
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
                        <span className="value">{s1.significantStrikes ?? "—"}</span>
                      </div>
                    </div>

                    <div className="stat-col diff">
                      <div className="diff-item">{formatDiff(s1.height, s2.height)}</div>
                      <div className="diff-item">{formatDiff(s1.weight, s2.weight)}</div>
                      <div className="diff-item">{formatDiff(s1.reach, s2.reach)}</div>
                      <div className="diff-item">{formatDiff(s1.leg_reach, s2.leg_reach)}</div>
                      <div className="diff-item">{formatDiff(s1.significantStrikes, s2.significantStrikes)}</div>
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
  const [isLoading, setIsLoading] = useState(false);
  const fightersCache = useRef([]);
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

        setEvents(upcoming.length ? upcoming : FALLBACK_SCHEDULE);
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
        return;
      }

      loadingStartRef.current = Date.now();
      setIsLoading(true);

      if (selectedEvent === FALLBACK_EVENT_ID) {
        const featuredMain = FALLBACK_EVENT.mainCard.map((fight, index) => ({
          ...fight,
          cardType: "main",
          isInteractive: index < FEATURED_CARDS,
        }));
        const featuredPrelims = FALLBACK_EVENT.prelims.map((fight) => ({
          ...fight,
          cardType: "prelim",
          isInteractive: false,
        }));
        setCurrentEvent({ mainCard: featuredMain, prelims: featuredPrelims });
        setEventMeta(FALLBACK_EVENT.meta);
        finishLoading();
        return;
      }

      try {
        let fighters = fightersCache.current;
        if (!fighters.length) {
          fighters = await fetchFighters();
          if (!isMounted) {
            return;
          }
          fightersCache.current = fighters;
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
          finishLoading();
          return;
        }

        const enrichedFights = details.Fights.map((fight) => {
          const fightersInFight = (fight.Fighters || []).map((entry) => {
            const full = fighters.find((athlete) => athlete.FighterId === entry.FighterId);
            const name = full?.Name || [full?.FirstName, full?.LastName].filter(Boolean).join(" ") || entry.Name;
            return {
              ...entry,
              ...full,
              resolvedName: name,
              flag: (full?.CountryCode || full?.Country || "us").toLowerCase(),
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

          return {
            fighter1: name1,
            fighter2: name2,
            record1,
            record2,
            flag1: resolveFlagCode(f1?.flag || f1?.CountryCode || f1?.Country),
            flag2: resolveFlagCode(f2?.flag || f2?.CountryCode || f2?.Country),
            cardType,
            isInteractive: cardType === "main" && index < FEATURED_CARDS,
          };
        };

        const formattedMain = mainCard.map((fight, index) => toFightCard(fight, index, "main"));
        const formattedPrelims = prelims.map((fight, index) => toFightCard(fight, index, "prelim"));

        setCurrentEvent({ mainCard: formattedMain, prelims: formattedPrelims });
        setEventMeta({
          name: details?.Name || details?.ShortName || "UFC Event",
          date: details?.DateTime || details?.StartTime || details?.Date,
          location: extractEventLocation(details),
        });
      } catch (error) {
        console.error("Event Error:", error);
        if (isMounted) {
          const featuredMain = FALLBACK_EVENT.mainCard.map((fight, index) => ({
            ...fight,
            cardType: "main",
            isInteractive: index < FEATURED_CARDS,
          }));
          const featuredPrelims = FALLBACK_EVENT.prelims.map((fight) => ({
            ...fight,
            cardType: "prelim",
            isInteractive: false,
          }));
          setCurrentEvent({ mainCard: featuredMain, prelims: featuredPrelims });
          setEventMeta(FALLBACK_EVENT.meta);
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
            <button type="button" onClick={onOpenStreams}>Live Streams</button>
            <button type="button" onClick={onOpenBookmakers}>Top Bookmakers</button>
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
            <p>
              Automated tape study, AI pick generation and opponent pattern detection are currently in private testing.
            </p>
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
            <button type="button" onClick={() => document.getElementById("main-card")?.scrollIntoView({ behavior: "smooth" })}>
              Main Card
            </button>
            <button type="button" onClick={() => document.getElementById("prelims")?.scrollIntoView({ behavior: "smooth" })}>
              Prelims
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
                      <FightCard fight={fight} accent="main" key={`main-${rowIndex}-${index}`} />
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
                        <FightCard fight={fight} accent="prelim" key={`prelim-${rowIndex}-${index}`} />
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
