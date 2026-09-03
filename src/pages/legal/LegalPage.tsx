import { ReactNode } from "react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";

interface LegalPageProps {
  eyebrow: string;
  title: ReactNode;
  updated?: string;
  children: ReactNode;
  after?: ReactNode;
}

export const LegalPage = ({ eyebrow, title, updated, children, after }: LegalPageProps) => (
  <PageLayout>
    <section className="relative pt-12 md:pt-14 lg:pt-24 pb-16 md:pb-20 lg:pb-28 overflow-hidden">
      <PageHeroBg />
      <div className="container relative z-10 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-12 md:mt-10 lg:mt-8 mb-10 md:mb-12 text-center"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-depth mb-3">
            {title}
          </h1>
          {updated && (
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Last updated · {updated}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="glass rounded-3xl p-6 md:p-10 prose-legal"
        >
          {children}
        </motion.div>
      </div>
      {after}
    </section>
  </PageLayout>
);