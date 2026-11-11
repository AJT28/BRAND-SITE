
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stage = "login" | "enroll" | "verify";

export default function AdminLoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [stage, setStage] = useState<Stage>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function setupMFA() {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) throw error;

    const verifiedFactor = data.totp.find(
      (factor) => factor.status === "verified"
    );

    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      setStage("verify");
      return;
    }

    const { data: enrollment, error: enrollmentError } =
      await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "YOUR BRAND Admin",
      });

    if (enrollmentError) throw enrollmentError;

    setFactorId(enrollment.id);
    setQrCode(enrollment.totp.qr_code);
    setStage("enroll");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await setupMFA();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) throw challengeError;

      const { error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.id,
          code: code.trim(),
        });

      if (verifyError) throw verifyError;

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError || isAdmin !== true) {
        await supabase.auth.signOut();
        throw new Error("Administrator access denied");
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "MFA verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-orange-50 to-fuchsia-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-3xl font-black text-fuchsia-700">
          YOUR BRAND
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Secure Administrator Login
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        {stage === "login" ? (
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="Admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-fuchsia-700 p-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-8 space-y-4">
            {stage === "enroll" && (
              <div className="space-y-3 text-center">
                <p className="text-sm text-gray-700">
                  Scan this QR code with Google Authenticator or
                  Microsoft Authenticator.
                </p>

                {/* QR code generated by Supabase Auth */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt="MFA enrollment QR code"
                  className="mx-auto h-48 w-48"
                />
              </div>
            )}

            {stage === "verify" && (
              <p className="text-center text-sm text-gray-700">
                Enter the code from your authenticator app.
              </p>
            )}

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              required
              placeholder="6-digit code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-xl border p-3 text-center tracking-widest"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-fuchsia-700 p-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify and Open Dashboard"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-gray-500">
          Authorized administrators only
        </p>
      </div>
    </main>
  );
}
