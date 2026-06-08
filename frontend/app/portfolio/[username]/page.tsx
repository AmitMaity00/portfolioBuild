import { notFound } from "next/navigation";
import LivePreview from "@/components/LivePreview";
import Link from "next/link";
import { Metadata } from "next";
import { getPortfolioByUsername } from "@/lib/localDb";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const portfolioDoc = getPortfolioByUsername(username);
  if (!portfolioDoc) return { title: "Not Found" };
  return {
    title: `${portfolioDoc.full_name}'s Portfolio`,
    description: portfolioDoc.bio,
  };
}

export default async function PortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const portfolioDoc = getPortfolioByUsername(username);

  if (!portfolioDoc) {
    return notFound();
  }

  // Map snake_case → camelCase for frontend components
  const portfolio = {
    ...portfolioDoc,
    name: portfolioDoc.full_name,
    socialLinks: portfolioDoc.social_links,
    profileImage: portfolioDoc.profile_image,
    vibe: portfolioDoc.vibe || "professional",
  };

  return (
    <div className="relative min-h-screen">
      <LivePreview portfolio={portfolio} isPublic={true} />

      {/* Floating badge for public view */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2 bg-black border border-zinc-800 text-white rounded-full shadow-2xl opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2"
        >
          <span>Powered by</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-purple-400">
            PortfolioBuilder
          </span>
        </Link>
      </div>
    </div>
  );
}
