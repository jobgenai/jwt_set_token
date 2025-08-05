import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());

// Allow only JobGen.AI frontend and credentials (cookies)
app.use(
  cors({
    origin: "https://jobgen.ai/version-test",
    credentials: true,
  })
);

// 🔐 POST /set-token — Set secure cookie from frontend
app.post("/set-token", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ error: "Missing token in body" });
  }

  res.cookie("jwt_token", token, {
    httpOnly: true,
    secure: true,       // Send only over HTTPS
    sameSite: "Strict", // Prevent CSRF
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json({ message: "JWT cookie set successfully" });
});

// 🧪 GET /get-token — Just to test cookie
app.get("/get-token", (req, res) => {
  const token = req.cookies?.jwt_token;

  if (!token) {
    return res.status(401).json({ error: "No JWT cookie found" });
  }

  res.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log(`JWT server running on http://localhost:${PORT}`);
});