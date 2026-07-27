import type { Profile } from "@/lib/types";

/**
 * Closing bar only: the contact section itself is ServeTerminal (#contact).
 */
export default function Footer({ profile }: { profile: Profile }) {
  return (
    <footer
      className="bg-court-deep text-chalk"
      style={{ ["--sel" as string]: "#c8f135" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 border-t border-chalk/15 px-5 py-6 text-sm text-chalk/50 sm:flex-row sm:items-center">
        <span>© {profile.name}</span>
        <span>Built with Next.js · Court side ●</span>
      </div>
    </footer>
  );
}
