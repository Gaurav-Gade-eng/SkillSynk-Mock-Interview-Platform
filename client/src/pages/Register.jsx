import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F4F5EF] px-4 py-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        body, main { font-family: 'IBM Plex Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <section className="w-full max-w-[560px] rounded-lg border border-[#D8DECF] bg-white p-8 shadow-[0_1px_2px_rgba(27,35,29,0.06),0_12px_32px_-16px_rgba(27,35,29,0.18)] sm:p-12">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#2F6F52] font-serif text-lg font-semibold text-white">
            S
          </span>
          <span className="text-[17px] font-semibold text-[#1B231D]">
            SkillSync <span className="text-[#2F6F52]">AI</span>
          </span>
        </div>

        <span className="mt-12 block font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
          Start practicing free
        </span>
        <h1 className="mt-3 font-serif text-[2.15rem] font-medium leading-tight tracking-[-.01em] text-[#1B231D]">
          Build interview confidence.
        </h1>
        <p className="mt-3 text-[14.5px] text-[#5C6B5E]">
          Your personalized AI coach is one minute away.
        </p>

        <form onSubmit={submit} className="mt-9 space-y-6">
          {[
            ["name", "Full name", "text", "Alex Morgan"],
            ["email", "Email address", "email", "you@example.com"],
            ["password", "Password", "password", "At least 6 characters"],
          ].map(([key, label, type, placeholder]) => (
            <label key={key} className="block">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-[#8A8F80]">
                {label}
              </span>
              <input
                className="mt-2 w-full border-0 border-b border-[#D8DECF] bg-transparent px-0 py-2 text-[15px] text-[#1B231D] placeholder:text-[#B6BCAC] focus:border-[#2F6F52] focus:outline-none focus:ring-0"
                type={type}
                required
                minLength={key === "password" ? 6 : undefined}
                autoComplete={key === "password" ? "new-password" : key}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}

          {error && (
            <p role="alert" className="rounded-md border border-[#E6C3B0] bg-[#FBF0E9] px-4 py-3 text-[13.5px] text-[#8A4322]">
              {error}
            </p>
          )}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2F6F52] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#234F3B] disabled:opacity-70"
            disabled={loading}
          >
            {loading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading ? "Creating account…" : "Create my account"}
          </button>
        </form>

        <p className="mt-8 text-center text-[13.5px] text-[#5C6B5E]">
          Already have an account?{" "}
          <Link className="font-semibold text-[#2F6F52] hover:text-[#234F3B]" to="/">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}