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
    <div className="relative overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-10 grid-bg bg-grid-fade opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.15),transparent)]"
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
