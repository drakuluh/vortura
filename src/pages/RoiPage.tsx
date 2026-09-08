import { PageLayout } from "@/components/landing/PageLayout";
import { PageHeroBg } from "@/components/landing/PageHeroBg";
import { RoiCalculator } from "@/components/landing/RoiCalculator";
import { useHeaderAnim } from "@/hooks/use-anim";
import { Seo } from "@/components/Seo";

const RoiPage = () => {
  const headerAnim = useHeaderAnim();
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