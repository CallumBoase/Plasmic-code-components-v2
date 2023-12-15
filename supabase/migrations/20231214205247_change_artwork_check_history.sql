alter table "public"."artwork_check_history" drop column "version";

alter table "public"."artwork_check_history" add column "artwork_version_id" bigint not null;

alter table "public"."artwork_check_history" add constraint "artwork_check_history_artwork_version_id_fkey" FOREIGN KEY (artwork_version_id) REFERENCES artwork_version(id) not valid;

alter table "public"."artwork_check_history" validate constraint "artwork_check_history_artwork_version_id_fkey";


