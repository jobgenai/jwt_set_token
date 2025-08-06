import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(express.json()); // replaces body-parser.json()
app.use(cookieParser());

// ✅ CORS setup: Allow frontend domain and allow cookies
app.use(cors({
  origin: "https://www.jobgen.ai", // Bubble live domain
  credentials: true,
}));

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
  path: '/',
  maxAge: 24 * 60 * 60 * 1000
});

  res.status(200).json({ message: "JWT cookie set successfully" });
});

// 🧪 Optional: Debug route to read the token
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