import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

const getBaseUrl = (req: NextRequest) => {
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  return `${protocol}://${host}`;
};

/**
 * GET /api/github/callback
 * Handles GitHub OAuth redirect and exchanges code for access token
 */
export async function GET(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl(req);
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard?github_error=${encodeURIComponent(errorDescription || error)}`, baseUrl)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/dashboard?github_error=${encodeURIComponent("No authorization code provided")}`, baseUrl)
      );
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL(`/dashboard?github_error=${encodeURIComponent("GitHub OAuth not configured")}`, baseUrl)
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token, error: tokenError, error_description: tokenErrorDesc } = tokenResponse.data;

    if (tokenError) {
      return NextResponse.redirect(
        new URL(`/dashboard?github_error=${encodeURIComponent(tokenErrorDesc || "Failed to get access token")}`, baseUrl)
      );
    }

    if (!access_token) {
      return NextResponse.redirect(
        new URL(`/dashboard?github_error=${encodeURIComponent("No access token received")}`, baseUrl)
      );
    }

    // Get GitHub user info to verify token
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    // Store token in session/redirect with data
    const redirectUrl = new URL(`/dashboard?github_token=${encodeURIComponent(access_token)}&github_username=${encodeURIComponent(userResponse.data.login)}`, baseUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("GitHub OAuth error:", error);
    const baseUrl = getBaseUrl(req);
    return NextResponse.redirect(
      new URL(`/dashboard?github_error=${encodeURIComponent("GitHub authentication failed")}`, baseUrl)
    );
  }
}

/**
 * POST /api/github/callback
 * Handles GitHub OAuth code exchange (for API calls)
 */
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "GitHub OAuth not configured" },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      return NextResponse.json(
        { error: error_description || "Failed to get access token" },
        { status: 400 }
      );
    }

    if (!access_token) {
      return NextResponse.json(
        { error: "No access token received" },
        { status: 400 }
      );
    }

    // Get GitHub user info to verify token
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    return NextResponse.json({
      success: true,
      accessToken: access_token,
      githubUsername: userResponse.data.login,
    });
  } catch (error: any) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.json(
      { error: "GitHub authentication failed" },
      { status: 500 }
    );
  }
}
