import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 text-white border-t border-zinc-800">
      <SignIn routing="hash" />
    </div>
  );
}
