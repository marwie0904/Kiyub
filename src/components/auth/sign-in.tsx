"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { CubeLoader } from "@/components/ui/cube-loader";
import { useRouter } from "next/navigation";

export function SignIn() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn("password", { email, password, flow: "signIn" });
      toast.success("Signed in successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign in. Please check your credentials.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Background gradient circle spanning both sides */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12">
        <div className="z-10 text-center space-y-8 max-w-2xl">
          <div className="flex justify-center mb-6">
            <CubeLoader />
          </div>
          <h1 className="text-6xl font-bold text-foreground leading-tight">
            Built By Students
            <br />
            For Students
          </h1>
          <p className="text-lg text-foreground/80 max-w-xl mx-auto">
            Experience the future of learning with our AI-powered platform designed to help students succeed.
          </p>
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm text-foreground/70">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm text-foreground/70">Student-Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm text-foreground/70">Affordable & Accurate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">Sign in</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                ALPHA
              </span>
            </div>
          </div>

          <form onSubmit={handlePasswordSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
