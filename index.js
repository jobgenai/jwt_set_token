import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Allowed origins (prod and local)
const allowedOrigins = [
  "https://www.jobgen.ai",
  "https://jobgen.ai",
  "http://localhost:3000"
];

// ✅ CORS config with dynamic origin checking
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Preflight support
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Log incoming origin (before routes)
app.use((req, res, next) => {
  console.log("🛰️ Incoming origin:", req.headers.origin);
  next();
});

// 🔐 POST /set-token — Set JWT as secure cookie
app.post("/set-token", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ error: "Missing token in body" });
  }

  res.cookie('jobgen_jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: '.jobgen.ai', // ✅ allows www.jobgen.ai and jobgen.ai
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  // Optional CORS headers (debug only, remove in production if unnecessary)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "");

  res.status(200).json({ message: "JWT cookie set successfully" });
});

// 🧪 Optional debug route
app.get("/get-token", (req, res) => {
  const token = req.cookies?.jobgen_jwt;
  if (!token) {
    return res.status(401).json({ error: "No JWT cookie found" });
  }
  res.status(200).json({ token });
});

// 🚀 Start the server
app.listen(PORT, () => {
  console.log(`✅ JWT API running on port ${PORT}`);
});