import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export function HeroSection() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="badge-spark">
              <Sparkles size={13} />
            </span>{" "}
            IL TUO PROSSIMO CAPITOLO INIZIA QUI
          </div>
          <h1>
            Il diploma che
            <br />
            apre nuove <span>possibilità.</span>
          </h1>
          <p className="hero-description">
            Un percorso costruito intorno ai tuoi obiettivi, con il supporto di
            tutor e un metodo flessibile.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#richiesta">
              Trova il tuo percorso <ArrowRight size={16} />
            </a>
            <a className="secondary-link" href="#metodo">
              <span className="play">▶</span> Scopri il metodo
            </a>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars">
              <span>G</span>
              <span>M</span>
              <span>A</span>
              <span>+</span>
            </div>
            <p>
              <b>Un percorso, una guida.</b>
              <br />
              Al tuo fianco passo dopo passo.
            </p>
            <div className="proof-divider" />
            <div className="rating">
              <span>★★★★★</span>
              <small>Orientamento personalizzato</small>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-glow" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="visual-grid" />
          <div className="visual-card card-progress">
            <div className="progress-top">
              <span className="progress-icon">
                <GraduationCap size={18} />
              </span>
              <span className="progress-tag">IL TUO PERCORSO</span>
              <span className="more">···</span>
            </div>
            <div className="progress-title">
              Ogni traguardo
              <br />
              <b>è un nuovo inizio.</b>
            </div>
            <div className="progress-caption">
              Un piano flessibile, costruito su di te.
            </div>
            <div className="progress-track">
              <i />
            </div>
            <div className="progress-bottom">
              <span>Obiettivo diploma</span>
              <b>
                in vista <ArrowUpRight size={13} />
              </b>
            </div>
          </div>
          <div className="floating-card floating-tutor">
            <span className="tutor-icon">
              <BookOpen size={17} />
            </span>
            <div>
              <b>Il tuo tutor</b>
              <small>sempre al tuo fianco</small>
            </div>
            <CheckCircle2 size={16} className="tutor-check" />
          </div>
          <div className="floating-card floating-flex">
            <div className="flex-icon">
              <Sparkles size={16} />
            </div>
            <span>
              <b>Il tuo ritmo.</b>
              <small>Il tuo futuro.</small>
            </span>
          </div>
          <div className="visual-index">
            01 <i /> 03
          </div>
        </div>
      </section>
    </>
  );
}
