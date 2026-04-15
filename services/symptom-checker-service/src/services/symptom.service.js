import axios from "axios";
import { env } from "../config/env.js";
import { SymptomCheck } from "../models/symptomCheck.model.js";
import { AppError } from "../utils/appError.js";

const ALLOWED_SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "General Physician",
  "Orthopedics",
  "ENT",
  "Psychiatry",
  "Gynecology",
];

const DISCLAIMER =
  "This is a preliminary AI-assisted suggestion and not a medical diagnosis.";

const buildRuleBasedAnalysis = ({ symptoms }) => {
  const normalized = String(symptoms || "").toLowerCase();

  if (
    normalized.includes("chest") ||
    normalized.includes("heart") ||
    normalized.includes("palpitation") ||
    normalized.includes("shortness of breath")
  ) {
    return {
      recommendedSpecialty: "Cardiology",
      urgency: "High",
      preliminarySuggestion:
        "Your symptoms may be related to a heart-related condition and should be checked by a specialist.",
      homeCareTips: [
        "Rest and avoid physical activity until you are evaluated.",
        "Try to stay calm and breathe slowly.",
        "Avoid heavy meals, stress, and smoking.",
      ],
      whenToSeekHelp:
        "If you have severe chest pain, difficulty breathing, sweating, dizziness, or worsening symptoms, seek emergency medical attention immediately.",
      isEmergency: true,
      source: "rule-based",
      apiRawResponse: null,
    };
  }

  if (
    normalized.includes("skin") ||
    normalized.includes("rash") ||
    normalized.includes("itch") ||
    normalized.includes("acne")
  ) {
    return {
      recommendedSpecialty: "Dermatology",
      urgency: "Medium",
      preliminarySuggestion:
        "Your symptoms may be related to a skin condition. A dermatologist can help evaluate this properly.",
      homeCareTips: [
        "Keep the affected skin area clean and dry.",
        "Avoid scratching the area.",
        "Avoid using new cosmetic or skin products until reviewed.",
      ],
      whenToSeekHelp:
        "Seek medical help sooner if the rash spreads quickly, becomes painful, or is associated with fever.",
      isEmergency: false,
      source: "rule-based",
      apiRawResponse: null,
    };
  }

  if (
    normalized.includes("child") ||
    normalized.includes("baby") ||
    normalized.includes("infant")
  ) {
    return {
      recommendedSpecialty: "Pediatrics",
      urgency: "Medium",
      preliminarySuggestion:
        "These symptoms may be better evaluated by a pediatric specialist.",
      homeCareTips: [
        "Ensure the child stays hydrated.",
        "Monitor temperature and general activity level.",
        "Avoid self-medicating without guidance.",
      ],
      whenToSeekHelp:
        "Seek urgent care if the child has breathing difficulty, persistent fever, lethargy, or dehydration signs.",
      isEmergency: false,
      source: "rule-based",
      apiRawResponse: null,
    };
  }

  if (
    normalized.includes("headache") ||
    normalized.includes("migraine") ||
    normalized.includes("dizziness")
  ) {
    return {
      recommendedSpecialty: "Neurology",
      urgency: "Medium",
      preliminarySuggestion:
        "These symptoms may need further evaluation, especially if they are frequent or severe.",
      homeCareTips: [
        "Rest in a quiet and calm environment.",
        "Drink enough water and avoid skipping meals.",
        "Reduce screen time and avoid bright light if it worsens symptoms.",
      ],
      whenToSeekHelp:
        "Seek medical help urgently if you have sudden severe headache, fainting, weakness, confusion, or vision changes.",
      isEmergency: false,
      source: "rule-based",
      apiRawResponse: null,
    };
  }

  if (
    normalized.includes("ear") ||
    normalized.includes("nose") ||
    normalized.includes("throat") ||
    normalized.includes("sinus")
  ) {
    return {
      recommendedSpecialty: "ENT",
      urgency: "Medium",
      preliminarySuggestion:
        "These symptoms may be related to an ear, nose, or throat condition.",
      homeCareTips: [
        "Rest and drink enough fluids.",
        "Avoid very cold drinks if throat irritation is present.",
        "Avoid dust or smoke exposure if symptoms worsen.",
      ],
      whenToSeekHelp:
        "Seek medical help if symptoms persist, worsen, or are associated with high fever or breathing discomfort.",
      isEmergency: false,
      source: "rule-based",
      apiRawResponse: null,
    };
  }

  if (
    normalized.includes("bone") ||
    normalized.includes("joint") ||
    normalized.includes("back pain") ||
    normalized.includes("knee")
  ) {
    return {
      recommendedSpecialty: "Orthopedics",
      urgency: "Medium",
      preliminarySuggestion:
        "Your symptoms may need evaluation by an orthopedic specialist.",
      homeCareTips: [
        "Rest the affected area if possible.",
        "Avoid lifting heavy objects or sudden strain.",
        "Use gentle support or posture correction if needed.",
      ],
      whenToSeekHelp:
        "Seek medical help sooner if pain is severe, swelling increases, or movement becomes difficult.",
      isEmergency: false,
      source: "rule-based",
      apiRawResponse: null,
    };
  }

  return {
    recommendedSpecialty: "General Physician",
    urgency: "Low",
    preliminarySuggestion:
      "A general physician can help with an initial evaluation and guide you to the right next step.",
    homeCareTips: [
      "Get enough rest and drink water.",
      "Monitor your symptoms for any worsening.",
      "Avoid self-medicating unnecessarily.",
    ],
    whenToSeekHelp:
      "Seek medical help if symptoms become severe, last longer than expected, or interfere with daily activities.",
    isEmergency: false,
    source: "rule-based",
    apiRawResponse: null,
  };
};

