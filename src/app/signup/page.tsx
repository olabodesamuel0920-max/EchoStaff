"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Building } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000")
    ).replace(/\/$/, "");

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            full_name: fullName,
            business_name: businessName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      } else if (data.session) {
        router.push("/dashboard");
      } else {
        setSuccessMessage("Account created! Please check your email to confirm registration.");
        setLoading(false);
      }
    } else {
      // Simulate signup delay
      setTimeout(() => {
        setLoading(false);
        router.push("/dashboard");
      }, 800);
    }
  };


  return (
    <div className="flex min-h-screen flex-col justify-center bg-black py-12 px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white shadow-lg shadow-purple-500/20 glow-text">
            ES
          </div>
          <span className="font-semibold text-xl text-white">EchoStaff AI</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-zinc-100">
          Create your brand account
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Or{" "}
          <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-950/80 border border-zinc-900 px-4 py-8 shadow-2xl rounded-xl sm:px-10 glass-panel">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3 text-xs text-red-400">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/20 p-3 text-xs text-emerald-400">
                {successMessage}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Full name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-zinc-600" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-750 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="business" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Business name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building className="h-4 w-4 text-zinc-600" />
                </div>
                <input
                  id="business"
                  name="business"
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-755 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-zinc-600" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-zinc-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/40 py-2.5 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                defaultChecked
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-zinc-400">
                I agree to the{" "}
                <a href="#" className="font-semibold text-purple-400 hover:text-purple-300">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? "Initializing sandbox..." : "Create Free Account"}
              </button>
            </div>
          </form>

          {/* Social login partition */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-900" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/20 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Google
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/20 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
