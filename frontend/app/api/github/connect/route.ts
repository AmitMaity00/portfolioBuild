import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateGitHub, getPortfolioByUserId } from "@/lib/localDb";

async function getClerkUserId(fallback?: string): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return fallback ?? null;
  }
}

/**
 * POST /api/github/connect
 * Stores GitHub connection details locally
 */
export async function POST(req: NextRequest) {
  try {
    const clerkUserId = await getClerkUserId();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken, githubUsername } = await req.json();

    if (!accessToken || !githubUsername) {
      return NextResponse.json(
        { error: "Missing accessToken or githubUsername" },
        { status: 400 }
      );
    }

    console.log(`✅ GitHub token received for: ${githubUsername}`);

    updateGitHub(clerkUserId, {
      connected: true,
      username: githubUsername,
      accessToken: accessToken, // stored as plain text locally (no Supabase encryption needed)
      connectedAt: new Date().toISOString(),
      deployedUrl: "",
    });

    return NextResponse.json({
      success: true,
      connected: true,
      username: githubUsername,
      accessToken: accessToken,
      message: "GitHub connected successfully",
    });
  } catch (error: any) {
    console.error("GitHub connect error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect GitHub" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/github/connect
 * Get GitHub connection status from local DB
 */
export async function GET(_req: NextRequest) {
  try {
    const clerkUserId = await getClerkUserId();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = getPortfolioByUserId(clerkUserId);

    return NextResponse.json({
      connected: portfolio?.github?.connected || false,
      username: portfolio?.github?.username || "",
      deployedUrl: portfolio?.github?.deployedUrl || "",
      repositoryName: portfolio?.github?.repositoryName || "",
    });
  } catch {
    return NextResponse.json({
      connected: false,
      username: "",
      deployedUrl: "",
    });
  }
}

/**
 * DELETE /api/github/connect
 * Disconnect GitHub
 */
export async function DELETE(_req: NextRequest) {
  try {
    const clerkUserId = await getClerkUserId();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    updateGitHub(clerkUserId, {
      connected: false,
      username: "",
      accessToken: "",
    });

    return NextResponse.json({
      success: true,
      connected: false,
      message: "GitHub disconnected",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect GitHub" },
      { status: 500 }
    );
  }
}
