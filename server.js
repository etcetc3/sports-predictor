import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.SPORTS_API_KEY;

// 🗓 Upcoming Events (Scores API)
app.get("/api/ufc/schedule", async (req, res) => {
  try {
    const url = `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/2025?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();

    // Nur kommende Events (Status = Scheduled)
    const upcoming = data
      .filter((e) => e.Status === "Scheduled")
      .map((e) => ({
        EventId: e.EventId,
        Name: e.Name,
        Date: e.Day || e.DateTime || e.Updated, 
      }));

    res.json(upcoming);
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).json({ error: "Failed to load schedule" });
  }
});

// 🥊 Event Details
app.get("/api/ufc/event/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const url = `https://api.sportsdata.io/v3/mma/scores/json/Event/${id}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Failed to load event details" });
  }
});

// 🧍‍♂️ Fighter-Basisdaten (Height, Reach, Country, etc.)
app.get("/api/ufc/fighters", async (req, res) => {
  try {
    const url = `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();

    // Optional: Nur UFC-Fighter
    const ufcOnly = data.filter((f) => f.Organization?.includes("UFC"));
    res.json(ufcOnly);
  } catch (err) {
    console.error("Error fetching fighters:", err);
    res.status(500).json({ error: "Failed to load fighter data" });
  }
});

app.listen(PORT, () =>
  console.log(`✅ UFC Proxy running on port ${PORT}`)
);
