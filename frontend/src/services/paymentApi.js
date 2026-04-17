import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments`;

export const initiatePayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_URL}/initiate`, paymentData, {
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

export const verifyPayment = async (paymentId) => {
  try {
    const response = await axios.post(
      `${API_URL}/verify`,
      { paymentId },
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

export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await axios.get(`${API_URL}/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentHistory = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/history`, {
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

export const refundPayment = async (paymentId, reason) => {
  try {
    const response = await axios.post(
      `${API_URL}/${paymentId}/refund`,
      { reason },
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

export const generateInvoice = async (paymentId) => {
  try {
    const response = await axios.get(`${API_URL}/${paymentId}/invoice`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllPaymentsAdmin = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/admin/all`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPatientPayments = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/patient/my`, {
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
