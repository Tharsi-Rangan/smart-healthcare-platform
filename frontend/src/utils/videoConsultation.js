export const JOIN_EARLY_MINUTES = 30;
export const JOIN_LATE_MINUTES = 30;

export const getAppointmentId = (appointment) => appointment?._id || appointment?.id || "";

export const getParticipantName = (appointment, role) => {
  if (!appointment) {
    return role === "doctor" ? "Patient" : "Doctor";
  }

  if (role === "doctor") {
    return (
      appointment.patientDetails?.fullName ||
      appointment.patientName ||
      "Patient"
    );
  }

  return appointment.doctorName || "Doctor";
};

export const getAppointmentDateTime = (appointment) => {
  if (!appointment?.appointmentDate || !appointment?.appointmentTime) {
    return null;
  }

  const dateText = String(appointment.appointmentDate).slice(0, 10);
  const [year, month, day] = dateText.split("-").map(Number);
  const [hours, minutes] = String(appointment.appointmentTime).split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

export const getConsultationWindow = (appointment) => {
  const scheduledAt = getAppointmentDateTime(appointment);

  if (!scheduledAt) {
    return null;
  }

  return {
    scheduledAt,
    startsAt: new Date(scheduledAt.getTime() - JOIN_EARLY_MINUTES * 60000),
    endsAt: new Date(scheduledAt.getTime() + JOIN_LATE_MINUTES * 60000),
  };
};

export const getJoinState = (appointment, now = new Date()) => {
  if (!appointment) {
    return {
      canJoin: false,
      message: "Select a consultation to see join availability.",
    };
  }

  if (appointment.consultationType !== "online") {
    return {
      canJoin: false,
      message: "Only online consultations can be joined by video.",
    };
  }

  if (appointment.status !== "confirmed") {
    if (appointment.status === "completed") {
      return {
        canJoin: false,
        message: "This consultation is completed. You can still view the details here.",
      };
    }

    return {
      canJoin: false,
      message: "This consultation must be confirmed before the video room opens.",
    };
  }

  const window = getConsultationWindow(appointment);

  if (!window) {
    return {
      canJoin: false,
      message: "This consultation has an invalid date or time.",
    };
  }

  if (now < window.startsAt) {
    return {
      canJoin: false,
      message: `Video room opens ${JOIN_EARLY_MINUTES} minutes before the consultation.`,
    };
  }

  if (now > window.endsAt) {
    return {
      canJoin: false,
      message: "The video room window for this consultation has ended.",
    };
  }

  return {
    canJoin: true,
    message: "Video room is open for this consultation.",
  };
};

export const formatAppointmentDate = (appointment) => {
  const scheduledAt = getAppointmentDateTime(appointment);

  if (!scheduledAt) {
    return "Unknown date";
  }

  return scheduledAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatAppointmentDateTime = (appointment) => {
  const scheduledAt = getAppointmentDateTime(appointment);

  if (!scheduledAt) {
    return "Unknown time";
  }

  return scheduledAt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatWindowText = (appointment) => {
  const window = getConsultationWindow(appointment);

  if (!window) {
    return "Video room availability is unknown.";
  }

  const timeOptions = { hour: "numeric", minute: "2-digit" };

  return `Join from ${window.startsAt.toLocaleTimeString(undefined, timeOptions)} to ${window.endsAt.toLocaleTimeString(undefined, timeOptions)}.`;
};
