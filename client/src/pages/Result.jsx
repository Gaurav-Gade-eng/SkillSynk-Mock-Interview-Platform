import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const scoreTone = (score) =>
  score >= 8 ? ["Excellent", "#2F6F52"] : score >= 6 ? ["Strong foundation", "#4C7A63"] : ["Growth opportunity", "#C1652F"];

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [openAnswer, setOpenAnswer] = useState(0);

  useEffect(() => {
    api.get(`/interview/${id}`).then(({ data }) => setInterview(data.interview)).catch(() => navigate("/dashboard"));
  }, [id, navigate]);

  const averages = useMemo(() => {
    if (!interview?.answers?.length) return {};
    const sums = interview.answers.reduce((total, answer) => ({
      technical: total.technical + answer.technical,
      communication: total.communication + answer.communication,
      confidence: total.confidence + answer.confidence,
    }), { technical: 0, communication: 0, confidence: 0 });
    return Object.fromEntries(Object.entries(sums).map(([key, value]) => [key, Number((value / interview.answers.length).toFixed(1))]));
  }, [interview]);

  const themeStyles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,450;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
      .font-serif { font-family: 'Fraunces', serif; }
      body, .app-shell { font-family: 'IBM Plex Sans', sans-serif; }
      .font-mono { font-family: 'IBM Plex Mono', monospace; }
    `}</style>
  );

  if (!interview) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F4F5EF]">
        {themeStyles}
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8DECF] border-t-[#2F6F52]" />
      </div>
    );
  }

  const [label, color] = scoreTone(interview.score);
  const answered = interview.answers.length;

  return (
    <div className="min-h-screen bg-[#F4F5EF]">
      {themeStyles}
      <Navbar />
      <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
        <section className="relative overflow-hidden rounded-lg border border-[#D8DECF] bg-white p-7 sm:p-10">
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                Interview report
              </span>
              <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-.01em] text-[#1B231D] sm:text-5xl">
                Session complete.
              </h1>
              <p className="mt-3 max-w-xl leading-7 text-[#5C6B5E]">
                You completed {answered} questions for a {interview.role} interview focused on {interview.domain}. Here is the honest signal—and your path forward.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[interview.difficulty, `${Math.round((interview.duration || 0) / 60)} min`, `${answered} answers`].map((tag) => (
                  <span key={tag} className="rounded-full border border-[#D8DECF] px-3 py-1.5 text-xs font-semibold text-[#5C6B5E]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="grid h-44 w-44 place-items-center rounded-full p-2"
              style={{ background: `conic-gradient(${color} ${interview.score * 10}%, #E4E7DD 0)` }}
            >
              <div className="grid h-full w-full place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="font-serif text-5xl font-medium text-[#1B231D]">{interview.score}</p>
                  <p className="font-mono text-xs font-semibold text-[#8A8F80]">OUT OF 10</p>
                  <p className="mt-2 text-xs font-bold" style={{ color }}>{label}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {[["Technical depth", averages.technical], ["Communication", averages.communication], ["Confidence", averages.confidence]].map(([name, score]) => (
            <article key={name} className="rounded-lg border border-[#D8DECF] bg-white p-6">
              <div className="flex items-end justify-between">
                <p className="text-sm font-semibold text-[#5C6B5E]">{name}</p>
                <p className="font-serif text-2xl font-medium text-[#1B231D]">
                  {score}<span className="text-xs text-[#828D7E]">/10</span>
                </p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E4E7DD]">
                <div className="h-full rounded-full bg-[#2F6F52]" style={{ width: `${score * 10}%` }} />
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
          <article className="overflow-hidden rounded-lg border border-[#D8DECF] bg-white">
            <div className="border-b border-[#EAEDE3] p-6">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                Question review
              </span>
              <h2 className="mt-2 font-serif text-xl font-medium text-[#1B231D]">Detailed coaching</h2>
            </div>
            <div className="divide-y divide-[#EAEDE3]">
              {interview.answers.map((answer, index) => {
                const average = ((answer.technical + answer.communication + answer.confidence) / 3).toFixed(1);
                const open = openAnswer === index;
                return (
                  <div key={`${answer.question}-${index}`} className="p-5 sm:p-6">
                    <button
                      className="flex w-full items-start justify-between gap-5 border-0 bg-transparent text-left"
                      onClick={() => setOpenAnswer(open ? -1 : index)}
                    >
                      <div className="flex gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#E7F0E9] text-xs font-bold text-[#2F6F52]">
                          {index + 1}
                        </span>
                        <p className="font-semibold leading-6 text-[#1B231D]">{answer.question}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-[#F7F8F3] px-2.5 py-1 text-xs font-bold text-[#5C6B5E]">
                        {average}
                      </span>
                    </button>
                    {open && (
                      <div className="fade-up ml-10 mt-5 space-y-4">
                        <div>
                          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8A8F80]">Your answer</p>
                          <p className="mt-1 text-sm leading-6 text-[#5C6B5E]">{answer.answer}</p>
                        </div>
                        <div className="rounded-md border border-[#D8DECF] bg-[#F7F8F3] p-4">
                          <p className="font-mono text-xs font-semibold uppercase tracking-[.06em] text-[#2F6F52]">Coach feedback</p>
                          <p className="mt-2 text-sm leading-6 text-[#3F473F]">{answer.feedback}</p>
                        </div>
                        {answer.improvedAnswer && (
                          <div>
                            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2F6F52]">A stronger direction</p>
                            <p className="mt-1 text-sm leading-6 text-[#5C6B5E]">{answer.improvedAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>

          <div className="space-y-5">
            <article className="rounded-lg border border-[#D8DECF] bg-white p-6">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[.18em] text-[#8A8F80]">
                Next practice plan
              </span>
              <h2 className="mt-2 font-serif text-xl font-medium text-[#1B231D]">Three moves to improve</h2>
              <ol className="mt-5 space-y-4">
                {[
                  "Re-answer your lowest-scoring question using a concrete project example.",
                  "Keep each answer structured: context, decision, trade-off, result.",
                  "Run another session at the same difficulty and aim for +0.5.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[#5C6B5E]">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E7F0E9] text-xs font-bold text-[#2F6F52]">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </article>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2F6F52] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#234F3B]"
              onClick={() => navigate("/dashboard")}
            >
              Practice another interview →
            </button>
            <button
              className="w-full rounded-md border border-[#D8DECF] bg-white py-2.5 text-sm font-semibold text-[#1B231D] transition-colors hover:border-[#2F6F52] hover:text-[#2F6F52]"
              onClick={() => window.print()}
            >
              Save report as PDF
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}