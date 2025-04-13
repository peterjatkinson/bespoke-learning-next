// File: src/app/auth/signin/page.jsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

// Optionally, you can read the callbackUrl from the URL parameters if needed.
export default function SignInPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("/");

  // Defer reading URL parameters so that this code only runs on the client.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || "/");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call signIn with the "credentials" provider.
    const res = await signIn("credentials", { password, callbackUrl, redirect: false });
    if (res?.error) {
      setError("Incorrect password");
    } else {
      // If sign in is successful, you can either rely on NextAuth's default redirect
      // or manually redirect using:
      window.location.href = callbackUrl;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4">
      <div className="max-w-sm w-full bg-slate-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Sign In
          </button>
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
