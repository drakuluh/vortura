import { Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { SparklesText } from "@/components/ui/sparkles-text";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { BookingPanel } from "@/components/landing/BookingCalendar";
import { Seo } from "@/components/Seo";
import { useHeaderAnim, useCardAnim } from "@/hooks/use-anim";
import { ContactFormPanel } from "@/components/landing/contact-form-shared";

const ContactPage = () => {
  const headerAnim = useHeaderAnim();
  const cardAnim = useCardAnim();

  return (
    <PageLayout>
      <Seo
        title="Contact"
        description="Tell us about your business and we'll respond within 24 hours with a custom automation plan. Let's build your edge."
      />
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <PageHeroBg />
        </div>
        <div className="relative z-10 pt-14 md:pt-10 lg:pt-12">
          <section id="contact" className="relative py-10 md:py-14 lg:py-20">
            <div className="container relative z-10">
              <div className="max-w-md md:max-w-xl lg:max-w-5xl mx-auto">
                <motion.div className="text-center mb-5 md:mb-7 lg:mb-9" {...headerAnim}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                    Let's build your <SparklesText text="edge." className="text-gradient py-1" />
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tell us about your business or book a call directly.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="tel:+11234561234" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-medium text-primary">(123) 456-1234</span>
                    </a>
                    <a href="mailto:support@vortura.ai" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-medium text-primary">support@vortura.ai</span>
                    </a>
                  </div>
                </motion.div>

                <motion.div className="relative" {...cardAnim}>
                  <div
                    className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md pointer-events-none"
                    style={{ opacity: 0.3 }}
                  />
                  <div className="group relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15 overflow-hidden transition-colors duration-500">
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.14),transparent_70%)]" />
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 lg:items-stretch">
                      {/* Left — Contact form */}
                      <div className="lg:pr-8 lg:border-r lg:border-white/[0.06] flex flex-col">
                        <ContactFormPanel />
                      </div>
                      {/* Right — Booking calendar */}
                      <div className="lg:pl-8 border-t border-white/[0.06] pt-6 lg:border-t-0 lg:pt-0 flex flex-col">
                        <BookingPanel />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
