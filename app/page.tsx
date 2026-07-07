import Image from "next/image";
import VideoSection from "../components/VideoSection";
import AboutSection from "@/components/AboutSection";
import FallingTechStack from "@/components/FallingTechStack";
import ProjectsSection from "@/components/ProjectsSection";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import SelfRatingBento from "@/components/SelfRatingBento";

export default function Home() {
  return (
   <main>
      <VideoSection />

      <AboutSection/>
      <FallingTechStack trigger="scroll" gravity={0.9} iconSize={68} />

      {/* <ProjectsSection /> */}
      <ProjectsShowcase/>

      <SelfRatingBento/>

      
    </main>
  );
}
