import { useEffect, useRef, useState } from "react";

export default function VoiceRecorder({ onSubmit, disabled }) {
  const recognitionRef = useRef(null);
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [error, setError] = useState("");

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let committed = answer;

    recognition.onstart = () => { setListening(true); setError(""); };
    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript;
        if (event.results[index].isFinal) committed = `${committed} ${text}`.trim();
        else interim += text;
      }
      setAnswer(`${committed} ${interim}`.trim());
    };
    recognition.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Microphone permission was blocked. Type your answer below." : "Voice capture paused. You can continue typing.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const submit = () => {
    recognitionRef.current?.stop();
    if (answer.trim()) onSubmit(answer.trim());
  };

  return (
    <div>
      <div className="relative">
        <textarea
          className="min-h-[150px] w-full resize-none rounded-md border border-[#D8DECF] bg-white px-4 pb-14 pt-4 text-[15px] leading-7 text-[#1B231D] placeholder:text-[#B6BCAC] focus:border-[#2F6F52] focus:outline-none focus:ring-0"
          placeholder={speechSupported ? "Speak naturally or type your answer here..." : "Speech recognition is unavailable in this browser. Type your answer here..."}
          value={answer}
          disabled={disabled}
          onChange={(event) => setAnswer(event.target.value)}
        />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={disabled}
              className={`grid h-9 w-9 place-items-center rounded-full border text-sm transition-colors ${
                listening
                  ? "pulse-ring border-[#C1652F] bg-[#C1652F] text-white"
                  : "border-[#D8DECF] bg-white text-[#5C6B5E] hover:border-[#2F6F52] hover:text-[#2F6F52]"
              }`}
            >
              {listening ? "■" : "●"}
            </button>
          )}
          <span className="font-mono text-[11px] font-semibold text-[#8A8F80]">
            {listening ? "Listening live..." : `${answer.trim() ? answer.trim().split(/\s+/).length : 0} words`}
          </span>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-[#B3283F]">{error}</p>}
      <button
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#2F6F52] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#234F3B] disabled:opacity-70"
        disabled={disabled || !answer.trim()}
        onClick={submit}
      >
        {disabled ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> AI coach is evaluating...
          </>
        ) : (
          "Submit answer for feedback"
        )}
      </button>
    </div>
  );
}