import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { useHeaderAnim, useCardAnim } from "@/hooks/use-anim";

interface Props {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  centered?: boolean;
}

export const DashboardSubPage = ({ eyebrow, title, description, children, centered = false }: Props) => {
  const headerAnim = useHeaderAnim();
  const bodyAnim = useCardAnim(24, 0.1);

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