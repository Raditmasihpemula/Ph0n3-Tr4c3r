const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// middleware
app.use(bodyParser.json());

// folder untuk file HTML kalau mau serve dari sini juga
app.use(express.static(path.join(__dirname, "public")));

const DB_FILE = path.join(__dirname, "locations.json");

// helper sederhana buat baca & tulis "database"
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// endpoint buat nerima lokasi
app.post("/api/location", (req, res) => {
  const { lat, lon, accuracy, timestamp, userAgent } = req.body || {};

  if (lat == null || lon == null) {
    return res.status(400).json({ error: "lat/lon wajib ada" });
  }

  const db = readDb();
  const id = db.length + 1;

  const record = {
    id,
    lat,
    lon,
    accuracy,
    timestamp: timestamp || new Date().toISOString(),
    userAgent: userAgent || null,
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress
  };

  db.push(record);
  writeDb(db);

  console.log("Lokasi baru tersimpan:", record);

  res.json({ ok: true, id });
});

// endpoint buat lihat semua data (jangan dibuka ke publik, buat belajar aja)
app.get("/api/location", (req, res) => {
  const db = readDb();
  res.json(db);
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
