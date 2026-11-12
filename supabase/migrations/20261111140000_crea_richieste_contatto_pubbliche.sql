create table public.richieste_contatto (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(btrim(nome)) between 1 and 80),
  cognome text not null check (length(btrim(cognome)) between 1 and 80),
  email text not null check (length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  telefono text not null check (length(telefono) between 6 and 32),
  indirizzo_interesse text check (indirizzo_interesse is null or length(indirizzo_interesse) <= 120),
  modalita_interesse text check (modalita_interesse is null or modalita_interesse in ('gold_experience','gold_academy_live','gold_digital')),
  messaggio text check (messaggio is null or length(messaggio) <= 1500),
  informativa_letta boolean not null check (informativa_letta = true),
  versione_informativa text not null default 'consultazione-v1',
  consenso_marketing boolean not null default false,
  stato text not null default 'nuova' check (stato in ('nuova','contattata','in_valutazione','chiusa')),
  ricevuta_il timestamptz not null default now()
);

comment on table public.richieste_contatto is 'Richieste pubbliche di orientamento/preventivo; non costituiscono iscrizioni ufficiali.';
comment on column public.richieste_contatto.versione_informativa is 'Identificativo della versione del testo informativo mostrato nel form.';
create index richieste_contatto_ricevuta_il_idx on public.richieste_contatto (ricevuta_il desc);
create index richieste_contatto_stato_ricevuta_idx on public.richieste_contatto (stato, ricevuta_il desc);

alter table public.richieste_contatto enable row level security;
revoke all on table public.richieste_contatto from public, anon, authenticated;
grant select on table public.richieste_contatto to authenticated;
grant update (stato) on table public.richieste_contatto to authenticated;

create policy "Staff autorizzato legge richieste contatto"
on public.richieste_contatto for select to authenticated
using (private.ha_permesso('contatti','lettura'));

create policy "Staff autorizzato aggiorna stato richiesta contatto"
on public.richieste_contatto for update to authenticated
using (private.ha_permesso('contatti','modifica'))
with check (private.ha_permesso('contatti','modifica'));

insert into private.permessi (risorsa, azione, ambito)
values ('contatti','lettura','tutti'), ('contatti','modifica','tutti')
on conflict (risorsa, azione, ambito) do nothing;

insert into private.ruoli_permessi (ruolo_id, permesso_id)
select r.id, p.id
from private.ruoli r
join private.permessi p on p.risorsa='contatti' and p.azione in ('lettura','modifica') and p.ambito='tutti'
where r.codice in ('supervisore','segreteria')
on conflict do nothing;
