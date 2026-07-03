import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function SpiralBinding() {
  return (
    <div className="absolute left-0 top-0 z-10 hidden h-full w-9 flex-col items-center justify-evenly bg-[#EDEEE6] lg:flex">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="h-3 w-3 rounded-full bg-[#F4F5EF] shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]"
        />
      ))}
    </div>
  );
}

function AuthVisual() {
  const points = [
    {
      title: "Practice out loud, not just on paper",
      detail: "Most prep tools give you text. SkillSync makes you actually speak the answer, like the real thing.",
    },
    {
      title: "Feedback on how you sound, not just what you say",
      detail: "Pacing, filler words, and structure, flagged in real time.",
    },
    {
      title: "Built from your résumé",
      detail: "Questions are pulled from your actual background, not a generic question bank.",
    },
  ];

  return (
    <div className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#EFF3EC] p-12 pl-16 lg:flex">
      <div>
        <h2 className="mt-4 max-w-md font-serif text-[2.6rem] font-medium leading-[1.12] tracking-[-.01em] text-[#1B231D]">
          Rehearse it until it sounds like you.
        </h2>
        <p className="mt-4 max-w-sm text-[15px] leading-7 text-[#5C6B5E]">
          Real interview questions, spoken out loud, with feedback on pacing, filler words, and structure.
        </p>
      </div>

      <div className="relative rounded-md border border-[#D8DECF] bg-white p-6">
        <div className="space-y-5">
          {points.map((point, i) => (
            <div key={point.title} className={`flex gap-3 ${i > 0 ? "border-t border-[#EAEDE3] pt-5" : ""}`}>
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2F6F52]" />
              <div>
                <p className="font-serif text-[15px] leading-6 text-[#1B231D]">{point.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-[#828D7E]">{point.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className="relative space-y-2.5 border-t border-[#D8DECF] pt-6">
        {[
          ["98%", "Real time feedback on your answers"],
          ["3×", "Faster improvement versus reading question banks alone"],
          ["24/7", "Coach access — Practice the night before, not just the morning of"],
        ].map(([n, label]) => (
          <li key={label} className="flex items-baseline gap-3 text-[13px] leading-5 text-[#5C6B5E]">
            <span className="w-10 shrink-0 font-mono text-[13px] font-bold text-[#2F6F52]">{n}</span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in right now.");
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

      <div className="relative grid w-full max-w-[1080px] overflow-hidden rounded-lg border border-[#D8DECF] bg-white shadow-[0_1px_2px_rgba(27,35,29,0.06),0_12px_32px_-16px_rgba(27,35,29,0.18)] lg:grid-cols-[.88fr_1.12fr]">
        <SpiralBinding />

        <section className="flex min-h-[650px] flex-col justify-center p-8 pl-12 sm:p-14 lg:pl-20">
          <div className="mb-11 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#2F6F52] font-serif text-lg font-semibold text-white">
              S
            </span>
            <span className="text-[17px] font-semibold text-[#1B231D]">
              SkillSync <span className="text-[#2F6F52]">AI</span>
            </span>
          </div>

          <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
            Welcome back
          </span>
          <h1 className="mt-3 font-serif text-[2.15rem] font-medium leading-tight tracking-[-.01em] text-[#1B231D]">
            Ready for your next win?
          </h1>
          <p className="mt-3 text-[14.5px] text-[#5C6B5E]">Sign in to continue your interview practice.</p>

          <form onSubmit={submit} className="mt-9 space-y-6">
            <label className="block">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-[#8A8F80]">
                Email address
              </span>
              <input
                className="mt-2 w-full border-0 border-b border-[#D8DECF] bg-transparent px-0 py-2 text-[15px] text-[#1B231D] placeholder:text-[#B6BCAC] focus:border-[#2F6F52] focus:outline-none focus:ring-0"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label className="block">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-[#8A8F80]">
                Password
              </span>
              <input
                className="mt-2 w-full border-0 border-b border-[#D8DECF] bg-transparent px-0 py-2 text-[15px] text-[#1B231D] placeholder:text-[#B6BCAC] focus:border-[#2F6F52] focus:outline-none focus:ring-0"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

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
              {loading ? "Signing in…" : "Sign in to SkillSync"}
            </button>
          </form>

          <p className="mt-8 text-center text-[13.5px] text-[#5C6B5E]">
            New here?{" "}
            <Link className="font-semibold text-[#2F6F52] hover:text-[#234F3B]" to="/register">
              Create account
            </Link>
          </p>
        </section>

        <AuthVisual />
      </div>
    </main>
  );
}