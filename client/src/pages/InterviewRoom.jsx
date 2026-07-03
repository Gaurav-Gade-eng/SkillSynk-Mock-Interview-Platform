import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import WebcamView from "../components/WebcamView";
import VoiceRecorder from "../components/VoiceRecorder";
import speak from "../components/AIVoice";
import api from "../services/api";

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cached = JSON.parse(sessionStorage.getItem(`interview:${id}`) || "null");
  const [questions, setQuestions] = useState(cached?.questions || []);
  const [meta, setMeta] = useState(cached || {});
  const [current, setCurrent] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!questions.length) {
      api.get(`/interview/${id}`).then(({ data }) => {
        setQuestions(data.interview.questions.map((question) => ({ question, category: "Interview" })));
        setMeta(data.interview);
        setCurrent(data.interview.answers.length);
      }).catch(() => navigate("/dashboard"));
    }
  }, [id, navigate, questions.length]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (questions[current]?.question) {
      const delay = window.setTimeout(() => speak(questions[current].question), 350);
      return () => window.clearTimeout(delay);
    }
  }, [current, questions]);

  const progress = useMemo(() => questions.length ? Math.round(((current + (evaluation ? 1 : 0)) / questions.length) * 100) : 0, [current, evaluation, questions.length]);

  const evaluate = async (answer) => {
    setEvaluating(true);
    setError("");
    try {
      const { data } = await api.post("/interview/evaluate", {
        interviewId: id,
        question: questions[current].question,
        answer,
      });
      setEvaluation(data);
    } catch (err) {
      setError(err.response?.data?.message || "Evaluation failed. Your answer is still here—please retry.");
    } finally {
      setEvaluating(false);
    }
  };

  const continueInterview = async () => {
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
      setEvaluation(null);
      return;
    }
    setCompleting(true);
    try {
      await api.post(`/interview/${id}/complete`, { duration: elapsed });
      sessionStorage.removeItem(`interview:${id}`);
      navigate(`/result/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not finish the session.");
      setCompleting(false);
    }
  };

  const themeStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
      .font-serif { font-family: 'Fraunces', serif; }
      body, .app-shell { font-family: 'IBM Plex Sans', sans-serif; }
      .font-mono { font-family: 'IBM Plex Mono', monospace; }
    `}</style>
  );

  if (!questions.length) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F4F5EF]">
        {themeStyles}
        <div className="text-center">
          <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-[#D8DECF] border-t-[#2F6F52]" />
          <p className="mt-4 text-sm text-[#5C6B5E]">Restoring your interview room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5EF]">
      {themeStyles}
      <Navbar compact />
      <main className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-[#E7F0E9] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#2F6F52]">
                {meta.personalized ? "Résumé personalized" : "AI simulation"}
              </span>
              <span className="text-xs text-[#8A8F80]">{meta.difficulty || "Intermediate"}</span>
            </div>
            <h1 className="mt-2 font-serif text-xl font-medium text-[#1B231D]">
              {meta.role || "Technical interview"} · {meta.domain || ""}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-mono font-bold text-[#5C6B5E]">{formatTime(elapsed)}</span>
            <button className="border-0 bg-transparent text-xs font-bold text-[#8A8F80] hover:text-[#1B231D]" onClick={() => navigate("/dashboard")}>
              Exit session
            </button>
          </div>
        </div>

        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#E4E7DD]">
          <div className="h-full rounded-full bg-[#2F6F52] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
          <div className="space-y-5">
            <WebcamView />
            <div className="rounded-lg border border-[#D8DECF] bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[.1em] text-[#8A8F80]">Session progress</span>
                <span className="text-sm font-bold text-[#2F6F52]">{current + 1}/{questions.length}</span>
              </div>
              <div className="mt-4 grid grid-cols-8 gap-1.5">
                {questions.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full ${
                      index < current || (index === current && evaluation)
                        ? "bg-[#2F6F52]"
                        : index === current
                        ? "bg-[#C1652F]"
                        : "bg-[#E4E7DD]"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[#828D7E]">
                Tip: Look toward the camera, pause before answering, and make your reasoning visible.
              </p>
            </div>
          </div>

          <article className="min-h-[620px] rounded-lg border border-[#D8DECF] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                Question {current + 1}
              </span>
              <button
                className="rounded-md border border-[#D8DECF] px-3 py-2 text-xs font-semibold text-[#1B231D] transition-colors hover:border-[#2F6F52] hover:text-[#2F6F52]"
                onClick={() => speak(questions[current].question)}
              >
                ↗ Hear again
              </button>
            </div>
            <h2 className="mt-5 max-w-3xl font-serif text-2xl font-medium leading-[1.35] tracking-[-.01em] text-[#1B231D] sm:text-3xl">
              {questions[current].question}
            </h2>
            <span className="mt-4 inline-block rounded-full border border-[#D8DECF] px-3 py-1 text-[11px] font-semibold text-[#5C6B5E]">
              {questions[current].category || "Technical"}
            </span>

            <div className="my-7 h-px bg-[#EAEDE3]" />

            {!evaluation ? (
              <>
                <p className="mb-3 text-sm font-semibold text-[#1B231D]">Your answer</p>
                <VoiceRecorder key={current} onSubmit={evaluate} disabled={evaluating} />
                {error && <p className="mt-3 text-sm text-[#B3283F]">{error}</p>}
              </>
            ) : (
              <div className="fade-up">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[["Technical", evaluation.technical], ["Communication", evaluation.communication], ["Confidence", evaluation.confidence]].map(([label, score]) => (
                    <div key={label} className="rounded-md border border-[#D8DECF] bg-[#F7F8F3] p-4">
                      <p className="font-mono text-xs font-semibold uppercase tracking-[.06em] text-[#8A8F80]">{label}</p>
                      <p className="mt-2 font-serif text-2xl font-medium text-[#1B231D]">
                        {score}<span className="text-sm text-[#828D7E]">/10</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-[#D8DECF] bg-[#F7F8F3] p-5">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-[#2F6F52]">AI coach feedback</p>
                  <p className="mt-2 text-sm leading-6 text-[#3F473F]">{evaluation.feedback}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[.06em] text-[#2F6F52]">What worked</p>
                      <p className="mt-1 text-xs leading-5 text-[#5C6B5E]">{evaluation.strengths}</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[.06em] text-[#C1652F]">Level up</p>
                      <p className="mt-1 text-xs leading-5 text-[#5C6B5E]">{evaluation.weaknesses}</p>
                    </div>
                  </div>
                </div>
                {error && <p className="mt-3 text-sm text-[#B3283F]">{error}</p>}
                <button
                  onClick={continueInterview}
                  disabled={completing}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#2F6F52] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#234F3B] disabled:opacity-70"
                >
                  {completing && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                  {current === questions.length - 1 ? "Finish & view full report" : "Continue to next question →"}
                </button>
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}