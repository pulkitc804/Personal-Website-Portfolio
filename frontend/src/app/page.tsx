import { ExperienceSection } from "@/components/ExperienceSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { NavBar } from "@/components/NavBar";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { loadPortfolioData } from "@/lib/fetch-portfolio";

export default async function Home() {
  const { profile, experience, projects, skills } = await loadPortfolioData();

  return (
    <div className="relative overflow-x-clip">
      <div
        className="pointer-events-none fixed inset-0 -z-10 grid-bg bg-grid-fade opacity-100"
        aria-hidden
      />
      <div
        className="bg-aurora pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(248,113,113,0.24),transparent_55%),radial-gradient(ellipse_55%_45%_at_85%_15%,rgba(253,164,175,0.18),transparent_50%),radial-gradient(ellipse_50%_40%_at_10%_60%,rgba(251,146,60,0.08),transparent_55%)]"
        aria-hidden
      />
      <div
        className="noise-overlay pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
        aria-hidden
      />
      <NavBar />
      <main>
        <Hero profile={profile} />
        <ExperienceSection items={experience} />
        <ProjectsSection items={projects} />
        <SkillsSection data={skills} />
      </main>
      <Footer profile={profile} />
    </div>
  );
}
