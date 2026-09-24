import { useState, type FormEvent } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { siteConfig } from "@/config/site";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signingUp = mode === "sign-up";
  const router = useRouter();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    
    const password = String(data.get("password"));
    if (signingUp) {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/.test(password)) {
        setError("Kata sandi harus memiliki minimal 8 karakter, huruf besar, huruf kecil, dan karakter unik/spesial.");
        return;
      }
      const confirmPassword = String(data.get("confirmPassword"));
      if (password !== confirmPassword) {
        setError("Kata sandi dan Konfirmasi Kata Sandi tidak cocok.");
        return;
      }
    }

    setPending(true);
    setError("");
    try {
      const credentials = {
        email: String(data.get("email")).trim(),
        password,
      };
      const result = signingUp
        ? await authClient.signUp.email({
            ...credentials,
            name: String(data.get("name")).trim(),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        setError(
          signingUp
            ? result.error.message ||
                "We couldn't create your account. Please try again."
            : "We couldn't sign you in. Check your email and password and try again.",
        );
        return;
      }
      await router.invalidate();
      await navigate({ to: siteConfig.homePath, replace: true });
    } catch {
      setError(
        "We couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <p className="mb-3 text-xs font-bold tracking-widest text-brand-500 uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow"></span>
        {signingUp ? "System Access" : "Welcome Back"}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
        {signingUp ? "Initialize Node" : "Authenticate"}
      </h1>
      <p className="text-sm leading-relaxed text-gray-400">
        {signingUp
          ? "Create your institutional research profile to access the Multi-Agent Swarm."
          : "Access your dashboard and deploy AI agents."}
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-5"
        aria-busy={pending}
        aria-describedby={error ? "auth-error" : undefined}
      >
        <fieldset disabled={pending} className="space-y-4">
          <legend className="sr-only">
            {signingUp ? "Account details" : "Sign in details"}
          </legend>
          {signingUp && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-gray-400">Name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Institutional Name"
                required
                minLength={1}
                maxLength={100}
                pattern=".*\S.*"
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-dark-700"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-gray-400">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@institution.com"
              required
              maxLength={254}
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-dark-700 font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-medium text-gray-400">Password</label>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={signingUp ? "new-password" : "current-password"}
                required
                minLength={8}
                maxLength={128}
                aria-describedby={signingUp ? "password-hint" : undefined}
                className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-dark-700 font-mono tracking-widest pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {signingUp && (
              <p id="password-hint" className="text-xs text-brand-500 mt-1">
                * Ketentuan: Kata sandi minimal harus 8 karakter, mengandung huruf besar, huruf kecil, dan karakter unik.
              </p>
            )}
          </div>
          
          {signingUp && (
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-gray-400">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-dark-700 font-mono tracking-widest pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  aria-label={showConfirmPassword ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p
              id="auth-error"
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
            >
              {error}
            </p>
          )}
          <button 
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(255,122,0,0.3)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)] mt-6 disabled:opacity-50 disabled:cursor-not-allowed" 
            type="submit" 
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle
                className="animate-spin size-5"
                aria-hidden="true"
              />
            ) : null}
            {pending
              ? "Connecting..."
              : signingUp
                ? "Initialize Account"
                : "Authorize"}
            {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
          </button>
        </fieldset>
      </form>
      <p className="mt-6 text-center text-xs text-gray-500">
        {signingUp ? "Already have access?" : "No access yet?"}{" "}
        <Link
          className="font-medium text-brand-500 hover:text-brand-400 underline underline-offset-4 transition-colors"
          to={signingUp ? "/sign-in" : "/sign-up"}
        >
          {signingUp ? "Sign in" : "Request account"}
        </Link>
      </p>
    </div>
  );
}
