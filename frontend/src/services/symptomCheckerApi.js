import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/symptom-checker`;

export const analyzeSymptoms = async (symptomsData) => {
  try {
    const response = await axios.post(`${API_URL}/analyze`, symptomsData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSymptomHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSymptomRecord = async (recordId) => {
  try {
    const response = await axios.delete(`${API_URL}/${recordId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
