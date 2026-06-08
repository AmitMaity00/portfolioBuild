import { NextRequest, NextResponse } from "next/server";
import { getPortfolioByUsername } from "@/lib/localDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const existing = getPortfolioByUsername(username);
    return NextResponse.json({ available: !existing }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
