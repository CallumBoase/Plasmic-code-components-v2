create a migration
supabase db diff --use-migra <some_name> -f <some_name>

reset database
supabase db reset

dump data into sql file for copy paste into seed file
pg_dump --data-only --inserts --column-inserts -n public -n auth postgresql://postgres:postgres@localhost:54322/postgres > backup.sql