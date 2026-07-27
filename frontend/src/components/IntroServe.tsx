"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pop, resume } from "@/lib/sound";

/**
 * The cold open: a serve. The baseline draws across, the optic ball arcs in
 * and lands with a pock, the wordmark assembles, and the curtain lifts to the
 * hero. Plays ONCE per session (sessionStorage), skippable on any input, and
 * fully skipped under reduced-motion. A hard timeout guarantees it can never
 * strand the page behind the curtain. SSR renders the real hero underneath;
 * this only mounts client-side, so there is no layout shift.
 */
export default function IntroServe() {
  const [show, setShow] = useState<null | boolean>(null);
  const [lift, setLift] = useState(false);
  const dismissed = useRef(false);

  // decide on the client only (sessionStorage + reduced-motion aware)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let served = false;
    try {
      served = sessionStorage.getItem("served") === "1";
    } catch {
      served = false;
    }
    if (reduce || served) {
      setShow(false);
      return;
    }
    try {
      sessionStorage.setItem("served", "1");
    } catch {
      /* private mode: still play once */
    }
    setShow(true);
  }, []);

  // choreography clock + safety net
  useEffect(() => {
    if (show !== true) return;
    const dismiss = () => {
      if (dismissed.current) return;
      dismissed.current = true;
      setLift(true);
      window.setTimeout(() => setShow(false), 720);
    };
    // pock on the ball's landing
    const pockT = window.setTimeout(() => {
      resume();
      pop(0.6);
    }, 640);
    // natural lift after the wordmark settles
    const liftT = window.setTimeout(dismiss, 1500);
    // hard safety: never strand the page
    const safety = window.setTimeout(() => setShow(false), 2600);
    // skip on any intent
    const onSkip = () => dismiss();
    window.addEventListener("pointerdown", onSkip);
    window.addEventListener("keydown", onSkip);
    window.addEventListener("wheel", onSkip, { passive: true });
    window.addEventListener("touchstart", onSkip, { passive: true });
    return () => {
      window.clearTimeout(pockT);
      window.clearTimeout(liftT);
      window.clearTimeout(safety);
      window.removeEventListener("pointerdown", onSkip);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("wheel", onSkip);
      window.removeEventListener("touchstart", onSkip);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show === true && !lift && (
        <motion.div
          key="curtain"
          aria-hidden
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-court-deep"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* the baseline draws across */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-px bg-chalk/25"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
          />
          {/* a center service tick */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-clay/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          />

          {/* the serve: optic ball arcs in from the left and lands on the line */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-6 w-6 rounded-full"
            style={{
              marginLeft: -12,
              marginTop: -12,
              background:
                "radial-gradient(circle at 35% 32%, #f4ffb2 0%, #c8f135 48%, #93b515 100%)",
            }}
            initial={{ x: "-46vw", y: -12 }}
            animate={{
              x: [null, "-8vw", 0],
              y: [null, -150, 0],
              scaleY: [1, 1, 0.82, 1],
              scaleX: [1, 1, 1.18, 1],
            }}
            transition={{ duration: 0.66, ease: "easeIn", times: [0, 0.55, 0.9, 1] }}
          />

          {/* the wordmark assembles under the line */}
          <div className="absolute left-0 right-0 top-[calc(50%+2.5rem)] overflow-hidden text-center">
            <motion.p
              className="display text-[clamp(1.6rem,6vw,3rem)] uppercase tracking-tight text-chalk"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 0.66, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Pulkit Chaudhary
            </motion.p>
          </div>
          <div className="absolute left-0 right-0 top-[calc(50%-3.4rem)] overflow-hidden text-center">
            <motion.p
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-ball"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              first serve
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
