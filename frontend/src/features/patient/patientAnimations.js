/**
 * Patient Service Animation Variants
 * Centralized motion variants for consistency across the medical platform.
 */

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export const cardHover = {
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  tap: { scale: 0.98 }
};

export const alertVariants = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const floatIcon = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Colors for specific positive actions
export const THEME_COLORS = {
  healthBlue: "#38bdf8", // sky-400
  calmGreen: "#10b981",  // emerald-500
};
