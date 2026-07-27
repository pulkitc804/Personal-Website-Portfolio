"use client";

/**
 * ServeTerminal: the contact section as a developer terminal sitting on the
 * court baseline. The form is a CLI session; submitting "serves" the message,
 * streams a fake-but-honest HTTP response, then opens the visitor's mail app.
 * Fully client-side: this static site has no backend and the copy says so.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pop, resume } from "@/lib/sound";
import Reveal from "./Reveal";

type Props = {
  email: string;
  linkedinUrl: string;
  githubUrl: string;
};

type Phase = "idle" | "streaming" | "sent";

const CHAR_MS = 24;
const MAILTO_DELAY_MS = 600;

/** Round to 2 decimals so any computed coordinate is deterministic. */
const r2 = (n: number) => Math.round(n * 100) / 100;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const promptCls =
  "shrink-0 select-none whitespace-nowrap font-mono text-[13px] sm:text-sm";
const inputCls =
  "min-w-0 flex-1 border-b border-chalk/15 bg-transparent pb-1 font-mono " +
  "text-[13px] text-chalk caret-ball outline-none transition-colors " +
  "placeholder:text-chalk/30 focus:border-ball sm:text-sm";
const pillCls =
  "inline-flex items-center gap-2.5 rounded-full border border-chalk/30 " +
  "px-5 py-2.5 font-mono text-sm text-chalk/90 transition-colors " +
  "hover:border-chalk hover:text-chalk focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ball focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-court-deep";

function Prompt({ flag }: { flag: string }) {
  return (
    <span aria-hidden="true" className={promptCls}>
      <span className="text-chalk/40">$ </span>
      <span className="text-chalk/70">serve </span>
      <span className="text-ball/80">{flag}</span>
    </span>
  );
}

