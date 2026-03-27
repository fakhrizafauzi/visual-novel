export const animationTemplates = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  },
  'slide-in-left': {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { type: 'spring', damping: 25, stiffness: 120 }
  },
  'slide-in-right': {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { type: 'spring', damping: 25, stiffness: 120 }
  },
  'zoom-in': {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.4 }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { type: 'spring', bounce: 0.5, duration: 0.8 }
  },
  shake: {
    animate: { 
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    }
  },
  idle: {
    animate: {
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  }
};

export type AnimationType = keyof typeof animationTemplates;
