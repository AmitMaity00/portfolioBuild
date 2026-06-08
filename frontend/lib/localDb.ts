/**
 * localDb.ts — File-based local storage replacing Supabase.
 * Stores all portfolio data in a JSON file on disk so nothing is lost on restart.
 */
import fs from "fs";
import path from "path";

const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
const DB_FILE = isServerless ? "/tmp/.portfolio_db.json" : path.join(process.cwd(), ".portfolio_db.json");

interface PortfolioRecord {
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
}

interface DbData {
  portfolios: PortfolioRecord[];
}

function readDb(): DbData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { portfolios: [] };
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as DbData;
  } catch {
    return { portfolios: [] };
  }
}

function writeDb(data: DbData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Vercel/serverless filesystem is read-only; skip write
  }
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
    // Create a skeleton entry
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
