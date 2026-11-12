import { ArrowRight, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";

export function TrustSection() {
  return (
    <section className="trust-strip" id="metodo">
      <div>
        <span className="trust-icon">
          <ShieldCheck size={18} />
        </span>
        <b>Un supporto concreto</b>
        <small>Ti accompagniamo in ogni fase</small>
      </div>
      <div>
        <span className="trust-icon cyan">
          <BookOpen size={18} />
        </span>
        <b>Un metodo flessibile</b>
        <small>Studio organizzato intorno a te</small>
      </div>
      <div>
        <span className="trust-icon green">
          <GraduationCap size={18} />
        </span>
        <b>Un obiettivo chiaro</b>
        <small>Il diploma, un passo alla volta</small>
      </div>
      <a href="#percorso" id="percorso">
        Scopri i percorsi <ArrowRight size={15} />
      </a>
    </section>
  );
}
