import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup
const allowedOrigins = ["https://www.jobgen.ai"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Debug origin logging (best placed before routes)
app.use((req, res, next) => {
  console.log("🛰️ Incoming origin:", req.headers.origin);
  next();
});

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
    domain: '.jobgen.ai', // ✅ CORRECTED
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(200).json({ message: "JWT cookie set successfully" });
});

// 🔍 Optional: Debug cookie reader
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