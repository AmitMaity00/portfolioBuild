import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPortfolioByUserId, updateGitHub } from "@/lib/localDb";
import GitHubService from "@/lib/githubService";
import { generateCode } from "@/lib/generateCode";

async function getClerkUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

function generateRepoName(username: string): string {
  return `${username}-portfolio-builder`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}

/**
 * POST /api/github/deploy
 * Deploy portfolio to GitHub Pages
 */
export async function POST(req: NextRequest) {
  try {
    const clerkUserId = await getClerkUserId();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = getPortfolioByUserId(clerkUserId);

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found. Please publish your portfolio first." },
        { status: 404 }
      );
    }

    if (!portfolio.github?.connected || !portfolio.github?.accessToken) {
      return NextResponse.json(
        {
          error:
            "GitHub not connected. Please connect your GitHub account first in the Dashboard → Deploy tab.",
        },
        { status: 403 }
      );
    }

    try {
      const accessToken = portfolio.github.accessToken;
      const githubService = new GitHubService(accessToken);

      // Verify the token is still valid
      const githubUser = await githubService.getUser();
      const repoName = generateRepoName(portfolio.username);

      // Create repo if needed
      const repoExists = await githubService.repositoryExists(repoName);
      if (!repoExists) {
        await githubService.createRepository(repoName);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Generate portfolio files
      const portfolioData = {
        ...portfolio,
        name: portfolio.full_name,
        profileImage: portfolio.profile_image,
        socialLinks: portfolio.social_links,
      };
      const { html, css } = generateCode(portfolioData);

      await githubService.uploadFiles(repoName, [
        { path: "index.html", content: html },
        { path: "style.css", content: css },
      ]);

      const pagesInfo = await githubService.enableGitHubPages(repoName);

      // Persist deployment info
      updateGitHub(clerkUserId, {
        ...portfolio.github,
        connected: true,
        repositoryName: repoName,
        deployedUrl: pagesInfo.url,
        deployedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Portfolio deployed successfully!",
        deployedUrl: pagesInfo.url,
        repositoryName: repoName,
      });
    } catch (githubError: any) {
      console.error("GitHub deployment error:", githubError);
      return NextResponse.json(
        { error: githubError.message || "GitHub deployment failed" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Deploy error:", error);
    return NextResponse.json({ error: "Deployment failed" }, { status: 500 });
  }
}

/**
 * GET /api/github/deploy
 * Get deployment status
 */
export async function GET(_req: NextRequest) {
  try {
    const clerkUserId = await getClerkUserId();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolio = getPortfolioByUserId(clerkUserId);

    return NextResponse.json({
      deployed: !!portfolio?.github?.deployedUrl,
      deployedUrl: portfolio?.github?.deployedUrl || null,
      repositoryName: portfolio?.github?.repositoryName || null,
      deployedAt: portfolio?.github?.deployedAt || null,
    });
  } catch (error: any) {
    console.error("Get deployment status error:", error);
    return NextResponse.json(
      { error: "Failed to get deployment status" },
      { status: 500 }
    );
  }
}
