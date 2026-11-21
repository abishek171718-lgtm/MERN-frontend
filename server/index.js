require("dotenv").config();

const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const app = express();
const port = Number(process.env.PORT) || 5000;
const tokenCookie = "toyzone-session";
const tokenLifetime = 7 * 24 * 60 * 60 * 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordByteLimit = 72;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie(tokenCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokenLifetime,
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.post("/api/auth/register", authLimiter, asyncHandler(async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: "Enter a name between 2 and 100 characters." });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (password.length < 6 || Buffer.byteLength(password, "utf8") > passwordByteLimit) {
    return res.status(400).json({ message: "Password must be 6 characters or more and no more than 72 UTF-8 bytes." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  setSessionCookie(res, user);
  res.status(201).json({ user: publicUser(user) });
}));

app.post("/api/auth/login", authLimiter, asyncHandler(async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!emailPattern.test(email) || password.length === 0 || Buffer.byteLength(password, "utf8") > passwordByteLimit) {
    return res.status(400).json({ message: "Enter a valid email address and password." });
  }

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  setSessionCookie(res, user);
  res.json({ user: publicUser(user) });
}));

app.use((error, req, res, next) => {
  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  console.error(error);
  res.status(500).json({ message: "The server could not complete your request." });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add it to your .env file.");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET is required and must be at least 32 characters.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Toy Zone API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Unable to start the API:", error.message);
  process.exit(1);
});
