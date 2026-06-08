import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getPortfolioByUserId,
  upsertPortfolio,
  deletePortfolioByUserId,
} from "@/lib/localDb";

/* Helper to get the Clerk user ID without throwing */
async function getClerkUserId(fallback?: string): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return fallback ?? null;
  }
}

// ─────────────────────────────────────────
// POST  /api/portfolio  — save / publish
// ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      username,
      name,
      bio,
      projects,
      socialLinks,
      skills,
      theme,
      template,
      email,
      profileImage,
      vibe,
    } = body;

    const clerkUserId = await getClerkUserId(user_id);

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Basic validation
    if (!user_id || !username || !name) {
      const missing: string[] = [];
      if (!name) missing.push("Full Name");
      if (!username) missing.push("Username");
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    if (username.length < 3 || !/^[a-z0-9_-]+$/i.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores",
        },
        { status: 400 }
      );
    }

    const portfolioData = {
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

    const saved = upsertPortfolio(portfolioData);

    return NextResponse.json({ success: true, portfolio: saved }, { status: 200 });
  } catch (error: any) {
    console.error("Error saving portfolio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────
// GET  /api/portfolio?user_id=xxx  or  ?username=xxx
// ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const username = searchParams.get("username");

    let portfolio: any = null;

    if (user_id) {
      portfolio = getPortfolioByUserId(user_id);
    } else if (username) {
      const { getPortfolioByUsername } = await import("@/lib/localDb");
      portfolio = getPortfolioByUsername(username);
    } else {
      return NextResponse.json(
        { error: "Must provide user_id or username" },
        { status: 400 }
      );
    }

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Map DB columns → frontend-friendly shape
    const mapped = {
      ...portfolio,
      name: portfolio.full_name,
      socialLinks: portfolio.social_links,
      profileImage: portfolio.profile_image,
    };

    return NextResponse.json({ portfolio: mapped }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────
// DELETE  /api/portfolio
// ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body;

    const clerkUserId = await getClerkUserId(user_id);
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    deletePortfolioByUserId(user_id);

    return NextResponse.json(
      { message: "Portfolio deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in DELETE handler:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