export default function ServeTerminal({ email, linkedinUrl, githubUrl }: Props) {
  const reducedMotion = useReducedMotion() ?? false;

  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ replyTo?: string; message?: string }>(
    {}
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(
    null
  );
  // Screen-reader mirror of the streamed output, appended line by line so the
  // live region announces whole lines instead of every character.
  const [srLines, setSrLines] = useState<string[]>([]);

  const preRef = useRef<HTMLPreElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const replyToRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  // One bag for every timer/interval id so unmount cleanup is a single sweep.
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
    };
  }, []);

  /** Stream `lines` into the output pre (ref mutation, no per-tick state). */
  function stream(lines: string[], after: () => void) {
    const node = preRef.current;
    const full = lines.join("\n");
    const finish = () => {
      setPhase("sent");
      timersRef.current.push(window.setTimeout(after, MAILTO_DELAY_MS));
    };

    if (reducedMotion || !node) {
      if (node) node.textContent = full;
      setSrLines(lines);
      finish();
      return;
    }

    node.textContent = "";
    let i = 0;
    let lineIdx = 0;
    const id = window.setInterval(() => {
      i += 1;
      node.textContent = full.slice(0, i);
      if (i >= full.length || full[i] === "\n") {
        const done = lines[lineIdx];
        lineIdx += 1;
        setSrLines((prev) => [...prev, done]);
      }
      if (i >= full.length) {
        window.clearInterval(id);
        finish();
      }
    }, CHAR_MS);
    timersRef.current.push(id);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase === "streaming") return;

    const rt = replyTo.trim();
    const msg = message.trim();
    const nextErrors: { replyTo?: string; message?: string } = {};
    if (!rt) nextErrors.replyTo = "error: --reply-to needs an address";
    else if (!EMAIL_RE.test(rt))
      nextErrors.replyTo = "error: --reply-to is not a valid address";
    if (!msg) nextErrors.message = "error: --message is empty, nothing to serve";
    setErrors(nextErrors);
    if (nextErrors.replyTo) {
      replyToRef.current?.focus();
      return;
    }
    if (nextErrors.message) {
      messageRef.current?.focus();
      return;
    }

    resume();
    pop(0.85);

    if (!reducedMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setRipple({
        x: r2(rect.left + rect.width / 2),
        y: r2(rect.top + rect.height / 2),
        key: Date.now(),
      });
      timersRef.current.push(window.setTimeout(() => setRipple(null), 950));
    }

    const from = name.trim() || "anonymous";
    const lines = [
      "POST /rally HTTP/1.1",
      "host: courtside.pulkit.dev",
      "201 Created",
      `{ "status": "serve received", "from": "${from}", "return": "expected within 24h" }`,
    ];
    const href = `mailto:${email}?subject=${encodeURIComponent(
      `Serve from ${from}`
    )}&body=${encodeURIComponent(`${msg}\n\nreply-to: ${rt}`)}`;

    setSrLines([]);
    setPhase("streaming");
    stream(lines, () => {
      window.location.href = href;
    });
  }

  return (
    <section
      id="contact"
      className="relative bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      {/* The baseline: one chalk boundary line with a center-service tick,
          painted across the section so the terminal sits on it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-36 hidden lg:block"
      >
        <div className="h-px w-full bg-chalk/20" />
        <div className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-chalk/20" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <Reveal className="mb-10">
          <h2 className="display flex items-center gap-3 text-[clamp(2rem,5vw,3.25rem)] uppercase">
            Your serve.
            <span
              className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-ball"
              aria-hidden="true"
            />
          </h2>
          <p className="mt-3 max-w-[58ch] text-base text-chalk/75">
            Hiring, building something hard, or down for a game? Put a serve on
            the line.
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* Terminal window */}
          <Reveal>
            <div className="w-full rounded-lg border border-chalk/15 bg-[#04120f] shadow-none">
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-chalk/10 px-4 py-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-chalk/20" />
                </span>
                <span className="ml-2 truncate font-mono text-xs text-chalk/50">
                  pulkit@courtside: ~/serve
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <form noValidate onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                      <Prompt flag="--from" />
                      <span className="sr-only">Your name</span>
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        placeholder="your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                      <Prompt flag="--reply-to" />
                      <span className="sr-only">
                        Your email address, required
                      </span>
                      <input
                        ref={replyToRef}
                        type="email"
                        name="reply-to"
                        autoComplete="email"
                        placeholder="you@company.com"
                        required
                        aria-required="true"
                        aria-invalid={errors.replyTo ? true : undefined}
                        aria-describedby={
                          errors.replyTo ? "serve-err-reply-to" : undefined
                        }
                        value={replyTo}
                        onChange={(e) => setReplyTo(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                    {errors.replyTo && (
                      <p
                        id="serve-err-reply-to"
                        className="mt-1.5 font-mono text-xs text-clay"
                      >
                        {errors.replyTo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex flex-col gap-1.5">
                      <Prompt flag="--message" />
                      <span className="sr-only">Your message, required</span>
                      <textarea
                        ref={messageRef}
                        name="message"
                        rows={3}
                        placeholder="Schedule interview"
                        required
                        aria-required="true"
                        aria-invalid={errors.message ? true : undefined}
                        aria-describedby={
                          errors.message ? "serve-err-message" : undefined
                        }
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`${inputCls} resize-y leading-relaxed`}
                      />
                    </label>
                    {errors.message && (
                      <p
                        id="serve-err-message"
                        className="mt-1.5 font-mono text-xs text-clay"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      ref={buttonRef}
                      type="submit"
                      disabled={phase === "streaming"}
                      className="rounded-full bg-ball px-6 py-2.5 font-mono text-sm
                        font-semibold text-ink transition-transform
                        hover:-translate-y-0.5 active:translate-y-0
                        disabled:cursor-wait disabled:opacity-70
                        focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-chalk focus-visible:ring-offset-2
                        focus-visible:ring-offset-[#04120f]
                        motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      serve it
                    </button>
                    <p className="mt-3 font-mono text-[11px] leading-relaxed text-chalk/40">
                      runs client-side, then opens your mail app: this site has
                      no backend and says so
                    </p>
                  </div>
                </form>

                {/* Streamed response. The visible pre is typed imperatively
                    (ref mutation); the live region announces completed lines. */}
                <div
                  aria-live="polite"
                  className={
                    phase === "idle"
                      ? ""
                      : "mt-6 border-t border-chalk/10 pt-4"
                  }
                >
                  <pre
                    ref={preRef}
                    aria-hidden="true"
                    className="inline whitespace-pre-wrap break-words font-mono
                      text-[13px] leading-relaxed text-chalk/80 sm:text-sm"
                  />
                  {phase === "streaming" && (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-pulse bg-ball/80"
                    />
                  )}
                  <div className="sr-only">
                    {srLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Direct lines */}
          <Reveal delay={120} className="lg:pt-1">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-chalk/50">
              direct lines
            </h3>
            <ul className="mt-4 flex flex-col items-start gap-3">
              <li>
                <a href={`mailto:${email}`} className={pillCls}>
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-ball/70"
                    aria-hidden="true"
                  />
                  <span className="break-all">{email}</span>
                </a>
              </li>
              <li>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillCls}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-ball/70"
                    aria-hidden="true"
                  />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillCls}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-ball/70"
                    aria-hidden="true"
                  />
                  GitHub
                </a>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>

      {/* Serve ripple: one chalk ring expanding from the button. */}
      {ripple && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50"
        >
          <motion.span
            key={ripple.key}
            className="absolute rounded-full border-2 border-chalk"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 280,
              height: 280,
              marginLeft: -140,
              marginTop: -140,
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
      )}
    </section>
  );
}
