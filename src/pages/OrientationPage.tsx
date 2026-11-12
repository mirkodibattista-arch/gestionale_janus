import { PublicLayout } from "../layouts/PublicLayout";
import { ContactRequestForm } from "../modules/orientation/components/ContactRequestForm";
import { HeroSection } from "../modules/orientation/components/HeroSection";
import { TrustSection } from "../modules/orientation/components/TrustSection";
import type { OrientationFormController } from "../modules/orientation/hooks/useOrientationForm";

type OrientationPageProps = {
  onDashboard: () => void;
  controller: OrientationFormController;
};

export function OrientationPage({
  onDashboard,
  controller,
}: OrientationPageProps) {
  return (
    <PublicLayout onDashboard={onDashboard}>
      <HeroSection />
      <TrustSection />
      <ContactRequestForm controller={controller} />
    </PublicLayout>
  );
}
