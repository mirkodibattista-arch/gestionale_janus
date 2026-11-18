import type postgres from "npm:postgres@3.4.8";
import {
  pageSize,
  type RequestDetail,
  type RequestListing,
  type RequestRow,
} from "../_shared/janusOrientation.ts";
import type { Dependencies } from "./handler.ts";

type TransactionQuery = <Rows extends readonly object[] = postgres.Row[]>(
  template: TemplateStringsArray,
  ...values: (string | number | postgres.PendingQuery<postgres.Row[]>)[]
) => postgres.PendingQuery<Rows>;

export function createReader(sql: postgres.Sql): Dependencies["read"] {
  return (operation) => {
    return sql.begin(
      "isolation level repeatable read read only",
      async (transaction) => {
        // Postgres.js rende la transazione callable a runtime; Omit perde gli overload nei tipi.
        const tx = transaction as unknown as TransactionQuery;
        await tx`set local role janus_orientation_reader`;
        await tx`set local statement_timeout = '3s'`;

        const columns =
          tx`id, nome, cognome, email, telefono, indirizzo_interesse,
        modalita_interesse, stato, ricevuta_il`;
        return await operation({
          async profile(userId) {
            const [profile] = await tx<{ role: string }[]>`
            select ruolo as role from janus_privato.profili_aziendali
            where utente_id = ${userId}::uuid and attivo`;
            return profile ?? null;
          },
          async list({ page, search, status, modality }) {
            const filters = tx`
            where (${status}::text = '' or stato = ${status})
              and (${modality}::text = '' or modalita_interesse = ${modality})
              and (${search}::text = '' or strpos(
                lower(concat_ws(' ', nome, cognome, email, telefono, indirizzo_interesse)),
                lower(${search}::text)
              ) > 0)`;
            const [total] = await tx<{ count: number }[]>`
            select count(*)::integer as count from public.richieste_contatto ${filters}`;
            const items = await tx<RequestRow[]>`
            select ${columns} from public.richieste_contatto ${filters}
            order by ricevuta_il desc, id desc
            limit ${pageSize} offset ${(page - 1) * pageSize}`;
            const [counts] = await tx<RequestListing["counts"][]>`
            select
              count(*) filter (where stato = 'nuova')::integer as nuova,
              count(*) filter (where stato = 'contattata')::integer as contattata,
              count(*) filter (where stato = 'in_valutazione')::integer as in_valutazione,
              count(*) filter (where stato = 'chiusa')::integer as chiusa
            from public.richieste_contatto`;
            return { items, total: total.count, counts };
          },
          async detail(id) {
            const [result] = await tx<RequestDetail[]>`
            select ${columns}, messaggio from public.richieste_contatto where id = ${id}::uuid`;
            return result ?? null;
          },
        });
      },
    ) as Promise<Awaited<ReturnType<typeof operation>>>;
  };
}
