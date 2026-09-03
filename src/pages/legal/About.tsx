import { useEffect, useState } from "react";
import { LegalPage } from "./LegalPage";
import { Seo } from "@/components/Seo";

const FULL = "VORTURA.ai";

const TitleTypewriter = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (text.length >= FULL.length) return;
    const timeout = setTimeout(() => {
      setText(FULL.slice(0, text.length + 1));
    }, 110);
    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <span className="inline-flex items-baseline leading-[1.15] pb-[0.1em] min-h-[1.15em]">
      <span className="text-foreground mr-[0.25em]">About</span>
      <span className="text-gradient">{text}{"\u200B"}</span>
      <span className="ml-1 inline-block w-[3px] h-[0.9em] bg-primary animate-blink shadow-glow-blue" />
    </span>
  );
};

const About = () => (
  <LegalPage eyebrow="About" title={<TitleTypewriter />}>
    <Seo
      title="About"
      description="The story behind VORTURA.ai — a Mississauga-based studio building fast websites and AI automation for local businesses across Mississauga, Brampton, Toronto, and worldwide."
    />
    <p>
      VORTURA builds modern websites and automated systems for growing businesses
      across Mississauga, the GTA, and beyond. We design clean, high-performing sites
      paired with backend automations that handle routine inquiries, respond to
      missed leads, and keep your daily operations running smoothly.
    </p>

    <p>
      Every project comes fully configured with hands-on onboarding, ongoing
      technical support, and a direct line to a real person whenever you need updates
      or changes.
    </p>

    <p>
      VORTURA was built to help local business owners modernize their online presence
      and streamline their daily operations. Our team crafts high-end digital
      experiences backed by practical automations that eliminate repetitive admin
      work. We deliver clean, reliable systems that give your business a competitive
      edge and free up your team to focus on what matters most.
    </p>
  </LegalPage>
);

export default About;