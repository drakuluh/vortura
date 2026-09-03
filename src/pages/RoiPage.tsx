import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { RoiCalculator } from "@/components/landing/RoiCalculator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Seo } from "@/components/Seo";

const RoiPage = () => {
  const isMobile = useIsMobile();
  const headerAnim = isMobile
    ? { initial: false as const, animate: { opacity: 1, y: 0, filter: "blur(0px)" } }
    : {
        initial: { opacity: 0, y: -24, filter: "blur(8px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  return (
    <PageLayout>
      <Seo
        title="Missed-Call ROI Calculator"
        description="Most local businesses miss 1 in 4 calls. Use our interactive calculator to estimate the revenue you're losing — and what recovering those missed calls is worth."
      />
      <div className="relative overflow-hidden">
        <PageHeroBg />
        <div className="relative z-10 pt-16 md:pt-14 lg:pt-[72px]">
          <RoiCalculator headerAnim={headerAnim} />
        </div>
      </div>
    </PageLayout>
  );
};

export default RoiPage;