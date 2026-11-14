import { ArrowRight, GraduationCap, Users } from "lucide-react";

export function CampusAccess() {
  return (
    <section
      className="public-campus-access"
      aria-labelledby="campus-access-title"
    >
      <div className="public-campus-copy">
        <span className="eyebrow">IL TUO SPAZIO JANUS</span>
        <h2 id="campus-access-title">
          Un nuovo percorso o il tuo prossimo passo.
        </h2>
        <p>
          Se cerchi informazioni, compila il modulo di orientamento. Se hai già
          un account, entra nella tua area personale.
        </p>
      </div>
      <div className="public-access-options">
        <div>
          <GraduationCap size={24} />
          <h3>Vuoi conoscere JANUS?</h3>
          <p>
            Raccontaci i tuoi obiettivi. La richiesta di orientamento non
            costituisce un’iscrizione confermata e non crea un account.
          </p>
          <a className="primary-link" href="/orientamento#richiesta">
            Richiedi un orientamento <ArrowRight size={16} />
          </a>
        </div>
        <div className="public-campus-option">
          <Users size={24} />
          <h3>Hai già un account JANUS?</h3>
          <p>
            Studenti, tutor e personale accedono dallo stesso login. Il tuo
            account apre automaticamente il portale corretto.
          </p>
          <a className="public-campus-cta" href="/login">
            SEI GIÀ ISCRITTO? ACCEDI AL DIGITAL CAMPUS <ArrowRight size={18} />
          </a>
          <a className="public-staff-link" href="/login">
            Accesso personale aziendale →
          </a>
        </div>
      </div>
    </section>
  );
}
