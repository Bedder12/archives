const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "data.sqlite");
const UPLOAD_DIR = path.join(__dirname, "public", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "demo-secret",
    resave: false,
    saveUninitialized: false,
  })
);

const db = new sqlite3.Database(DB_PATH);

const upload = multer({ dest: UPLOAD_DIR });

const DEMO_USER = {
  email: process.env.DEMO_EMAIL || "demo@fastighet.se",
  password: process.env.DEMO_PASSWORD || "demo123",
  tenant_id: 1,
};

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

async function initDb() {
  await run(
    `CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      tenant_id INTEGER NOT NULL,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )`
  );
  await run(
    `CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL,
      document_type TEXT NOT NULL,
      building_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      year INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL,
      file_url TEXT NOT NULL,
      FOREIGN KEY (building_id) REFERENCES buildings(id)
    )`
  );

  const tenant = await get("SELECT id FROM tenants LIMIT 1");
  if (!tenant) {
    await seedData();
  }
}

async function seedData() {
  await run("INSERT INTO tenants (id, name) VALUES (?, ?)", [
    1,
    "Stadsgården Fastigheter AB",
  ]);

  const buildings = [
    {
      id: 1,
      name: "Skola Björken",
      address: "Björkgatan 12, Göteborg",
    },
    {
      id: 2,
      name: "Kontor Eken",
      address: "Ekallén 4, Göteborg",
    },
    {
      id: 3,
      name: "Bostäder Lönnen",
      address: "Lönnvägen 9, Göteborg",
    },
  ];

  for (const building of buildings) {
    await run(
      "INSERT INTO buildings (id, name, address, tenant_id) VALUES (?, ?, ?, ?)",
      [building.id, building.name, building.address, 1]
    );
  }

  const now = new Date().toISOString();
  const docs = [
    {
      filename: "ritning-skolan-2016.pdf",
      document_type: "ritning",
      building_id: 1,
      status: "ersatt",
      year: 2016,
      file_url: "/docs/ritning-skolan-2016.pdf",
    },
    {
      filename: "ritning-skolan-2018.pdf",
      document_type: "ritning",
      building_id: 1,
      status: "ersatt",
      year: 2018,
      file_url: "/docs/ritning-skolan-2018.pdf",
    },
    {
      filename: "ritning-skolan-2021.pdf",
      document_type: "ritning",
      building_id: 1,
      status: "gällande",
      year: 2021,
      file_url: "/docs/ritning-skolan-2021.pdf",
    },
    {
      filename: "ovk-skolan-2014.pdf",
      document_type: "OVK",
      building_id: 1,
      status: "ersatt",
      year: 2014,
      file_url: "/docs/ovk-skolan-2014.pdf",
    },
    {
      filename: "ovk-skolan-2017.pdf",
      document_type: "OVK",
      building_id: 1,
      status: "ersatt",
      year: 2017,
      file_url: "/docs/ovk-skolan-2017.pdf",
    },
    {
      filename: "ovk-skolan-2020.pdf",
      document_type: "OVK",
      building_id: 1,
      status: "gällande",
      year: 2020,
      file_url: "/docs/ovk-skolan-2020.pdf",
    },
    {
      filename: "brandskydd-skolan-2019.pdf",
      document_type: "brandskydd",
      building_id: 1,
      status: "osäker",
      year: 2019,
      file_url: "/docs/brandskydd-skolan-2019.pdf",
    },
    {
      filename: "brandskydd-skolan-2021.pdf",
      document_type: "brandskydd",
      building_id: 1,
      status: "gällande",
      year: 2021,
      file_url: "/docs/brandskydd-skolan-2021.pdf",
    },
    {
      filename: "service-skolan-2019.pdf",
      document_type: "service",
      building_id: 1,
      status: "ersatt",
      year: 2019,
      file_url: "/docs/service-skolan-2019.pdf",
    },
    {
      filename: "service-skolan-2022.pdf",
      document_type: "service",
      building_id: 1,
      status: "gällande",
      year: 2022,
      file_url: "/docs/service-skolan-2022.pdf",
    },
    {
      filename: "ritning-kontor-2012.pdf",
      document_type: "ritning",
      building_id: 2,
      status: "ersatt",
      year: 2012,
      file_url: "/docs/ritning-kontor-2012.pdf",
    },
    {
      filename: "ritning-kontor-2016.pdf",
      document_type: "ritning",
      building_id: 2,
      status: "ersatt",
      year: 2016,
      file_url: "/docs/ritning-kontor-2016.pdf",
    },
    {
      filename: "ritning-kontor-2020.pdf",
      document_type: "ritning",
      building_id: 2,
      status: "gällande",
      year: 2020,
      file_url: "/docs/ritning-kontor-2020.pdf",
    },
    {
      filename: "ovk-kontor-2015.pdf",
      document_type: "OVK",
      building_id: 2,
      status: "gällande",
      year: 2015,
      file_url: "/docs/ovk-kontor-2015.pdf",
    },
    {
      filename: "ovk-kontor-2019.pdf",
      document_type: "OVK",
      building_id: 2,
      status: "osäker",
      year: 2019,
      file_url: "/docs/ovk-kontor-2019.pdf",
    },
    {
      filename: "brandskydd-kontor-2018.pdf",
      document_type: "brandskydd",
      building_id: 2,
      status: "gällande",
      year: 2018,
      file_url: "/docs/brandskydd-kontor-2018.pdf",
    },
    {
      filename: "brandskydd-kontor-2022.pdf",
      document_type: "brandskydd",
      building_id: 2,
      status: "gällande",
      year: 2022,
      file_url: "/docs/brandskydd-kontor-2022.pdf",
    },
    {
      filename: "service-kontor-2019.pdf",
      document_type: "service",
      building_id: 2,
      status: "ersatt",
      year: 2019,
      file_url: "/docs/service-kontor-2019.pdf",
    },
    {
      filename: "service-kontor-2021.pdf",
      document_type: "service",
      building_id: 2,
      status: "osäker",
      year: 2021,
      file_url: "/docs/service-kontor-2021.pdf",
    },
    {
      filename: "ritning-bostad-2014.pdf",
      document_type: "ritning",
      building_id: 3,
      status: "gällande",
      year: 2014,
      file_url: "/docs/ritning-bostad-2014.pdf",
    },
    {
      filename: "ritning-bostad-2019.pdf",
      document_type: "ritning",
      building_id: 3,
      status: "osäker",
      year: 2019,
      file_url: "/docs/ritning-bostad-2019.pdf",
    },
    {
      filename: "brandskydd-bostad-2016.pdf",
      document_type: "brandskydd",
      building_id: 3,
      status: "ersatt",
      year: 2016,
      file_url: "/docs/brandskydd-bostad-2016.pdf",
    },
    {
      filename: "brandskydd-bostad-2020.pdf",
      document_type: "brandskydd",
      building_id: 3,
      status: "gällande",
      year: 2020,
      file_url: "/docs/brandskydd-bostad-2020.pdf",
    },
    {
      filename: "service-bostad-2018.pdf",
      document_type: "service",
      building_id: 3,
      status: "ersatt",
      year: 2018,
      file_url: "/docs/service-bostad-2018.pdf",
    },
    {
      filename: "service-bostad-2023.pdf",
      document_type: "service",
      building_id: 3,
      status: "gällande",
      year: 2023,
      file_url: "/docs/service-bostad-2023.pdf",
    },
  ];

  for (const doc of docs) {
    await run(
      `INSERT INTO documents
        (filename, document_type, building_id, status, year, uploaded_at, file_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      ,
      [
        doc.filename,
        doc.document_type,
        doc.building_id,
        doc.status,
        doc.year,
        now,
        doc.file_url,
      ]
    );
  }
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  return next();
}

function statusLabel(status) {
  if (status === "gällande") return "✅ Gällande";
  if (status === "osäker") return "⚠️ Osäker";
  if (status === "ersatt") return "❌ Ersatt";
  return status;
}

function buildGaps(documentsByType) {
  const currentYear = new Date().getFullYear();
  const gapMessages = [];

  for (const [type, docs] of Object.entries(documentsByType)) {
    if (docs.length === 0) {
      gapMessages.push({
        type,
        message: `${type.toUpperCase()} saknas`,
        severity: "missing",
      });
      continue;
    }

    const latest = docs.reduce((acc, doc) => (doc.year > acc.year ? doc : acc), docs[0]);
    if (currentYear - latest.year >= 5) {
      gapMessages.push({
        type,
        message: `Senaste ${type.toUpperCase()} är äldre än 5 år`,
        severity: "stale",
      });
    }

    const uncertain = docs.some((doc) => doc.status === "osäker");
    if (uncertain && docs.length > 1) {
      gapMessages.push({
        type,
        message: `Flera ${type.toUpperCase()} – osäkert vilken som gäller`,
        severity: "uncertain",
      });
    }
  }

  return gapMessages;
}

app.get("/login", (req, res) => {
  res.render("login", { error: null, demoEmail: DEMO_USER.email });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    req.session.user = { email, tenant_id: DEMO_USER.tenant_id };
    return res.redirect("/buildings");
  }
  return res.render("login", { error: "Fel email eller lösenord", demoEmail: DEMO_USER.email });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/buildings");
  }
  return res.redirect("/login");
});

app.get("/buildings", requireAuth, async (req, res) => {
  const search = (req.query.search || "").trim();
  const params = [req.session.user.tenant_id];
  let where = "WHERE tenant_id = ?";
  if (search) {
    where += " AND (name LIKE ? OR address LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  const buildings = await all(
    `SELECT id, name, address FROM buildings ${where} ORDER BY name`,
    params
  );
  res.render("buildings", { buildings, search });
});

app.get("/buildings/:id", requireAuth, async (req, res) => {
  const building = await get(
    "SELECT id, name, address FROM buildings WHERE id = ? AND tenant_id = ?",
    [req.params.id, req.session.user.tenant_id]
  );
  if (!building) {
    return res.status(404).send("Byggnaden hittades inte");
  }

  const filters = {
    type: req.query.type || "",
    status: req.query.status || "",
    year: req.query.year || "",
  };

  const queryParams = [building.id];
  let filterSql = "WHERE building_id = ?";
  if (filters.type) {
    filterSql += " AND document_type = ?";
    queryParams.push(filters.type);
  }
  if (filters.status) {
    filterSql += " AND status = ?";
    queryParams.push(filters.status);
  }
  if (filters.year) {
    filterSql += " AND year = ?";
    queryParams.push(Number(filters.year));
  }

  const documents = await all(
    `SELECT * FROM documents ${filterSql} ORDER BY document_type, year DESC`,
    queryParams
  );

  const documentsByType = {
    ritning: [],
    OVK: [],
    brandskydd: [],
    service: [],
  };
  documentsByType.ritning = await all(
    "SELECT * FROM documents WHERE building_id = ? AND document_type = 'ritning' ORDER BY year DESC",
    [building.id]
  );
  documentsByType.OVK = await all(
    "SELECT * FROM documents WHERE building_id = ? AND document_type = 'OVK' ORDER BY year DESC",
    [building.id]
  );
  documentsByType.brandskydd = await all(
    "SELECT * FROM documents WHERE building_id = ? AND document_type = 'brandskydd' ORDER BY year DESC",
    [building.id]
  );
  documentsByType.service = await all(
    "SELECT * FROM documents WHERE building_id = ? AND document_type = 'service' ORDER BY year DESC",
    [building.id]
  );

  const gaps = buildGaps(documentsByType);

  res.render("building", {
    building,
    documents,
    filters,
    gaps,
    statusLabel,
  });
});

app.get("/documents/:id", requireAuth, async (req, res) => {
  const document = await get(
    `SELECT documents.*, buildings.tenant_id, buildings.name as building_name
     FROM documents
     JOIN buildings ON documents.building_id = buildings.id
     WHERE documents.id = ? AND buildings.tenant_id = ?`,
    [req.params.id, req.session.user.tenant_id]
  );

  if (!document) {
    return res.status(404).send("Dokumentet hittades inte");
  }

  res.render("document", {
    document,
    statusLabel,
  });
});

app.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Ingen fil mottagen");
  }
  res.json({
    message: "Fil uppladdad (lokal MVP-lagring)",
    filename: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
  });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MVP kör på http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Kunde inte starta", err);
    process.exit(1);
  });