const extractGeminiText = (responseData) => {
  return (
    responseData?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
};

const parseGeminiJson = (text) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};

const normalizeSpecialty = (specialty, symptoms = "") => {
  const raw = String(specialty || "").trim();

  if (ALLOWED_SPECIALTIES.includes(raw)) {
    return raw;
  }

  const normalizedSymptoms = String(symptoms || "").toLowerCase();
  const lower = raw.toLowerCase();

  if (
    lower.includes("emergency") ||
    lower.includes("critical") ||
    lower.includes("urgent")
  ) {
    if (
      normalizedSymptoms.includes("chest") ||
      normalizedSymptoms.includes("heart") ||
      normalizedSymptoms.includes("shortness of breath")
    ) {
      return "Cardiology";
    }
    return "General Physician";
  }

  if (lower.includes("cardio") || lower.includes("heart")) return "Cardiology";
  if (lower.includes("derma") || lower.includes("skin")) return "Dermatology";
  if (lower.includes("pedia") || lower.includes("child")) return "Pediatrics";
  if (lower.includes("neuro") || lower.includes("brain")) return "Neurology";
  if (lower.includes("ortho") || lower.includes("bone") || lower.includes("joint")) {
    return "Orthopedics";
  }
  if (lower.includes("ent") || lower.includes("ear") || lower.includes("nose")) {
    return "ENT";
  }
  if (lower.includes("psych")) return "Psychiatry";
  if (lower.includes("gyn") || lower.includes("obst")) return "Gynecology";

  return "General Physician";
};

const buildPrompt = ({ symptoms, duration, severity, ageGroup }) => {
  return `
You are an AI-assisted healthcare triage helper for a university project.

Rules:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanation outside JSON
- This is NOT a diagnosis
- Recommend exactly one doctor specialty
- Urgency must be exactly one of: Low, Medium, High
- recommendedSpecialty must be chosen ONLY from this list:
  Cardiology, Dermatology, Pediatrics, Neurology, General Physician, Orthopedics, ENT, Psychiatry, Gynecology
- Keep language kind, simple, and user-friendly
- Do NOT prescribe medicines or dosage
- Give only safe, general home care tips
- If symptoms seem severe or emergency-related, mention emergency help clearly in whenToSeekHelp

Patient Input:
Symptoms: ${symptoms}
Duration: ${duration || "Not provided"}
Severity: ${severity || "Not provided"}
Age Group: ${ageGroup || "Not provided"}

Return JSON in this exact structure:
{
  "recommendedSpecialty": "string",
  "urgency": "Low | Medium | High",
  "preliminarySuggestion": "short and kind explanation",
  "homeCareTips": ["tip1", "tip2", "tip3"],
  "whenToSeekHelp": "string",
  "isEmergency": true,
  "disclaimer": "${DISCLAIMER}"
}
`;
};

