import type { CardSpec } from "@/lib/deck";
import Card from "./cards/Card";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

export default function DeckSection({
  id,
  title,
  caption,
  cards,
  band = "court",
}: {
  id: string;
  title: string;
  caption: string;
  cards: CardSpec[];
  band?: "court" | "court-deep";
}) {
  const bg = band === "court-deep" ? "bg-court-deep" : "bg-court";
  return (
    <section id={id} className={`court-lines relative ${bg} text-chalk`} style={{ ["--sel" as string]: "#c8f135" }}>
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionHead title={title} caption={caption} dark />
        {/* one line: all cards on a single row, horizontal-scroll on small screens */}
        <div className="-mx-5 mt-12 flex snap-x gap-5 overflow-x-auto px-5 pb-3 lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cards.map((c, i) => (
            <Reveal key={c.id} delay={i * 70} className="shrink-0 snap-start">
              <Card spec={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
