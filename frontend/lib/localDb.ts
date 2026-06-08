/**
 * Serverless-safe local storage for Vercel.
 * Uses /tmp on serverless (writable), falls back to in-memory on edge runtime.
 */

type PortfolioRecord = {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  projects?: any[];
  social_links?: Record<string, string>;
  skills?: string[];
  theme?: Record<string, any>;
  template?: string;
  vibe?: string;
  profile_image?: string;
  is_published?: boolean;
  updated_at?: string;
  github?: {
    connected: boolean;
    username: string;
    accessToken?: string;
    deployedUrl?: string;
    repositoryName?: string;
    connectedAt?: string;
    deployedAt?: string;
  };
};

type DbData = {
  portfolios: PortfolioRecord[];
};

const isServerless = process.env.VERCEL === "1";
const TMP_PATH = "/tmp/.portfolio_db.json";

let memoryStore: DbData | null = null;

function getStore(): DbData {
  if (memoryStore) return memoryStore;
  memoryStore = { portfolios: [] };
  return memoryStore;
}

function hasFs(): boolean {
  try {
    return typeof require !== "undefined" && !!require("fs");
  } catch {
    return false;
  }
}

function readFromDisk(): DbData | null {
  if (!hasFs()) return null;
  try {
    const fs = require("fs");
    const path = require("path");
    const dbPath = isServerless ? TMP_PATH : path.join(process.cwd(), ".portfolio_db.json");
    if (!fs.existsSync(dbPath)) return null;
    const raw = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(raw) as DbData;
  } catch {
    return null;
  }
}

function writeToDisk(data: DbData): void {
  if (!hasFs()) return;
  try {
    const fs = require("fs");
    const path = require("path");
    const dbPath = isServerless ? TMP_PATH : path.join(process.cwd(), ".portfolio_db.json");
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    memoryStore = data;
  } catch {
    // Silently fail on serverless if disk write fails
  }
}

function readDb(): DbData {
  const disk = readFromDisk();
  if (disk) {
    memoryStore = disk;
    return disk;
  }
  return getStore();
}

function writeDb(data: DbData): void {
  memoryStore = data;
  writeToDisk(data);
}

export function getPortfolioByUserId(userId: string): PortfolioRecord | null {
  const db = readDb();
  return db.portfolios.find((p) => p.user_id === userId) ?? null;
}

export function getPortfolioByUsername(username: string): PortfolioRecord | null {
  const db = readDb();
  return (
    db.portfolios.find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    ) ?? null
  );
}

export function upsertPortfolio(record: PortfolioRecord): PortfolioRecord {
  const db = readDb();
  const idx = db.portfolios.findIndex((p) => p.user_id === record.user_id);
  if (idx >= 0) {
    db.portfolios[idx] = { ...db.portfolios[idx], ...record };
  } else {
    db.portfolios.push(record);
  }
  writeDb(db);
  return record;
}

export function deletePortfolioByUserId(userId: string): boolean {
  const db = readDb();
  const before = db.portfolios.length;
  db.portfolios = db.portfolios.filter((p) => p.user_id !== userId);
  writeDb(db);
  return db.portfolios.length < before;
}

export function updateGitHub(
  userId: string,
  github: PortfolioRecord["github"]
): boolean {
  const db = readDb();
  const idx = db.portfolios.findIndex((p) => p.user_id === userId);
  if (idx < 0) {
    db.portfolios.push({
      user_id: userId,
      email: `${userId}@portfolio.local`,
      username: userId,
      full_name: "",
      github,
    });
  } else {
    db.portfolios[idx].github = github;
  }
  writeDb(db);
  return true;
}
