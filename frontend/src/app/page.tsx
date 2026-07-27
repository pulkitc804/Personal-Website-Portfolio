import NavBar from "@/components/NavBar";
import SideRail from "@/components/SideRail";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import RallyTimeline from "@/components/RallyTimeline";
import SkillRally from "@/components/SkillRally";
import TournamentBracket from "@/components/TournamentBracket";
import LiveLab from "@/components/LiveLab";
import CourtAnalytics from "@/components/CourtAnalytics";
import TrophyCase from "@/components/TrophyCase";
import ServeTerminal from "@/components/ServeTerminal";
import Footer from "@/components/Footer";
import ScrollBall from "@/components/ScrollBall";
import { loadPortfolioData } from "@/lib/portfolio-data";
import { EXPERIENCE_CARDS } from "@/lib/deck";

export default function Home() {
  const { profile, skills } = loadPortfolioData();

  return (
    <>
      <NavBar />
      <SideRail />
      <ScrollBall />
      <main>
        <Hero profile={profile} />
        <AboutSection profile={profile} />
        <RallyTimeline
          id="experience"
          title="The Season"
          caption="The roles I'm playing now, in order of the clock. Follow the ball."
          index="02"
          meta="current season"
          stations={EXPERIENCE_CARDS}
        />
        <SkillRally />
        <TournamentBracket />
        <LiveLab />
        <CourtAnalytics />
        <TrophyCase
          awards={skills.awards}
          coursework={profile.coursework}
          gpa={profile.gpa}
        />
        <ServeTerminal
          email={profile.email}
          linkedinUrl={profile.linkedin_url}
          githubUrl={profile.github_url}
        />
      </main>
      <Footer profile={profile} />
    </>
  );
}
