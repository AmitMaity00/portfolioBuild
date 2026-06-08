import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 text-center bg-transparent border-t border-indigo-500/10 dark:border-zinc-800 transition-colors duration-300">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        Build Your Free Portfolio
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mb-10 transition-colors duration-300 font-medium">
        Create a stunning developer portfolio in minutes. Edit visually and publish directly to a live custom URL.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
          Get Started <ArrowRight size={20} />
        </Link>
        <Link href="/editor" className="px-8 py-4 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg">
          Try Editor
        </Link>
      </div>
    </div>
  );
}
