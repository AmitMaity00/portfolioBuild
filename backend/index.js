require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/portfolio";

mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected");
});

const PortfolioSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  email: String,
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  full_name: String,
  bio: String,
  projects: Array,
  social_links: Object,
  skills: Array,
  theme: Object,
  template: String,
  vibe: String,
  profile_image: String,
  is_published: Boolean,
  updated_at: String,
  github: Object,
});

const Portfolio = mongoose.models.Portfolio || mongoose.model("Portfolio", PortfolioSchema);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/portfolio", async (req, res) => {
  try {
    const { user_id, username, name, bio, projects, socialLinks, skills, theme, template, email, profileImage, vibe } = req.body;
    if (!user_id || !username || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const data = {
      user_id,
      email: email || `${user_id}@portfolio.local`,
      username: username.toLowerCase().trim(),
      full_name: name,
      bio: bio || "",
      projects: projects || [],
      social_links: socialLinks || {},
      skills: skills || [],
      theme: theme || {},
      template: template || "minimal",
      vibe: vibe || "professional",
      profile_image: profileImage || null,
      is_published: true,
      updated_at: new Date().toISOString(),
    };
    const saved = await Portfolio.findOneAndUpdate({ user_id }, data, { new: true, upsert: true });
    res.json({ success: true, portfolio: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/portfolio", async (req, res) => {
  try {
    const { user_id, username } = req.query;
    let portfolio = null;
    if (user_id) {
      portfolio = await Portfolio.findOne({ user_id });
    } else if (username) {
      portfolio = await Portfolio.findOne({ username: username.toLowerCase() });
    }
    if (!portfolio) return res.status(404).json({ error: "Portfolio not found" });
    const mapped = {
      ...portfolio.toObject(),
      name: portfolio.full_name,
      socialLinks: portfolio.social_links,
      profileImage: portfolio.profile_image,
    };
    res.json({ portfolio: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/portfolio", async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });
    await Portfolio.deleteOne({ user_id });
    res.json({ message: "Portfolio deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/username", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username is required" });
    const existing = await Portfolio.findOne({ username: username.toLowerCase() });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
