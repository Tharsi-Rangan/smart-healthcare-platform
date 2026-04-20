import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Copy,
  Heart,
  HeartPulse,
  Info,
  Mic,
  MicOff,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import doctorAnimation from "../../assets/animations/Doctor.json";
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

const urgencyAccentMap = {
  High: "border-t-red-500",
  Medium: "border-t-amber-500",
  Low: "border-t-emerald-500",
};

const urgencyPanelMap = {
  High: "bg-red-50 text-red-800 border-red-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  Low: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const urgencyLabelMap = {
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

const urgencyMessageMap = {
  High:
    "Based on what you shared, this may need a closer check soon. Please seek medical help quickly.",
  Medium:
    "This may not be an emergency right now, but it is important to speak with a doctor soon.",
  Low:
    "This appears lower urgency at the moment. Keep monitoring and get support if symptoms continue.",
};

const analyzingMessages = [
  "Analyzing your symptoms...",
  "Preparing a helpful recommendation...",
  "Finding the right care path for you...",
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

const buildAdviceText = (record) => {
  if (!record) {
    return "";
  }

  return [
    `Recommended specialty: ${record.recommendedSpecialty || "General Physician"}.`,
    `Urgency level: ${record.urgency || "Unknown"}.`,
    record.preliminarySuggestion,
    Array.isArray(record.homeCareTips) && record.homeCareTips.length > 0
      ? `Home care tips: ${record.homeCareTips.join(". ")}.`
      : "",
    record.whenToSeekHelp,
    record.disclaimer,
  ]
    .filter(Boolean)
    .join(" ");
};

class AnimationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("Animation render failed, showing fallback:", error?.message || error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function SafeLottieAnimation({ animationData, className, fallback, ariaLabel }) {
  const [LottieComponent, setLottieComponent] = useState(null);
  const [failedToLoad, setFailedToLoad] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLottie = async () => {
      try {
        const module = await import("lottie-react");
        const candidate = module?.default || module?.Lottie;

        if (!isMounted) {
          return;
        }

        if (typeof candidate !== "function") {
          setFailedToLoad(true);
          return;
        }

        setLottieComponent(() => candidate);
      } catch (error) {
        if (isMounted) {
          console.warn("Unable to load lottie-react. Falling back to static animation.", error);
          setFailedToLoad(true);
        }
      }
    };

    loadLottie();

    return () => {
      isMounted = false;
    };
  }, []);

  if (failedToLoad || !LottieComponent) {
    return fallback;
  }

  return (
    <AnimationErrorBoundary fallback={fallback}>
      <LottieComponent
        animationData={animationData}
        loop
        autoplay
        className={className}
        aria-label={ariaLabel}
      />
    </AnimationErrorBoundary>
  );
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
  requireText = "",
  typedValue = "",
  onTypedValueChange,
  onConfirm,
  onClose,
  isLoading = false,
}) {
  if (!open) {
    return null;
  }

  const isConfirmDisabled =
    isLoading ||
    (requireText ? typedValue.trim() !== requireText.trim() : false);

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      >
        <Motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 id="confirm-modal-title" className="text-xl font-bold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{message}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
              aria-label="Close confirmation dialog"
            >
              <X size={18} />
            </button>
          </div>

          {requireText ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                To confirm, type <span className="font-bold">{requireText}</span> below.
              </p>
              <input
                type="text"
                value={typedValue}
                onChange={(event) => onTypedValueChange?.(event.target.value)}
                placeholder={`Type ${requireText}`}
                className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="min-h-11 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                danger ? "bg-red-600 hover:bg-red-500" : "bg-cyan-700 hover:bg-cyan-600"
              }`}
            >
              {isLoading ? "Please wait..." : confirmLabel}
            </button>
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}

function SymptomCheckerPage() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const baseSymptomsRef = useRef("");
  const utteranceRef = useRef(null);

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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [copiedAdvice, setCopiedAdvice] = useState(false);

  const [historySearch, setHistorySearch] = useState("");
  const [historyUrgencyFilter, setHistoryUrgencyFilter] = useState("All");
  const [selectedHistoryId, setSelectedHistoryId] = useState("");

  const [confirmState, setConfirmState] = useState({
    open: false,
    mode: "",
    record: null,
  });
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState("");

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setCopiedAdvice(false);
  }, [result]);

  const loadHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsRefreshingHistory(true);
    }

    try {
      const response = await getSymptomHistory();
      const normalized = normalizeHistory(response);
      setHistory(normalized);
      setPageError("");

      if (!selectedHistoryId && normalized[0]?._id) {
        setSelectedHistoryId(normalized[0]._id);
      }
    } catch (_error) {
      setPageError(_error?.response?.data?.message || "Failed to load symptom history");
    } finally {
      if (!silent) {
        setIsRefreshingHistory(false);
      }
    }
  }, [selectedHistoryId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const latestResult = useMemo(() => {
    if (result) {
      return result;
    }

    return history[0] || null;
  }, [result, history]);

  const symptomLength = formData.symptoms.trim().length;

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const searchValue = historySearch.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        [
          item.symptoms,
          item.recommendedSpecialty,
          item.urgency,
          item.preliminarySuggestion,
          item.whenToSeekHelp,
          item.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchValue);

      const matchesUrgency =
        historyUrgencyFilter === "All" || item.urgency === historyUrgencyFilter;

      return matchesSearch && matchesUrgency;
    });
  }, [history, historySearch, historyUrgencyFilter]);

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

  const stopSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsSpeechPaused(false);
  };

  const handleReadAloud = () => {
    if (!latestResult) {
      return;
    }

    if (typeof window === "undefined" || !window.speechSynthesis) {
      setPageError("Read aloud is not supported in this browser.");
      return;
    }

    setPageError("");

    if (isSpeaking && !isSpeechPaused) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
      return;
    }

    if (isSpeaking && isSpeechPaused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
      return;
    }

    const text = buildAdviceText(latestResult);

    if (!text) {
      setPageError("No advice is available to read aloud.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLanguage || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      setPageError("Unable to play the audio advice right now.");
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    setIsSpeaking(true);
    setIsSpeechPaused(false);
  };

  const handleCopyAdvice = async () => {
    if (!latestResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildAdviceText(latestResult));
      setCopiedAdvice(true);
      setInfoMessage("Advice copied to clipboard.");
      setTimeout(() => setCopiedAdvice(false), 1800);
    } catch {
      setPageError("Unable to copy the advice right now.");
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
    stopSpeech();

    try {
      const response = await analyzeSymptoms(payload);
      const record = response?.data || null;

      setResult(record);
      setSelectedHistoryId(record?._id || "");
      setInfoMessage("Symptoms analyzed successfully.");
      await loadHistory({ silent: true });
    } catch (error) {
      setPageError(error?.response?.data?.message || "Failed to analyze symptoms");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openDeleteRecordModal = (record) => {
    if (!record?._id) {
      return;
    }

    setConfirmState({
      open: true,
      mode: "single",
      record,
    });
  };

  const openDeleteAllModal = () => {
    setDeleteAllConfirmText("");
    setConfirmState({
      open: true,
      mode: "all",
      record: null,
    });
  };

  const closeConfirmModal = () => {
    if (deletingRecordId || isDeletingAll) {
      return;
    }

    setConfirmState({
      open: false,
      mode: "",
      record: null,
    });
    setDeleteAllConfirmText("");
  };

  const handleDeleteRecord = async () => {
    const record = confirmState.record;

    if (!record?._id) {
      return;
    }

    setDeletingRecordId(record._id);
    setPageError("");
    setInfoMessage("");

    try {
      await deleteSymptomById(record._id);

      const updatedHistory = history.filter((item) => item._id !== record._id);
      setHistory(updatedHistory);

      if (result?._id === record._id) {
        setResult(null);
      }

      if (selectedHistoryId === record._id) {
        setSelectedHistoryId(updatedHistory[0]?._id || "");
      }

      setInfoMessage("Symptom record deleted successfully.");
      closeConfirmModal();
      await loadHistory({ silent: true });
    } catch (error) {
      setPageError(error?.response?.data?.message || "Failed to delete this symptom record");
    } finally {
      setDeletingRecordId("");
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    setPageError("");
    setInfoMessage("");
    stopSpeech();

    try {
      await deleteSymptomHistory();
      setHistory([]);
      setResult(null);
      setSelectedHistoryId("");
      setInfoMessage("All symptom history deleted successfully.");
      closeConfirmModal();
    } catch (error) {
      setPageError(error?.response?.data?.message || "Failed to delete all symptom history");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleViewDoctors = () => {
    if (!latestResult?.recommendedSpecialty) {
      navigate("/doctors");
      return;
    }

    navigate(
      `/doctors?specialization=${encodeURIComponent(latestResult.recommendedSpecialty)}`
    );
  };

  const handleBookAppointment = () => {
    if (!latestResult?.recommendedSpecialty) {
      navigate("/doctors");
      return;
    }

    navigate(
      `/doctors?specialization=${encodeURIComponent(latestResult.recommendedSpecialty)}`
    );
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

  const handleSelectHistoryItem = (item) => {
    setResult(item);
    setSelectedHistoryId(item?._id || "");
    setInfoMessage("Loaded selected history record.");
    stopSpeech();
  };

  const singleDeleteRecord = confirmState.mode === "single" ? confirmState.record : null;
  const totalHistoryCount = history.length;

  return (
    <>
      <div className="space-y-8">
        <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-linear-to-r from-cyan-50 via-sky-50 to-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Symptom Checker</h1>
              <p className="mt-2 text-base font-medium text-slate-800">
                Tell us how you feel and get quick, safe guidance.
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Caring support for children, youth, and elders with easy-to-read guidance.
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

            <div className="hidden h-24 w-32 items-center justify-center rounded-xl border border-cyan-100 bg-white/80 md:flex">
              <SafeLottieAnimation
                animationData={doctorAnimation}
                className="h-20 w-28"
                ariaLabel="Doctor helper animation"
                fallback={
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50">
                    <Stethoscope size={24} className="text-cyan-700" aria-hidden="true" />
                  </div>
                }
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={onAnalyze}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
              <HeartPulse size={18} className="text-cyan-700" />
              Describe Your Symptoms
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {symptomLength} characters
              </p>
              {isListening ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  Listening...
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Symptoms</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={onChange}
                rows={4}
                placeholder={`Example:\n• I have a headache and fever for 2 days\n• Chest pain when breathing\n• Stomach pain after eating`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
              <p className="mt-2 text-sm font-medium text-slate-700">
                You can type or use your voice to describe how you feel.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="text-xs font-medium text-slate-600">Voice language</label>

                <select
                  value={voiceLanguage}
                  onChange={(event) => setVoiceLanguage(event.target.value)}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
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
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isListening
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                  }`}
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

              <p className="mt-2 text-xs text-slate-700">
                You can type your symptoms in English, Tamil, or Sinhala. Voice input currently
                works best in English.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={onChange}
                placeholder="Example: 2 days"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Age Group</label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select age group</option>
                <option value="child">Child</option>
                <option value="teen">Teen</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          {formError ? <p className="mt-3 text-sm text-red-600">{formError}</p> : null}

          {pageError ? (
            <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {pageError}
            </p>
          ) : null}

          {infoMessage ? (
            <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {infoMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isAnalyzing}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
          >
            <Sparkles size={16} className={isAnalyzing ? "animate-pulse" : ""} />
            {isAnalyzing ? "Analyzing..." : "Analyze Symptoms"}
          </button>
        </form>

        {isAnalyzing ? (
          <div className="rounded-2xl border border-cyan-100 bg-white p-6 text-center shadow-sm ring-1 ring-cyan-100/70">
            <div className="mx-auto mb-3 flex h-20 w-28 items-center justify-center">
              <SafeLottieAnimation
                animationData={heartbeatAnalysisAnimation}
                className="h-20 w-28"
                ariaLabel="Analyzing symptoms animation"
                fallback={
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 shadow-sm">
                    <HeartPulse
                      size={28}
                      className="animate-pulse text-cyan-700"
                      aria-hidden="true"
                    />
                  </div>
                }
              />
            </div>
            <p className="text-base font-semibold text-cyan-900">Analyzing your symptoms...</p>
            <p className="mt-1 text-sm text-slate-700">Preparing a helpful recommendation for you.</p>
            <p className="mt-3 text-sm font-medium text-cyan-800" aria-live="polite">
              {analyzingMessages[analyzingMessageIndex]}
            </p>
          </div>
        ) : null}

        {latestResult ? (
          <Motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`rounded-2xl border border-slate-200 border-t-4 bg-white p-6 shadow-sm ${
              urgencyAccentMap[latestResult.urgency] || "border-t-cyan-500"
            }`}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Health Guidance</h2>
                <p className="mt-1 text-sm text-slate-700">
                  Based on what you shared, here is a simple and safe recommendation.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  urgencyClassMap[latestResult.urgency] || "bg-slate-100 text-slate-700"
                }`}
              >
                {urgencyLabelMap[latestResult.urgency] || "Unknown"} urgency
              </span>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-800">
                  Recommended Specialty
                </p>
                <p className="mt-1 inline-flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Stethoscope size={18} className="text-cyan-700" />
                  {latestResult.recommendedSpecialty || "General Physician"}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  urgencyPanelMap[latestResult.urgency] ||
                  "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide">Urgency Level</p>
                <p className="mt-1 text-lg font-bold">
                  {urgencyLabelMap[latestResult.urgency] || "Unknown"}
                </p>
                <p className="mt-2 text-sm font-medium">
                  {urgencyMessageMap[latestResult.urgency]}
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Preliminary Suggestion
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                {latestResult.preliminarySuggestion ||
                  "We could not generate a suggestion right now. Please consult a doctor."}
              </p>
            </div>

            {latestResult.isEmergency ? (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p>
                  This may be serious. Please seek medical help immediately, especially if symptoms
                  are getting worse.
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 text-sm text-slate-700">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="inline-flex items-center gap-2 font-semibold text-emerald-900">
                  <Heart size={16} className="text-emerald-700" />
                  Home Care Tips
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Here are a few simple steps that may help for now.
                </p>

                {Array.isArray(latestResult.homeCareTips) && latestResult.homeCareTips.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {latestResult.homeCareTips.map((tip, index) => (
                      <li
                        key={`${latestResult._id || "result"}-tip-${index}`}
                        className="inline-flex w-full items-start gap-2 rounded-lg border border-emerald-100 bg-white px-3 py-2"
                      >
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-slate-500">No tips available.</p>
                )}
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                <p className="inline-flex items-center gap-2 font-semibold text-amber-900">
                  <ShieldCheck size={16} className="text-amber-700" />
                  When to Seek Help
                </p>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">
                  {latestResult.whenToSeekHelp ||
                    "If symptoms get worse, please seek medical help quickly."}
                </p>
              </div>

              <p className="inline-flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <Info size={14} className="mt-0.5 shrink-0 text-slate-500" />
                {latestResult.disclaimer ||
                  "This is a preliminary AI-assisted suggestion and not a medical diagnosis."}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleViewDoctors}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600"
              >
                View Recommended Doctors
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={handleBookAppointment}
                className="min-h-11 rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
              >
                Book Appointment
              </button>

              <button
                type="button"
                onClick={handleReadAloud}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {isSpeaking ? (
                  isSpeechPaused ? (
                    <Play size={14} />
                  ) : (
                    <Pause size={14} />
                  )
                ) : (
                  <Volume2 size={14} />
                )}
                {isSpeaking ? (isSpeechPaused ? "Resume Audio" : "Pause Audio") : "Listen to This Advice"}
              </button>

              <button
                type="button"
                onClick={stopSpeech}
                disabled={!isSpeaking}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Square size={14} />
                Stop Audio
              </button>

              <button
                type="button"
                onClick={handleCopyAdvice}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {copiedAdvice ? <Clipboard size={14} /> : <Copy size={14} />}
                {copiedAdvice ? "Copied" : "Copy Advice"}
              </button>

              <button
                type="button"
                onClick={() => loadHistory()}
                disabled={isRefreshingHistory}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw size={14} className={isRefreshingHistory ? "animate-spin" : ""} />
                Refresh History
              </button>
            </div>
          </Motion.div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Symptom History</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review previous records, search them, and reopen any result.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadHistory()}
                disabled={isRefreshingHistory}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw size={14} className={isRefreshingHistory ? "animate-spin" : ""} />
                {isRefreshingHistory ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={openDeleteAllModal}
                disabled={totalHistoryCount === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                title="Delete all symptom history"
              >
                <Trash2 size={14} />
                Delete All History
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search by symptom, specialty, urgency..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <select
              value={historyUrgencyFilter}
              onChange={(event) => setHistoryUrgencyFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="All">All urgencies</option>
              <option value="High">High only</option>
              <option value="Medium">Medium only</option>
              <option value="Low">Low only</option>
            </select>
          </div>

          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50">
                <Clipboard size={22} className="text-cyan-700" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No history yet</p>
              <p className="mt-1 text-sm text-slate-600">
                Try analyzing your symptoms above to create your first record.
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
              <p className="text-sm font-semibold text-slate-800">No matching records found</p>
              <p className="mt-1 text-sm text-slate-600">
                Try changing your search text or urgency filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => {
                const isSelected = selectedHistoryId === item._id;

                return (
                  <Motion.div
                    key={item._id}
                    layout
                    onClick={() => handleSelectHistoryItem(item)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? "border-cyan-300 bg-cyan-50/70 shadow-sm ring-1 ring-cyan-100"
                        : "border-slate-200 bg-slate-50/70 hover:border-cyan-100 hover:bg-cyan-50/30"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
                        <Stethoscope size={16} className="text-cyan-700" />
                        {item.recommendedSpecialty || "General Physician"}
                      </p>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
                            urgencyClassMap[item.urgency] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.urgency || "Unknown"}
                        </span>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDeleteRecordModal(item);
                          }}
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

                    <p className="mt-2 line-clamp-3 text-sm text-slate-700">{item.symptoms}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <p className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {formatHistoryDateTime(item.createdAt)}
                      </p>
                      <p className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                        Source: {item.source || "rule-based"}
                      </p>
                      {isSelected ? (
                        <p className="rounded-full bg-cyan-100 px-2 py-1 font-semibold text-cyan-700">
                          Currently previewing
                        </p>
                      ) : null}
                    </div>

                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={13} />
                      Record ID: {item._id}
                    </p>
                  </Motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmState.open && confirmState.mode === "single"}
        title="Delete this symptom record?"
        message={`This record from ${
          singleDeleteRecord?.createdAt
            ? formatHistoryDateTime(singleDeleteRecord.createdAt)
            : "your history"
        } will be removed permanently.`}
        confirmLabel="Delete Record"
        danger
        isLoading={deletingRecordId === singleDeleteRecord?._id}
        onConfirm={handleDeleteRecord}
        onClose={closeConfirmModal}
      />

      <ConfirmModal
        open={confirmState.open && confirmState.mode === "all"}
        title="Delete all symptom history?"
        message={`You are about to permanently remove ${totalHistoryCount} history record${
          totalHistoryCount === 1 ? "" : "s"
        }. This action cannot be undone.`}
        confirmLabel="Delete Everything"
        danger
        requireText="DELETE"
        typedValue={deleteAllConfirmText}
        onTypedValueChange={setDeleteAllConfirmText}
        isLoading={isDeletingAll}
        onConfirm={handleDeleteAll}
        onClose={closeConfirmModal}
      />
    </>
  );
}

export default SymptomCheckerPage;