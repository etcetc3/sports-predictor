import React, { useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { createPortal } from "react-dom";
import "./UFCPage.css";

const FIGHTER_IMAGE = {
  "Steve Garcia": "GARCIA_STEVE_L_09-07.avif",
  "David Onama": "ONAMA_DAVID_R_04-26.avif",
  "Waldo Acosta": "CORTES-ACOSTA_WALDO_L_03-15.avif",
  "Ante Delija": "DELIJA_ANTE_R_09-06.avif",
  "Jeremiah Wells": "WELLS_JEREMIAH_L_08-05.avif",
  "Themba Gorimbo": "GORIMBO_THEMBA_R_12-07.avif",
  "Isaac Dulgarian": "DULGARIAN_ISAAC_L_09-07.avif",
  "Yadier del Valle": "DELVALLE_YADIER_R_10-15.avif",
  "Charles Radtke": "RADTKE_CHARLES_L_06-08.avif",
  "Daniel Frunza": "FRUNZA_DANIEL_R_04-05.avif",
  "Allan Nascimento": "NASCIMENTO_ALLAN_L_01-14.avif",
  "Rafael Estevam": "ESTEVAM_RAFAEL_R_11-18.avif",
  "Billy Elekana": "ELEKANA_BILLY_L_01-18.avif",
  "Kevin Christian": "CHRISTIAN_KEVIN_L_09-24.avif",
  "Timmy Cuamba": "CUAMBA_TIMOTHY_L_04-26.avif",
  "ChangHo Lee": "LEE_CHANGHO_R_04-05.avif",
  "Donte Johnson": "JOHNSON_DONTE_L_08-26.avif",
  "Sedriques Dumas": "DUMAS_SEDRIQUES_R_06-24.avif",
  "Phil Rowe": "ROWE_PHIL_L_06-14.avif",
  "Seokhyeon Ko": "KO_SEOKHYEON_L_06-21.avif",
  "Ketlen Vieira": "VIEIRA_KETLEN_L_05-31.avif",
  "Norma Dumont": "DUMONT_NORMA_R_09-14.avif",
  "Alice Ardelean": "ARDELEAN_ALICE_R_07-27.avif",
  "Montserrat Ruiz": "RUIZ_MONTSERRAT_CONEJO_R_11-04.avif",
  "Talita Alencar": "ALENCAR_TALITA_L_12-09.avif",
  "Ariane Carnelossi": "CARNELOSSI_ARIANE_R_05-18.avif",
};

function getFighterImage(name) {
  if (!name) return "/assets/fighters/default-avatar.png";

  // Exakter Treffer
  if (FIGHTER_IMAGE[name]) return `/assets/fighters/${FIGHTER_IMAGE[name]}`;

  // Nachname-Suche
  const last = name.split(" ").pop().toLowerCase();
  const match = Object.keys(FIGHTER_IMAGE).find((k) =>
    k.toLowerCase().includes(last)
  );
  if (match) return `/assets/fighters/${FIGHTER_IMAGE[match]}`;

  // Fallback
  return "/assets/fighters/default-avatar.png";
}

const ufcFightNightNov1 = {
  mainCard: [
    { fighter1: "Steve Garcia", record1: "14-5-0", flag1: "us", fighter2: "David Onama", record2: "13-2-0", flag2: "ug" },
    { fighter1: "Waldo Acosta", record1: "10-1-0", flag1: "do", fighter2: "Ante Delija", record2: "24-5-0", flag2: "hr" },
    { fighter1: "Jeremiah Wells", record1: "12-3-1", flag1: "us", fighter2: "Themba Gorimbo", record2: "12-4-0", flag2: "zw" },
    { fighter1: "Isaac Dulgarian", record1: "7-0-0", flag1: "us", fighter2: "Yadier del Valle", record2: "6-1-0", flag2: "cu" },
    { fighter1: "Charles Radtke", record1: "9-3-0", flag1: "us", fighter2: "Daniel Frunza", record2: "7-2-0", flag2: "ro" },
    { fighter1: "Allan Nascimento", record1: "21-6-0", flag1: "br", fighter2: "Rafael Estevam", record2: "12-0-0", flag2: "br" },
  ],
  prelims: [
    { fighter1: "Billy Elekana", record1: "5-1-0", flag1: "us", fighter2: "Kevin Christian", record2: "7-3-0", flag2: "br" },
    { fighter1: "Timmy Cuamba", record1: "9-2-0", flag1: "us", fighter2: "ChangHo Lee", record2: "8-3-0", flag2: "kr" },
    { fighter1: "Donte Johnson", record1: "4-0-0", flag1: "us", fighter2: "Sedriques Dumas", record2: "9-1-0", flag2: "us" },
    { fighter1: "Ketlen Vieira", record1: "14-3-0", flag1: "br", fighter2: "Norma Dumont", record2: "10-2-0", flag2: "br" },
    { fighter1: "Alice Ardelean", record1: "9-2-0", flag1: "ro", fighter2: "Montserrat Ruiz", record2: "11-3-0", flag2: "mx" },
    { fighter1: "Phil Rowe", record1: "10-4-0", flag1: "us", fighter2: "Seokhyeon Ko", record2: "8-2-0", flag2: "kr" },
    { fighter1: "Talita Alencar", record1: "8-0-0", flag1: "br", fighter2: "Ariane Carnelossi", record2: "14-3-0", flag2: "br" },
  ],
};

// Example stats - expand with real data as you like
const STATS = {
  "Steve Garcia": { country: "United States", height: `6'0"`, weight: "146 lb", reach: "75 in", leg_reach: "41 in", significantStrikes: 3.8, takedownAvg: 0.6, odds: 1.85 },
  "David Onama": { country: "Uganda", height: `5'11"`, weight: "146 lb", reach: "74 in", leg_reach: "40 in", significantStrikes: 4.2, takedownAvg: 1.4, odds: 2.05 },
};

function formatDiff(a, b) {
  if (a == null || b == null) return "—";
  const numA = parseFloat(String(a).replace(/[^\d.]/g, "")) || 0;
  const numB = parseFloat(String(b).replace(/[^\d.]/g, "")) || 0;
  const diff = Math.abs((numA - numB).toFixed(1));
  if (numA === numB) return "0";
  return numA > numB ? `+${diff}` : `-${diff}`;
}

function FightCard({ fight, glowClass }) {
  const [showAnalysis, setShowAnalysis] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Matchup");

  React.useEffect(() => {
    document.body.classList.toggle("modal-open", showAnalysis);
    // prevent background scroll when modal open
    document.body.style.overflow = showAnalysis ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAnalysis]);

  const s1 = STATS[fight.fighter1] || {};
  const s2 = STATS[fight.fighter2] || {};

  return (
    <>
      {/* --- FIGHT CARD --- */}
      <div className={`fight-card ${glowClass}`}>
        <div className="fighter-info-row">
          <div className="fighter-side left">
            <div className="fighter-name-row">
              <span className="fighter">{fight.fighter1}</span>
              <ReactCountryFlag
                countryCode={fight.flag1.toUpperCase()}
                svg
                style={{
                  width: "22px",
                  height: "15px",
                  marginLeft: "-5px",
                  borderRadius: "2px",
                  boxShadow: "0 0 3px rgba(0,0,0,0.45)",
                }}
              />
            </div>
            <div className="fighter-record">{fight.record1}</div>
          </div>

          <div className="vs-center">VS</div>

          <div className="fighter-side right">
            <div className="fighter-name-row">
              <ReactCountryFlag
                countryCode={fight.flag2.toUpperCase()}
                svg
                style={{
                  width: "22px",
                  height: "15px",
                  marginRight: "-5px",
                  borderRadius: "2px",
                  boxShadow: "0 0 3px rgba(0,0,0,0.45)",
                }}
              />
              <span className="fighter">{fight.fighter2}</span>
            </div>
            <div className="fighter-record">{fight.record2}</div>
          </div>
        </div>

        <div className="torso-row">
          <div className="torso left">
            <img
              src={`/assets/fighters/${FIGHTER_IMAGE[fight.fighter1]}`}
              alt={fight.fighter1}
              loading="lazy"
            />
          </div>
          <div className="torso right">
            <img
              src={`/assets/fighters/${FIGHTER_IMAGE[fight.fighter2]}`}
              alt={fight.fighter2}
              loading="lazy"
            />
          </div>
        </div>

        <button
          className="analysis-btn under-vs"
          onClick={() => {
            setActiveTab("Matchup");
            setShowAnalysis(true);
          }}
        >
          Comparison
        </button>

        {/* MODAL (Popup) */}
        {showAnalysis &&
          createPortal(<div
            className="analysis-overlay centered"
            onClick={() => setShowAnalysis(false)}
          >
            <div
              className="analysis-window modern"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="analysis-header modern-header">
                {/* Linker Kämpfer */}
                <div className="fighter-head left">
                  <img
                    src={`/assets/fighters/${FIGHTER_IMAGE[fight.fighter1]}`}
                    alt={fight.fighter1}
                  />
                  <div className="fighter-meta">
                    <strong>{fight.fighter1}</strong>
                    <div className="small">{fight.record1}</div>
                    <div className="small">
                      <ReactCountryFlag
                        countryCode={fight.flag1.toUpperCase()}
                        svg
                        style={{
                          width: "18px",
                          height: "12px",
                          marginRight: 6,
                        }}
                      />
                      {s1.country || "—"}
                    </div>
                  </div>
                </div>

                {/* VS Center */}
                <div className="fight-vs-center">
                  <div className="vs-divider"></div>
                  <span className="vs-text">VS</span>
                  <div className="vs-divider"></div>
                </div>

                {/* Rechter Kämpfer */}
                <div className="fighter-head right">
                  <img
                    src={`/assets/fighters/${FIGHTER_IMAGE[fight.fighter2]}`}
                    alt={fight.fighter2}
                  />
                  <div className="fighter-meta" style={{ textAlign: "right" }}>
                    <strong>{fight.fighter2}</strong>
                    <div className="small">{fight.record2}</div>
                    <div className="small">
                      {s2.country || "—"}{" "}
                      <ReactCountryFlag
                        countryCode={fight.flag2.toUpperCase()}
                        svg
                        style={{
                          width: "18px",
                          height: "12px",
                          marginLeft: 6,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="tabs">
                {["Matchup", "Result", "Strikes", "Grappling", "Odds"].map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`tab ${activeTab === tab ? "active" : ""
                        }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              <div className="analysis-body modern-body">
                {activeTab === "Matchup" && (
                  <div className="stats-grid">
                    <div className="stat-col left-col">
                      <div className="stat-item">
                        <div className="label">Height</div>
                        <div className="value">{s1.height || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Weight</div>
                        <div className="value">{s1.weight || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Reach</div>
                        <div className="value">{s1.reach || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Leg Reach</div>
                        <div className="value">{s1.leg_reach || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Sig. Strikes</div>
                        <div className="value">
                          {s1.significantStrikes ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="stat-col diff-col">
                      <div className="diff-item">
                        {formatDiff(s1.height, s2.height)}
                      </div>
                      <div className="diff-item">
                        {formatDiff(s1.weight, s2.weight)}
                      </div>
                      <div className="diff-item">
                        {formatDiff(s1.reach, s2.reach)}
                      </div>
                      <div className="diff-item">
                        {formatDiff(s1.leg_reach, s2.leg_reach)}
                      </div>
                      <div className="diff-item">
                        {formatDiff(
                          s1.significantStrikes,
                          s2.significantStrikes
                        )}
                      </div>
                    </div>

                    <div className="stat-col right-col">
                      <div className="stat-item">
                        <div className="label">Height</div>
                        <div className="value">{s2.height || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Weight</div>
                        <div className="value">{s2.weight || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Reach</div>
                        <div className="value">{s2.reach || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Leg Reach</div>
                        <div className="value">{s2.leg_reach || "—"}</div>
                      </div>
                      <div className="stat-item">
                        <div className="label">Sig. Strikes</div>
                        <div className="value">
                          {s2.significantStrikes ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="analysis-footer">
                <button
                  className="close-analysis-btn"
                  onClick={() => setShowAnalysis(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
            document.body
          )}

        <p className="prediction">— No Prediction —</p>
      </div>

    </>
  );
}

// === EVENT FETCHING & STATE MANAGEMENT ===
import { fetchSchedule, fetchEvent, fetchFighters } from "../api/sportsdata";

function UFCPage() {
  const [showStreams, setShowStreams] = useState(false);
  const [showBookmakers, setShowBookmakers] = useState(false);
  const [fightersCache, setFightersCache] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🗓 Lade Schedule bei Start
  React.useEffect(() => {
    async function loadSchedule() {
      try {
        setIsLoading(true);
        const schedule = await fetchSchedule();
        console.log("✅ Loaded Schedule:", schedule);

        // Nur geplante UFC-Events (z. B. "Scheduled")
        const upcomingEvents = schedule.map((e) => ({
          EventId: e.EventId,
          Name: e.Name,
          Date: e.Date || e.Day || e.DateTime,
        }));

        setEvents(upcomingEvents);
      } catch (err) {
        console.error("Schedule Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchedule();
  }, []);

  // 🥋 Wenn Event gewählt → Details laden
  React.useEffect(() => {
    if (!selectedEvent) return;

    async function loadEventDetails() {
      try {
        setIsLoading(true);

        // 1️⃣ Event-Details + Fighterdaten laden (Cache beachten)
        let fighters = fightersCache;
        if (!fighters.length) {
          console.log("🧠 Loading fighters from API...");
          fighters = await fetchFighters();
          setFightersCache(fighters);
        } else {
          console.log("⚡ Using cached fighters:", fighters.length);
        }

        const details = await fetchEvent(selectedEvent);
        console.log("✅ Event details loaded:", details);

        if (!details || !Array.isArray(details.Fights)) {
          console.warn("⚠️ No fights found for event:", selectedEvent);
          setCurrentEvent({ mainCard: [], prelims: [] });
          return;
        }

        // 2️⃣ Fighterdaten mergen
        const enrichedFights = details.Fights.map((fight) => {
          const fightersInFight = (fight.Fighters || []).map((f) => {
            const full = fighters.find((x) => x.FighterId === f.FighterId);
            return {
              ...f,
              ...full,
              flag:
                full?.CountryCode?.toLowerCase() ||
                full?.Country?.slice(0, 2).toLowerCase() ||
                "us",
            };
          });
          return { ...fight, Fighters: fightersInFight };
        }).filter((f) => f.Fighters.length >= 2);

        // 3️⃣ Nach Order sortieren
        const sortedFights = [...details.Fights].sort(
          (a, b) => (a.Order || 0) - (b.Order || 0)
        );

        // 4️⃣ Aufteilen in MainCard & Prelims
        let prelims = sortedFights.filter((f) =>
          f.CardSegment?.toLowerCase().includes("prelim")
        );
        let mainCard = sortedFights.filter((f) =>
          f.CardSegment?.toLowerCase().includes("main")
        );

        // 5️⃣ Fallback, wenn CardSegment fehlt
        if (prelims.length === 0 && mainCard.length === 0) {
          const midpoint = Math.floor(sortedFights.length * 0.5);
          prelims = sortedFights.slice(0, midpoint);
          mainCard = sortedFights.slice(midpoint);
        }

        // 6️⃣ Titelkämpfe ganz oben der Main Card
        mainCard.sort((a, b) => {
          const aTitle =
            a.WeightClass?.toLowerCase().includes("champion") ||
            a.Description?.toLowerCase().includes("title");
          const bTitle =
            b.WeightClass?.toLowerCase().includes("champion") ||
            b.Description?.toLowerCase().includes("title");
          if (aTitle && !bTitle) return -1;
          if (!aTitle && bTitle) return 1;
          return (a.Order || 0) - (b.Order || 0);
        });

        // 7️⃣ Normalisieren für UI
        function toFightCard(fight) {
          const [f1, f2] = fight.Fighters;

          const name1 =
            f1?.Name || [f1?.FirstName, f1?.LastName].filter(Boolean).join(" ") || "TBA";
          const name2 =
            f2?.Name || [f2?.FirstName, f2?.LastName].filter(Boolean).join(" ") || "TBA";

          const record1 =
            f1?.Record || `${f1?.Wins ?? 0}-${f1?.Losses ?? 0}-${f1?.Draws ?? 0}`;
          const record2 =
            f2?.Record || `${f2?.Wins ?? 0}-${f2?.Losses ?? 0}-${f2?.Draws ?? 0}`;

          const flag1 =
            f1?.flag || f1?.CountryCode?.toLowerCase() || f1?.Country?.slice(0, 2).toLowerCase() || "us";
          const flag2 =
            f2?.flag || f2?.CountryCode?.toLowerCase() || f2?.Country?.slice(0, 2).toLowerCase() || "us";

          return {
            fighter1: name1,
            record1,
            flag1,
            fighter2: name2,
            record2,
            flag2,
            odds1: f1?.Moneyline ?? null,
            odds2: f2?.Moneyline ?? null,
          };
        }

        const formattedEvent = {
          mainCard: mainCard.map(toFightCard),
          prelims: prelims.map(toFightCard),
        };

        console.log("✅ Parsed Event:", formattedEvent);
        setCurrentEvent(formattedEvent);
      } catch (err) {
        console.error("❌ Event Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEventDetails();
  }, [selectedEvent]);


  // Helferfunktion zum Normalisieren der Daten
  function formatFight(fight) {
    const f1 = fight.Fighters?.[0] || {};
    const f2 = fight.Fighters?.[1] || {};

    return {
      fighter1: f1.Name || "TBA",
      fighter2: f2.Name || "TBA",
      record1: f1.Record || "",
      record2: f2.Record || "",
      odds1: f1.Moneyline || null,
      odds2: f2.Moneyline || null,
      reach1: f1.Reach || "—",
      reach2: f2.Reach || "—",
      height1: f1.Height || "—",
      height2: f2.Height || "—",
    };
  }

  return (
    <div className="page">
      <main className="event-container">

        {/* UFC Logo */}
        <div className="ufc-logo-wrapper line-overlay">
          <img
            src="/assets/ufc-predictor-v1.png"
            alt="UFC Predictor v1"
            className="ufc-predictor-logo"
          />
        </div>

        {/* === LEFT SIDE BUTTONS (Glass HUD + Tooltips) === */}
        <div className="event-buttons-left">
          {/* STREAMS BUTTON */}
          <div className="hud-btn-wrapper">
            <button className="hud-btn" onClick={() => setShowStreams(true)}>
              <img src="/assets/stream.png" alt="Streams" />
            </button>
            <span className="hud-tooltip">Watch Streams</span>
          </div>

          {/* BOOKMAKERS BUTTON */}
          <div className="hud-btn-wrapper">
            <button className="hud-btn" onClick={() => setShowBookmakers(true)}>
              <img src="/assets/dice.png" alt="Bookmakers" />
            </button>
            <span className="hud-tooltip">Bookmakers</span>
          </div>
        </div>

        {/* === POPUPS (Portaled to body for stability) === */}
        {showStreams &&
          createPortal(<div className="popup-overlay" onClick={() => setShowStreams(false)}>
            <div className="popup-box glass-hud-popup" onClick={(e) => e.stopPropagation()}>
              <h3>Live Streams</h3>
              <p>Watch upcoming UFC events live from these sources:</p>
              <ul className="popup-links">
                <li><a href="#" target="_blank" rel="noreferrer">Stream 1</a></li>
                <li><a href="#" target="_blank" rel="noreferrer">Stream 2</a></li>
                <li><a href="#" target="_blank" rel="noreferrer">Stream 3</a></li>
                <li><a href="#" target="_blank" rel="noreferrer">Stream 4</a></li>
                <li><a href="#" target="_blank" rel="noreferrer">Stream 5</a></li>
              </ul>
              <button className="close-popup" onClick={() => setShowStreams(false)}>Close</button>
            </div>
          </div>,
            document.body
          )}

        {showBookmakers &&
          createPortal(<div className="popup-overlay" onClick={() => setShowBookmakers(false)}>
            <div className="popup-box glass-hud-popup" onClick={(e) => e.stopPropagation()}>
              <h3>Top Bookmakers (UFC Odds)</h3>
              <p>Compare odds for UFC events – best odds highlighted in gold.</p>
              <ul className="bookmaker-list">
                <li className="top-bookmaker">
                  🥇 <a href="https://stake.com" target="_blank" rel="noreferrer">Stake.com</a> — 1.95x
                </li>
                <li>
                  🥈 <a href="https://roobet.com" target="_blank" rel="noreferrer">Roobet</a> — 1.90x
                </li>
                <li>
                  🥉 <a href="https://1xbet.com" target="_blank" rel="noreferrer">Duel</a> — 1.88x
                </li>
                <li>
                  <a href="https://bet365.com" target="_blank" rel="noreferrer">Duelbits</a> — 1.86x
                </li>
                <li>
                  <a href="https://pinnacle.com" target="_blank" rel="noreferrer">Fortunejack</a> — 1.84x
                </li>
              </ul>
              <button className="close-popup" onClick={() => setShowBookmakers(false)}>Close</button>
            </div>
          </div>,
            document.body
          )}

        <div className="event-selector-wrapper">
          <div className="event-dropdown custom-dropdown">
            <select
              value={selectedEvent?.toString() || ""}
              onChange={(e) => setSelectedEvent(Number(e.target.value))}
            >
              <option value="">Select Event</option>
              {events.map((ev) => (
                <option key={ev.EventId} value={ev.EventId}>
                  {ev.Name} — {new Date(ev.Date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </option>
              ))}
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>

        {isLoading && (
          <div className="hud-loader-overlay">
            <div className="hud-loader-glass">
              <div className="hud-loader-shine"></div>
              <div className="hud-loader-content">
                <h3 className="hud-loader-title">Loading Event Data...</h3>
                <div className="hud-loader-bar">
                  <div className="hud-loader-bar-fill"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentEvent ? (
          <>
            {/* === MAIN CARD === */}
            <div className="belt-wrapper">
              <div className="sideplate left"></div>
              <div className="belt-grip left"></div>
              <div className="belt-banner main"><span>Main Card</span></div>
              <div className="belt-grip right"></div>
              <div className="sideplate right"></div>
            </div>

            <div className="fight-grid pyramid">
              {currentEvent.mainCard.map((fight, i) => (
                <FightCard fight={fight} glowClass="gold-glow" key={`m-${i}`} />
              ))}
            </div>

            {/* === PRELIMS === */}
            {currentEvent.prelims?.length > 0 && (
              <>
                <div className="belt-banner prelims"><span>Prelims</span></div>
                <div className="fight-grid pyramid">
                  {currentEvent.prelims.map((fight, i) => (
                    <FightCard fight={fight} glowClass="blue-glow" key={`p-${i}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="no-event-selected">
            <p>⚠️</p>
          </div>
        )}
        <button className="big-generate-btn">Generate All</button>
      </main>
    </div>
  );
}

export default UFCPage;