const analyzeWithGemini = async (payload) => {
  if (!env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: buildPrompt(payload),
          },
        ],
      },
    ],
  };

  const response = await axios.post(url, requestBody, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 20000,
  });

  const text = extractGeminiText(response.data);

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = parseGeminiJson(text);

  return {
    recommendedSpecialty: normalizeSpecialty(
      parsed.recommendedSpecialty,
      payload.symptoms
    ),
    urgency: ["Low", "Medium", "High"].includes(parsed.urgency)
      ? parsed.urgency
      : "Low",
    preliminarySuggestion:
      parsed.preliminarySuggestion ||
      "A doctor can help evaluate your symptoms and guide you properly.",
    homeCareTips: Array.isArray(parsed.homeCareTips)
      ? parsed.homeCareTips.slice(0, 3)
      : [],
    whenToSeekHelp:
      parsed.whenToSeekHelp ||
      "Please seek medical help if symptoms become severe or worsen.",
    isEmergency: Boolean(parsed.isEmergency),
    disclaimer: parsed.disclaimer || DISCLAIMER,
    source: "gemini",
    apiRawResponse: response.data,
  };
};

const buildClientResponse = (savedRecord, disclaimer) => {
  return {
    _id: savedRecord._id,
    userId: savedRecord.userId,
    symptoms: savedRecord.symptoms,
    duration: savedRecord.duration,
    severity: savedRecord.severity,
    ageGroup: savedRecord.ageGroup,
    recommendedSpecialty: savedRecord.recommendedSpecialty,
    urgency: savedRecord.urgency,
    preliminarySuggestion: savedRecord.preliminarySuggestion,
    homeCareTips: savedRecord.homeCareTips || [],
    whenToSeekHelp: savedRecord.whenToSeekHelp || "",
    isEmergency: savedRecord.isEmergency || false,
    source: savedRecord.source,
    createdAt: savedRecord.createdAt,
    updatedAt: savedRecord.updatedAt,
    disclaimer,
  };
};

export const analyzeSymptoms = async (payload, userId) => {
  let analysis;

  try {
    analysis = await analyzeWithGemini(payload);
  } catch (error) {
    const fallback = buildRuleBasedAnalysis(payload);
    analysis = {
      ...fallback,
      disclaimer: DISCLAIMER,
      apiRawResponse: {
        geminiError: error.message,
      },
    };
  }

  const savedRecord = await SymptomCheck.create({
    userId,
    symptoms: payload.symptoms,
    duration: payload.duration || "",
    severity: payload.severity || "",
    ageGroup: payload.ageGroup || "",
    recommendedSpecialty: analysis.recommendedSpecialty,
    urgency: analysis.urgency,
    preliminarySuggestion: analysis.preliminarySuggestion,
    homeCareTips: analysis.homeCareTips || [],
    whenToSeekHelp: analysis.whenToSeekHelp || "",
    isEmergency: analysis.isEmergency || false,
    source: analysis.source,
    apiRawResponse: analysis.apiRawResponse,
  });

  return buildClientResponse(savedRecord, analysis.disclaimer || DISCLAIMER);
};

export const deleteSymptomHistory = async (userId) => {
  await SymptomCheck.deleteMany({ userId });
  return true;
};

export const deleteSymptomById = async (id, userId) => {
  const record = await SymptomCheck.findById(id);

  if (!record) {
    throw new AppError("Symptom record not found", 404);
  }

  if (String(record.userId) !== String(userId)) {
    throw new AppError("Unauthorized", 403);
  }

  await record.deleteOne();

  return true;
};

export const getSymptomHistory = async (userId) => {
  const history = await SymptomCheck.find({ userId }).sort({ createdAt: -1 });
  return history.map((item) => buildClientResponse(item, DISCLAIMER));
};