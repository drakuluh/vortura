import { lazy, Suspense } from "react";
import { Loader2, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { Seo } from "@/components/Seo";
import { useHeaderAnim, useCardAnim } from "@/hooks/use-anim";
import { LazyBookingPanel, LazyContactFormPanel } from "@/components/landing/LazyContactPanels";
import { CONTACT } from "@/data/contact";
import { CopyEmailButton } from "@/components/landing/CopyEmailButton";
import { useAuth } from "@/hooks/useAuth";
import { BookingSelectionProvider } from "@/components/landing/booking-selection";

// Signed-in view (chat, booking as yourself, upcoming calls). Its own chunk,
// so guests never download the Supabase client or chat code.
const MemberContact = lazy(() => import("@/components/contact/MemberContact"));

const MemberPlaceholder = () => (
  <div className="flex min-h-[560px] items-center justify-center text-sm text-muted-foreground gap-2" role="status">
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
    Loading your conversation…
  </div>
);

const ContactPage = () => {
  const headerAnim = useHeaderAnim();
  const cardAnim = useCardAnim();
  const { user, loading } = useAuth();
  // Auth only stays "loading" for visitors with a saved session, who are
  // almost always signed in, so show them the member heading meanwhile.
  const member = !!user || loading;

  return (
    <PageLayout>
      <Seo
        title="Contact"
        description="Tell us about your business and we'll get back to you within 24 hours with a custom automation plan."
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
                  {member ? (
                    <>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                        Your line to <span className="text-gradient py-1">Vortura.</span>
                      </h1>
                      <p className="text-sm text-muted-foreground mb-4">
                        Message the team or book a call. We usually reply within 24 hours.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-depth mb-2.5">
                        Let's build your <span className="text-gradient py-1">edge.</span>
                      </h1>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tell us about your business or book a call directly.
                      </p>
                    </>
                  )}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {CONTACT.phone && (
                      <a href={CONTACT.phone.href} className="inline-flex items-center gap-2 px-3 py-3 sm:py-1.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-medium text-primary">{CONTACT.phone.display}</span>
                      </a>
                    )}
                    <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 px-3 py-3 sm:py-1.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-medium text-primary">{CONTACT.email}</span>
                    </a>
                    <CopyEmailButton email={CONTACT.email} />
                  </div>
                </motion.div>

                <motion.div className="relative" {...cardAnim}>
                  <div
                    className="absolute -inset-px rounded-3xl bg-gradient-primary blur-md pointer-events-none"
                    style={{ opacity: 0.3 }}
                  />
                  <div className="group relative glass-strong rounded-3xl p-5 md:p-6 lg:p-8 border-2 border-white/15 overflow-hidden transition-colors duration-500">
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--secondary)/0.14),transparent_70%)]" />
                    {member ? (
                      loading ? (
                        <MemberPlaceholder />
                      ) : (
                        <Suspense fallback={<MemberPlaceholder />}>
                          <MemberContact />
                        </Suspense>
                      )
                    ) : (
                      // One booking: the form's details plus the calendar's time.
                      <BookingSelectionProvider>
                      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 lg:items-stretch">
                        {/* Left — Contact form */}
                        <div className="lg:pr-8 lg:border-r lg:border-white/[0.06] flex flex-col">
                          <LazyContactFormPanel />
                        </div>
                        {/* Right — Booking calendar */}
                        <div className="lg:pl-8 border-t border-white/[0.06] pt-6 lg:border-t-0 lg:pt-0 flex flex-col">
                          <LazyBookingPanel />
                        </div>
                      </div>
                      </BookingSelectionProvider>
                    )}
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
