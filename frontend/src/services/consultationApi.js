import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/consultations`;

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
