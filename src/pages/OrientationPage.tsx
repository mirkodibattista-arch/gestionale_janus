import { CampusAccess } from "../modules/orientation/components/CampusAccess";
import { PublicLayout } from "../layouts/PublicLayout";
import { ContactRequestForm } from "../modules/orientation/components/ContactRequestForm";
import { HeroSection } from "../modules/orientation/components/HeroSection";
import { TrustSection } from "../modules/orientation/components/TrustSection";
import type { OrientationFormController } from "../modules/orientation/hooks/useOrientationForm";

type OrientationPageProps = {
  onDashboard: () => void;
  controller: OrientationFormController;
  formOnly?: boolean;
};

export function OrientationPage({
  onDashboard,
  controller,
  formOnly = false,
}: OrientationPageProps) {
  return (
    <PublicLayout onDashboard={onDashboard}>
      {!formOnly && (
        <>
          <HeroSection />
          <TrustSection />
          <CampusAccess />
        </>
      )}
      {formOnly && (
        <div className="public-orientation-note">
          <h1>Richiedi un orientamento JANUS</h1>
          <p>
            La richiesta non costituisce un’iscrizione confermata e non crea un
            account di accesso al campus.
          </p>
          <a href="/login">Hai già un account? Accedi al Digital Campus →</a>
        </div>
      )}
      <ContactRequestForm controller={controller} />
    </PublicLayout>
  );
}
