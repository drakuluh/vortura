import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  centered?: boolean;
}

export const DashboardSubPage = ({ eyebrow, title, description, children, centered = false }: Props) => {
  const isMobile = useIsMobile();
  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const bodyAnim = isMobile
    ? { initial: false as const, animate: { y: 0 } }
    : {
        initial: { y: 24 },
        whileInView: { y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.1 },
      };

  return (
    <PageLayout>
      <section className="relative pt-12 md:pt-14 lg:pt-24 pb-16 md:pb-20 lg:pb-28 overflow-hidden">
        <PageHeroBg />
        <div className="container relative z-10">
          <motion.div
            className={`mt-12 md:mt-10 lg:mt-8 mb-8 md:mb-10 ${centered ? "text-center" : ""}`}
            {...headerAnim}
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
              {title}
            </h1>
            <p className={`text-sm text-muted-foreground max-w-xl ${centered ? "mx-auto" : ""}`}>
              {description}
            </p>
          </motion.div>
          <motion.div {...bodyAnim}>{children}</motion.div>
        </div>
      </section>
    </PageLayout>
  );
};