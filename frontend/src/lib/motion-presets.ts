/**
 * Shared motion tokens — fade-up reveals + easing similar to premium marketing sites.
 */
export const appleEase = [0.25, 0.1, 0.25, 1] as const;

/** Trigger slightly before the block is fully on-screen for a calmer reveal. */
export const scrollViewport = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -10% 0px",
} as const;

export const scrollTransition = {
  duration: 0.85,
  ease: appleEase,
} as const;

export const scrollTransitionFast = {
  duration: 0.65,
  ease: appleEase,
} as const;

export const fadeUpInitial = {
  opacity: 0,
  y: 36,
  filter: "blur(6px)",
} as const;

export const fadeUpAnimate = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
} as const;
