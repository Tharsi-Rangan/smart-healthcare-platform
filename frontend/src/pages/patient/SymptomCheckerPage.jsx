import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  HeartPulse,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  Stethoscope,
  Trash2,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import lottie from "lottie-web";
import heartbeatAnalysisAnimation from "../../assets/animations/Heartbeat Lottie Animation.json";
import {
  analyzeSymptoms,
  deleteSymptomById,
  deleteSymptomHistory,
  getSymptomHistory,
} from "../../services/symptomApi";

const urgencyClassMap = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

const urgencyLabelMap = {
  High: "High 🚨",
  Medium: "Medium ⚠️",
  Low: "Low 😊",
};

const urgencyMessageMap = {
  High:
    "This may need urgent medical attention. Please contact emergency care if symptoms worsen.",
  Medium:
    "This is not an emergency, but it is a good idea to consult a doctor soon.",
  Low:
    "This appears lower urgency, but consult a doctor if symptoms continue or worsen.",
};

const analyzingMessages = [
  "Checking possible conditions...",
  "Finding the best care for you...",
  "Preparing helpful advice...",
];

const formatHistoryDateTime = (value) => {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const normalizeHistory = (payload) => {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

function SymptomCheckerPage() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const baseSymptomsRef = useRef("");
  const lottieContainerRef = useRef(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");

  const [formData, setFormData] = useState({
    symptoms: "",
    duration: "",
    severity: "",
    ageGroup: "",
  });
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [analyzingMessageIndex, setAnalyzingMessageIndex] = useState(0);
  const [isLottieReady, setIsLottieReady] = useState(false);

  useEffect(() => {
    if (!isAnalyzing) {
      setAnalyzingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setAnalyzingMessageIndex((prev) => (prev + 1) % analyzingMessages.length);
    }, 1600);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!isAnalyzing || !lottieContainerRef.current) {
      setIsLottieReady(false);
      return;
    }

    let animationInstance;

    try {
      animationInstance = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: heartbeatAnalysisAnimation,
      });
      setIsLottieReady(true);
    } catch {
      setIsLottieReady(false);
    }

    return () => {
      if (animationInstance) {
        animationInstance.destroy();
      }
      setIsLottieReady(false);
    };
  }, [isAnalyzing]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsVoiceSupported(false);
      return;
    }

    setIsVoiceSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setPageError("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript || "";
      }

      const base = baseSymptomsRef.current || "";
      const spacer = base && !base.endsWith(" ") ? " " : "";

      setFormData((prev) => ({
        ...prev,
        symptoms: `${base}${spacer}${transcript.trim()}`.trim(),
      }));
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setPageError("Microphone permission denied. Please allow microphone access.");
      } else {
        setPageError("Voice input failed. Please try again.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [voiceLanguage]);

  const loadHistory = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsRefreshingHistory(true);
    }

    try {
      const response = await getSymptomHistory();
      setHistory(normalizeHistory(response));
      setPageError("");
    } catch (error) {
      setPageError(
        error?.response?.data?.message || "Failed to load symptom history"
      );
    } finally {
      if (!silent) {
        setIsRefreshingHistory(false);
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const latestResult = useMemo(() => {
    if (result) {
      return result;
    }

    return history[0] || null;
  }, [result, history]);

  const symptomLength = formData.symptoms.trim().length;

  const onChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const onAnalyze = async (event) => {
    event.preventDefault();
    setFormError("");
    setPageError("");
    setInfoMessage("");

    const symptoms = formData.symptoms.trim();

    if (symptoms.length < 3) {
      setFormError("Please enter at least 3 characters of symptoms.");
      return;
    }

    const payload = {
      symptoms,
      ...(formData.duration.trim() ? { duration: formData.duration.trim() } : {}),
      ...(formData.severity ? { severity: formData.severity } : {}),
      ...(formData.ageGroup.trim() ? { ageGroup: formData.ageGroup.trim() } : {}),
    };

    setIsAnalyzing(true);

    try {
      const response = await analyzeSymptoms(payload);
      const record = response?.data || null;

      setResult(record);
      setInfoMessage("Symptoms analyzed successfully.");
      await loadHistory({ silent: true });
    } catch (error) {
      setPageError(
        error?.response?.data?.message || "Failed to analyze symptoms"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    if (!record?._id) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this symptom record from your history?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingRecordId(record._id);
    setPageError("");
    setInfoMessage("");

    try {
      await deleteSymptomById(record._id);
      setInfoMessage("Symptom record deleted successfully.");

      setHistory((prev) => prev.filter((item) => item._id !== record._id));

      if (result?._id === record._id) {
        setResult(null);
      }

      await loadHistory({ silent: true });
    } catch (error) {
      setPageError(
        error?.response?.data?.message || "Failed to delete this symptom record"
      );
    } finally {
      setDeletingRecordId("");
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      "Delete all your symptom history records? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingAll(true);
    setPageError("");
    setInfoMessage("");

    try {
      await deleteSymptomHistory();
      setHistory([]);
      setResult(null);
      setInfoMessage("All symptom history deleted successfully.");
    } catch (error) {
      setPageError(
        error?.response?.data?.message || "Failed to delete all symptom history"
      );
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleViewDoctors = () => {
    if (!latestResult?.recommendedSpecialty) {
      return;
    }

    navigate(
      `/doctors?specialization=${encodeURIComponent(
        latestResult.recommendedSpecialty
      )}`
    );
  };

  const handleBookAppointment = () => {
    if (!latestResult?.recommendedSpecialty) {
      navigate("/doctors");
      return;
    }

    navigate(
      `/doctors?specialization=${encodeURIComponent(
        latestResult.recommendedSpecialty
      )}`
    );
  };

  const handleReadAloud = () => {
    if (!latestResult) {
      return;
    }

    if (typeof window === "undefined" || !window.speechSynthesis) {
      setPageError("Read aloud is not supported in this browser.");
      return;
    }

    const text = [
      `Recommended specialty: ${latestResult.recommendedSpecialty || "General Physician"}.`,
      latestResult.preliminarySuggestion,
      latestResult.whenToSeekHelp,
      latestResult.disclaimer,
    ]
      .filter(Boolean)
      .join(" ");

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setPageError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    baseSymptomsRef.current = formData.symptoms.trim();
    recognitionRef.current.start();
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-linear-to-r from-cyan-50 via-sky-50 to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Symptom Checker</h1>
            <p className="mt-2 text-base font-medium text-slate-700">
              Tell us how you feel and get quick, safe guidance.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Simple insights first, doctor support whenever you need it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/90 px-3 py-1 text-cyan-700 shadow-sm">
              Private by account
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-emerald-700 shadow-sm">
              Fast response
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 text-amber-700 shadow-sm">
              AI-assisted only
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={onAnalyze}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-800">
            <HeartPulse size={18} className="text-cyan-700" />
            Describe Your Symptoms
          </h2>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {symptomLength} characters
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Symptoms
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={onChange}
              rows={4}
              placeholder={`Example:\n• I have a headache and fever for 2 days\n• Chest pain when breathing\n• Stomach pain after eating`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="text-xs font-medium text-slate-600">
                Voice language
              </label>
              <select
                value={voiceLanguage}
                onChange={(event) => setVoiceLanguage(event.target.value)}
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                aria-label="Voice input language"
              >
                <option value="en-US">English</option>
                <option value="ta-IN">Tamil</option>
                <option value="si-LK">Sinhala</option>
              </select>
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={!isVoiceSupported}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                {isListening ? "Stop Voice Input" : "Start Voice Input"}
              </button>
              <p className="text-xs text-slate-500">
                {isVoiceSupported
                  ? "Speak naturally and your words will be typed automatically."
                  : "Voice input is not supported in this browser."}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              You can type your symptoms in English, Tamil, or Sinhala. Voice input currently works best in English.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={onChange}
              placeholder="Example: 2 days"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Severity
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">Select severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Age Group
            </label>
            <select
              name="ageGroup"
              value={formData.ageGroup}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">Select age group</option>
              <option value="child">Child</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </div>

        {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
        {pageError && (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {pageError}
          </p>
        )}
        {infoMessage && (
          <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {infoMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isAnalyzing}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 md:w-auto disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Sparkles size={16} className={isAnalyzing ? "animate-pulse" : ""} />
          {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
        </button>
      </form>

      {isAnalyzing && (
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-24 items-center justify-center">
            <div
              ref={lottieContainerRef}
              className={isLottieReady ? "h-14 w-24" : "hidden"}
              aria-label="Analyzing symptoms animation"
            />
            {!isLottieReady && (
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <HeartPulse size={28} className="animate-pulse text-cyan-700" aria-hidden="true" />
              </div>
            )}
            </div>
          <p className="text-base font-semibold text-cyan-900">Analyzing your symptoms...</p>
          <p className="mt-1 text-sm text-cyan-700">Please wait a moment.</p>
          <p className="mt-3 text-sm font-medium text-cyan-800">
            {analyzingMessages[analyzingMessageIndex]}
          </p>
        </div>
      )}

      {latestResult && (
        <Motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-800">Latest Analysis</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                urgencyClassMap[latestResult.urgency] || "bg-slate-100 text-slate-700"
              }`}
            >
              {urgencyLabelMap[latestResult.urgency] || "Unknown"} urgency
            </span>
          </div>

          {latestResult.isEmergency && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>
                This may require urgent attention. If symptoms are severe, seek emergency care immediately.
              </p>
            </div>
          )}

          <p className="mb-4 rounded-xl bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
            {urgencyMessageMap[latestResult.urgency] ||
              "Please consult a doctor if your symptoms continue or worsen."}
          </p>

          <p className="mb-4 text-sm text-slate-700">
            Based on what you shared, this may be a manageable condition with proper care. Here are simple and safe steps you can follow.
          </p>

          <div className="grid gap-3 text-sm text-slate-700">
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
              <p>
                <span className="font-semibold text-slate-800">Recommended Specialty:</span>{" "}
                {latestResult.recommendedSpecialty || "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p>
                <span className="font-semibold text-slate-800">Preliminary Suggestion:</span>{" "}
                {latestResult.preliminarySuggestion || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Home Care Tips:</p>
              {Array.isArray(latestResult.homeCareTips) && latestResult.homeCareTips.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {latestResult.homeCareTips.map((tip, index) => (
                    <li
                      key={`${latestResult._id}-tip-${index}`}
                      className="rounded-lg border border-slate-100 bg-white px-3 py-2"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-slate-500">No tips available.</p>
              )}
            </div>
            <p>
              <span className="font-semibold text-slate-800">When to Seek Help:</span>{" "}
              {latestResult.whenToSeekHelp || "N/A"}
            </p>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {latestResult.disclaimer ||
                "This is a preliminary AI-assisted suggestion and not a medical diagnosis."}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleViewDoctors}
              className="min-h-11 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Find a Doctor Near You
            </button>
            <button
              type="button"
              onClick={handleBookAppointment}
              className="min-h-11 rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              Book an Appointment
            </button>
            <button
              type="button"
              onClick={handleReadAloud}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Volume2 size={14} />
              Listen to This Advice
            </button>
            <button
              type="button"
              onClick={() => loadHistory()}
              disabled={isRefreshingHistory}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw size={14} />
              Refresh History
            </button>
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Trash2 size={14} />
              Delete All History
            </button>
          </div>
        </Motion.div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-800">Symptom History</h2>
          <button
            type="button"
            onClick={() => loadHistory()}
            disabled={isRefreshingHistory}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw size={14} />
            {isRefreshingHistory ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-600">
            No history yet. Try analyzing your symptoms above.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-cyan-100 hover:bg-cyan-50/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
                    <Stethoscope size={16} className="text-cyan-700" />
                    {item.recommendedSpecialty || "General Physician"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${
                        urgencyClassMap[item.urgency] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.urgency || "Unknown"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(item)}
                      disabled={deletingRecordId === item._id}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Delete symptom record from ${formatHistoryDateTime(
                        item.createdAt
                      )}`}
                      title="Delete this record"
                    >
                      <Trash2 size={12} />
                      {deletingRecordId === item._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.symptoms}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={13} />
                  {formatHistoryDateTime(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomCheckerPage;
