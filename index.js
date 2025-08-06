import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS — apply to all requests, including preflight
const allowedOrigins = [
  "https://www.jobgen.ai",
  "https://jobgen.ai",        // if redirecting or accessible without www
  "https://app.jobgen.ai",    // if you serve frontend separately
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true,
}));

// ✅ Handle preflight requests
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

// 🔐 Set JWT as secure cookie
app.post("/set-token", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ error: "Missing token in body" });
  }

  res.cookie('jobgen_jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: '.jobgen.ai',   // ✅ This is correct!
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(200).json({ message: "JWT cookie set successfully" });
});

// 🧪 Read token
app.get("/get-token", (req, res) => {
  const token = req.cookies?.jobgen_jwt;
  if (!token) {
    return res.status(401).json({ error: "No JWT cookie found" });
  }
  res.status(200).json({ token });
});

// 🛰️ Debug incoming origins
app.use((req, res, next) => {
  console.log("🛰️ Incoming origin:", req.headers.origin);
  next();
});

// 🚀 Start
app.listen(PORT, () => {
  console.log(`✅ JWT API running on port ${PORT}`);
});