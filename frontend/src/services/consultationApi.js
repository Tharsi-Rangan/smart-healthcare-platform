import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/consultations`;

export const createConsultation = async (consultationData) => {
  try {
    const response = await axios.post(API_URL, consultationData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getConsultations = async (filters = {}) => {
  try {
    const response = await axios.get(API_URL, {
      params: filters,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getConsultationById = async (consultationId) => {
  try {
    const response = await axios.get(`${API_URL}/${consultationId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateConsultation = async (consultationId, updates) => {
  try {
    const response = await axios.put(`${API_URL}/${consultationId}`, updates, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const startConsultationSession = async (consultationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/${consultationId}/start`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const endConsultationSession = async (consultationId) => {
  try {
    const response = await axios.post(
      `${API_URL}/${consultationId}/end`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addConsultationNotes = async (consultationId, notes) => {
  try {
    const response = await axios.post(
      `${API_URL}/${consultationId}/notes`,
      { notes },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Twilio Video Consultation APIs
export const getVideoAccessToken = async (appointmentId, roomName, userName) => {
  try {
    const response = await axios.post(
      `${API_URL}/video/token`,
      { appointmentId, roomName, userName },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createVideoRoom = async (appointmentId, roomName, maxDuration = 30) => {
  try {
    const response = await axios.post(
      `${API_URL}/video/room`,
      { appointmentId, roomName, maxDuration },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const endVideoSession = async (appointmentId) => {
  try {
    const response = await axios.post(
      `${API_URL}/video/end`,
      { appointmentId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getConsultationRecordings = async (consultationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${consultationId}/recordings`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data?.data?.recordings || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Aliases for VideoSessionPage compatibility
export const startConsultation = async (consultationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/start`,
      consultationData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const endConsultation = async (consultationId, notes = "") => {
  try {
    const response = await axios.patch(
      `${API_URL}/${consultationId}/end`,
      { notes },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createPrescription = async (prescriptionData) => {
  try {
    const PRESCRIPTION_API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions`;
    const response = await axios.post(
      PRESCRIPTION_API,
      prescriptionData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};
