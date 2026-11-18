-- Eseguire in sola lettura, DOPO approvazione, esclusivamente in janus-staging.
-- L'identità del progetto si verifica nel Dashboard/host, non da current_database().
begin read only;

select current_database(), current_user, current_setting('server_version_num') as pg_version,
  (select rolcreaterole from pg_roles where rolname = current_user) as can_create_roles,
  to_regnamespace('janus_privato') is null as private_schema_available,
  not exists (select 1 from pg_roles where rolname in
    ('janus_orientation_edge', 'janus_orientation_reader')) as role_names_available,
  has_schema_privilege(current_user, 'auth', 'USAGE')
    and has_column_privilege(current_user, 'auth.users', 'id', 'REFERENCES') as can_reference_auth_users;

select c.oid::regclass as tabella, c.relrowsecurity as rls,
  array(select p.policyname from pg_policies p where p.schemaname = 'public'
    and p.tablename = 'richieste_contatto') as policies
from pg_class c where c.oid = to_regclass('public.richieste_contatto');

select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'richieste_contatto'
order by ordinal_position;

select a.rolname,
  has_any_column_privilege(a.rolname, 'public.richieste_contatto', 'SELECT') as can_read,
  has_any_column_privilege(a.rolname, 'public.richieste_contatto', 'INSERT') as can_insert,
  has_any_column_privilege(a.rolname, 'public.richieste_contatto', 'UPDATE') as can_update,
  has_table_privilege(a.rolname, 'public.richieste_contatto', 'DELETE, TRUNCATE') as can_delete
from pg_roles a where a.rolname in ('anon', 'authenticated', 'service_role')
order by a.rolname;

rollback;
