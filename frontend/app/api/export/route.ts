import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { generateCode } from "@/lib/generateCode";
import { getPortfolioByUsername } from "@/lib/localDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username)
      return NextResponse.json({ error: "Username required" }, { status: 400 });

    const portfolioDoc = getPortfolioByUsername(username);

    if (!portfolioDoc)
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

    const portfolio = {
      ...portfolioDoc,
      name: portfolioDoc.full_name,
      profileImage: portfolioDoc.profile_image,
      socialLinks: portfolioDoc.social_links,
    };

    const zip = new JSZip();
    const { html, css } = generateCode(portfolio);

    zip.file("index.html", html);
    zip.file("style.css", css);
    zip.file(
      "README.txt",
      `Portfolio for ${portfolio.full_name}\n\nHow to host:\n1. Upload index.html and style.css to Vercel, Netlify, or GitHub Pages\n2. Your portfolio will be live in seconds!\n`
    );

    const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${portfolio.username}-portfolio.zip"`,
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/export
 * Export portfolio using inline data (when user hasn't saved yet).
 */
export async function POST(req: NextRequest) {
  try {
    const portfolio = await req.json();

    if (!portfolio)
      return NextResponse.json({ error: "Portfolio data required" }, { status: 400 });

    const zip = new JSZip();
    const { html, css } = generateCode(portfolio);

    zip.file("index.html", html);
    zip.file("style.css", css);
    zip.file(
      "README.txt",
      `Portfolio for ${portfolio.name || "User"}\n\nHow to host:\n1. Upload index.html and style.css to Vercel, Netlify, or GitHub Pages\n2. Your portfolio will be live in seconds!\n`
    );

    const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
    const filename = (portfolio.username || "portfolio") + "-portfolio.zip";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
