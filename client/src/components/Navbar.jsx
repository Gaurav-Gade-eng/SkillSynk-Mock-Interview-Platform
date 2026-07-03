import { useNavigate } from "react-router-dom";

export default function Navbar({ compact = false }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = (user.name || "Candidate")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="border-b border-[#D8DECF] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <button className="flex items-center gap-3 border-0 bg-transparent" onClick={() => navigate("/dashboard")}>
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#2F6F52] font-serif text-lg font-semibold text-white">
            S
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1B231D]">
            SkillSync<span className="text-[#2F6F52]"> AI</span>
          </span>
        </button>
        <div className="flex items-center gap-3">
          {!compact && (
            <span className="mobile-hide flex items-center gap-2 rounded-full border border-[#BFDBC9] bg-[#E7F0E9] px-3 py-1.5 text-xs font-bold text-[#2F6F52]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2F6F52]" /> AI coach online
            </span>
          )}
          <div className="grid h-9 w-9 place-items-center rounded-full border border-[#D8DECF] bg-[#F7F8F3] font-mono text-xs font-bold text-[#2F6F52]">
            {initials}
          </div>
          <button onClick={logout} className="border-0 bg-transparent text-sm font-semibold text-[#8A8F80] hover:text-[#1B231D]">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}