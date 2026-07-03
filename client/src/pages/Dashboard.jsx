import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const DOMAINS = ["MERN Stack", "Frontend Engineering", "Backend Engineering", "Java", "Python", "Data Structures", "DBMS", "System Design", "DevOps"];
const ROLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Graduate Engineer", "Technical Lead"];

const formatDate = (date) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [setup, setSetup] = useState({ domain: "MERN Stack", role: "Software Engineer", difficulty: "Intermediate" });
  const [dashboard, setDashboard] = useState({ stats: {}, recent: [] });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      const [history, resumeResponse] = await Promise.all([
        api.get("/interview/dashboard"),
        api.get("/resume"),
      ]);
      setDashboard(history.data);
      setResume(resumeResponse.data.resume);
    } catch {
      // The global API interceptor handles expired sessions.
    }
  };

  useEffect(() => {
    Promise.all([api.get("/interview/dashboard"), api.get("/resume")])
      .then(([history, resumeResponse]) => {
        setDashboard(history.data);
        setResume(resumeResponse.data.resume);
      })
      .catch(() => {});
  }, []);

  const startInterview = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.post("/interview/generate", { ...setup, questionCount: 8 });
      sessionStorage.setItem(`interview:${data.interviewId}`, JSON.stringify(data));
      navigate(`/interview/${data.interviewId}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not start the interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const { data } = await api.post("/resume/upload", formData);
      setMessage(data.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not upload this résumé.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const stats = [
    ["Interviews", dashboard.stats.total || 0, "completed sessions"],
    ["Average score", `${dashboard.stats.averageScore || 0}/10`, "across all sessions"],
    ["Personal best", `${dashboard.stats.bestScore || 0}/10`, "keep pushing"],
    ["Practice time", `${dashboard.stats.practiceMinutes || 0}m`, "focused preparation"],
  ];

  return (
    <div className="min-h-screen bg-[#F4F5EF]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        body, .app-shell { font-family: 'IBM Plex Sans', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <Navbar />
      <main className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
              Command center
            </span>
            <h1 className="mt-2 font-serif text-3xl font-medium tracking-[-.01em] text-[#1B231D] sm:text-4xl">
              Good to see you, {user.name?.split(" ")[0] || "Candidate"}.
            </h1>
            <p className="mt-2 text-[14.5px] text-[#5C6B5E]">Every strong interview starts with one honest practice round.</p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-[#BFDBC9] bg-[#E7F0E9] px-4 py-2 text-xs font-bold text-[#2F6F52]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F6F52]" /> Systems ready
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, detail]) => (
            <article key={label} className="rounded-lg border border-[#D8DECF] bg-white p-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[.1em] text-[#8A8F80]">{label}</p>
              <div className="mt-3 font-serif text-3xl font-medium text-[#1B231D]">{value}</div>
              <p className="mt-1 text-xs text-[#828D7E]">{detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
          <article className="overflow-hidden rounded-lg border border-[#D8DECF] bg-white">
            <div className="border-b border-[#EAEDE3] p-6 sm:p-7">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                New simulation
              </span>
              <h2 className="mt-2 font-serif text-2xl font-medium text-[#1B231D]">Build your interview room</h2>
              <p className="mt-1 text-sm text-[#5C6B5E]">Choose your target and the AI will create a focused 8-question session.</p>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-[#8A8F80]">Target role</span>
                <select
                  className="mt-2 w-full rounded-md border border-[#D8DECF] bg-white px-3 py-2 text-[15px] text-[#1B231D] focus:border-[#2F6F52] focus:outline-none focus:ring-0"
                  value={setup.role}
                  onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                >
                  {ROLES.map((role) => <option key={role}>{role}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-[#8A8F80]">Focus area</span>
                <select
                  className="mt-2 w-full rounded-md border border-[#D8DECF] bg-white px-3 py-2 text-[15px] text-[#1B231D] focus:border-[#2F6F52] focus:outline-none focus:ring-0"
                  value={setup.domain}
                  onChange={(e) => setSetup({ ...setup, domain: e.target.value })}
                >
                  {DOMAINS.map((domain) => <option key={domain}>{domain}</option>)}
                </select>
              </label>
              <div className="sm:col-span-2">
                <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-[#8A8F80]">Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSetup({ ...setup, difficulty: level })}
                      className={`rounded-md border px-3 py-3 text-sm font-semibold transition-colors ${
                        setup.difficulty === level
                          ? "border-[#2F6F52] bg-[#E7F0E9] text-[#2F6F52]"
                          : "border-[#D8DECF] bg-[#F7F8F3] text-[#5C6B5E] hover:border-[#B9C2AE]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={startInterview}
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-md bg-[#2F6F52] px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#234F3B] disabled:opacity-70 sm:col-span-2 sm:w-fit"
              >
                {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                {loading ? "Preparing your interview..." : "Start AI interview →"}
              </button>
              {message && <p className="text-sm font-medium text-[#2F6F52] sm:col-span-2">{message}</p>}
            </div>
          </article>

          <div className="grid gap-5">
            <article className="rounded-lg border border-[#D8DECF] bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                    Personalization
                  </span>
                  <h2 className="mt-2 font-serif text-xl font-medium text-[#1B231D]">Your resume</h2>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    resume ? "bg-[#E7F0E9] text-[#2F6F52]" : "bg-[#FBEFE6] text-[#B45B22]"
                  }`}
                >
                  {resume ? "Active" : "Optional"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#5C6B5E]">
                {resume ? `${resume.fileName} is guiding personalized project and experience questions.` : "Upload a PDF to get questions about your actual projects, stack, and experience."}
              </p>
              <input ref={fileInput} hidden type="file" accept="application/pdf" onChange={uploadResume} />
              <button
                className="mt-5 w-full rounded-md border border-[#D8DECF] bg-white py-2.5 text-sm font-semibold text-[#1B231D] transition-colors hover:border-[#2F6F52] hover:text-[#2F6F52] disabled:opacity-70"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                {uploading ? "Reading résumé..." : resume ? "Replace resume" : "Upload résumé PDF"}
              </button>
            </article>
            <article className="rounded-lg border border-[#D8DECF] bg-white p-6">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                Coach's note
              </span>
              <p className="mt-3 font-serif text-lg italic leading-7 text-[#1B231D]">
                "Strong answers are specific, structured, and honest about trade-offs."
              </p>
              <p className="mt-3 text-xs text-[#828D7E]">Try the Context → Action → Result structure today.</p>
            </article>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-lg border border-[#D8DECF] bg-white">
          <div className="flex items-center justify-between border-b border-[#EAEDE3] p-6">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                Progress
              </span>
              <h2 className="mt-1 font-serif text-xl font-medium text-[#1B231D]">Recent interviews</h2>
            </div>
          </div>
          {dashboard.recent.length ? (
            <div className="divide-y divide-[#EAEDE3]">
              {dashboard.recent.map((item) => (
                <button
                  key={item._id}
                  onClick={() => navigate(`/result/${item._id}`)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-4 border-0 bg-transparent px-6 py-4 text-left transition-colors hover:bg-[#F7F8F3] sm:grid-cols-[1fr_1fr_auto_auto]"
                >
                  <div>
                    <p className="font-semibold text-[#1B231D]">{item.role}</p>
                    <p className="mt-1 text-xs text-[#828D7E]">{item.domain}</p>
                  </div>
                  <span className="mobile-hide text-sm text-[#5C6B5E]">{item.difficulty}</span>
                  <span className="mobile-hide font-mono text-xs text-[#8A8F80]">{formatDate(item.completedAt)}</span>
                  <span className="rounded-md bg-[#E7F0E9] px-3 py-1.5 text-sm font-bold text-[#2F6F52]">{item.score}/10</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="font-serif text-lg font-medium text-[#1B231D]">Your progress story starts here.</p>
              <p className="mt-2 text-sm text-[#5C6B5E]">Complete an interview and your performance trends will appear here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}