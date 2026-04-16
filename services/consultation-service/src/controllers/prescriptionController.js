import Prescription from '../models/Prescription.js';

// POST /api/prescriptions — doctor issues
export const createPrescription = async (req, res) => {
  try {
    const {
      consultationId, appointmentId, patientId, patientName,
      doctorName, specialization, diagnosis, medications, notes,
    } = req.body;

    const rx = await Prescription.create({
      consultationId: consultationId || '',
      appointmentId,
      patientId,
      patientName,
      doctorId:   req.user.userId,
      doctorName,
      specialization: specialization || '',
      diagnosis,
      medications,
      notes: notes || '',
    });

    res.status(201).json({ success: true, message: 'Prescription issued.', data: { prescription: rx } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/prescriptions/patient — patient's prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rxs = await Prescription.find({ patientId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { prescriptions: rxs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/prescriptions/doctor — doctor's issued prescriptions
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const rxs = await Prescription.find({ doctorId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { prescriptions: rxs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res) => {
  try {
    const rx = await Prescription.findById(req.params.id);
    if (!rx) return res.status(404).json({ success: false, message: 'Prescription not found.' });
    res.status(200).json({ success: true, data: { prescription: rx } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN ONLY - Migrate prescriptions from one patient ID to another
export const migratePrescriptions = async (req, res) => {
  try {
    const { fromPatientId, toPatientId } = req.body;

    if (!fromPatientId || !toPatientId) {
      return res.status(400).json({
        success: false,
        message: 'fromPatientId and toPatientId are required',
      });
    }

    const result = await Prescription.updateMany(
      { patientId: fromPatientId },
      { patientId: toPatientId }
    );

    res.status(200).json({
      success: true,
      message: `Migrated ${result.modifiedCount} prescriptions`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
