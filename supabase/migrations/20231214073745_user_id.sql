create table "public"."artwork_check_history" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "copy_requirement_id" bigint,
    "timestamp" timestamp without time zone not null,
    "version" integer not null,
    "action_done" text,
    "ac_comment" text,
    "designer_instruction" text,
    "screenshot_bucketname" text,
    "screenshot_filepath" text,
    "fixed" boolean not null,
    "user_id" uuid not null
);


create table "public"."artwork_item" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "market_article_id" bigint,
    "layer" text,
    "dieline_file_bucketname" text,
    "dieline_file_filepath" text
);


create table "public"."artwork_version" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "type" text,
    "artwork_item_id" bigint,
    "title" text not null,
    "digital_check" text,
    "physical_check" text,
    "barcode_check" text,
    "artwork_file_bucketname" text not null,
    "artwork_file_filepath" text not null,
    "check_comments_summary" text
);


create table "public"."business" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null
);


create table "public"."copy_element" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null
);


create table "public"."copy_item" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "copy_element_id" bigint,
    "text_content" text,
    "image_content_bucketname" text,
    "image_content_filepath" text,
    "title" text not null,
    "copy_code" text,
    "business_id" bigint,
    "product_id" bigint,
    "designer_notes_general" text
);


create table "public"."copy_requirement" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "artwork_item_id" bigint,
    "copy_element_id" bigint,
    "copy_item_id" bigint,
    "artwork_check_status" text,
    "designer_notes_artwork_specific" text
);


create table "public"."country" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null
);


create table "public"."country_on_market_group" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "market_group_id" bigint,
    "country_id" bigint
);


create table "public"."market_article" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "product_id" bigint,
    "market_group_id" bigint
);


create table "public"."market_group" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "business_id" bigint
);


create table "public"."product" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "business_id" bigint
);


create table "public"."project_role" (
    "id" bigint generated always as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "product_id" bigint,
    "market_article_id" bigint,
    "artwork_item_id" bigint,
    "business_responsible_id" bigint,
    "role" text,
    "user_id" uuid not null
);


CREATE UNIQUE INDEX artwork_check_history_pkey ON public.artwork_check_history USING btree (id);

CREATE UNIQUE INDEX artwork_item_pkey ON public.artwork_item USING btree (id);

CREATE UNIQUE INDEX artwork_version_pkey ON public.artwork_version USING btree (id);

CREATE UNIQUE INDEX business_pkey ON public.business USING btree (id);

CREATE UNIQUE INDEX copy_element_pkey ON public.copy_element USING btree (id);

CREATE UNIQUE INDEX copy_item_pkey ON public.copy_item USING btree (id);

CREATE UNIQUE INDEX copy_requirement_pkey ON public.copy_requirement USING btree (id);

CREATE UNIQUE INDEX country_on_market_group_pkey ON public.country_on_market_group USING btree (id);

CREATE UNIQUE INDEX country_pkey ON public.country USING btree (id);

CREATE UNIQUE INDEX market_article_pkey ON public.market_article USING btree (id);

CREATE UNIQUE INDEX market_group_pkey ON public.market_group USING btree (id);

CREATE UNIQUE INDEX product_pkey ON public.product USING btree (id);

CREATE UNIQUE INDEX project_role_pkey ON public.project_role USING btree (id);

alter table "public"."artwork_check_history" add constraint "artwork_check_history_pkey" PRIMARY KEY using index "artwork_check_history_pkey";

alter table "public"."artwork_item" add constraint "artwork_item_pkey" PRIMARY KEY using index "artwork_item_pkey";

alter table "public"."artwork_version" add constraint "artwork_version_pkey" PRIMARY KEY using index "artwork_version_pkey";

alter table "public"."business" add constraint "business_pkey" PRIMARY KEY using index "business_pkey";

alter table "public"."copy_element" add constraint "copy_element_pkey" PRIMARY KEY using index "copy_element_pkey";

alter table "public"."copy_item" add constraint "copy_item_pkey" PRIMARY KEY using index "copy_item_pkey";

alter table "public"."copy_requirement" add constraint "copy_requirement_pkey" PRIMARY KEY using index "copy_requirement_pkey";

alter table "public"."country" add constraint "country_pkey" PRIMARY KEY using index "country_pkey";

alter table "public"."country_on_market_group" add constraint "country_on_market_group_pkey" PRIMARY KEY using index "country_on_market_group_pkey";

alter table "public"."market_article" add constraint "market_article_pkey" PRIMARY KEY using index "market_article_pkey";

alter table "public"."market_group" add constraint "market_group_pkey" PRIMARY KEY using index "market_group_pkey";

alter table "public"."product" add constraint "product_pkey" PRIMARY KEY using index "product_pkey";

alter table "public"."project_role" add constraint "project_role_pkey" PRIMARY KEY using index "project_role_pkey";

alter table "public"."artwork_check_history" add constraint "artwork_check_history_action_done_check" CHECK ((action_done = ANY (ARRAY['Pending'::text, 'Accepted'::text, 'Rejected'::text, 'N/A'::text, 'Feedback added'::text]))) not valid;

alter table "public"."artwork_check_history" validate constraint "artwork_check_history_action_done_check";

alter table "public"."artwork_check_history" add constraint "artwork_check_history_copy_requirement_id_fkey" FOREIGN KEY (copy_requirement_id) REFERENCES copy_requirement(id) not valid;

alter table "public"."artwork_check_history" validate constraint "artwork_check_history_copy_requirement_id_fkey";

alter table "public"."artwork_check_history" add constraint "artwork_check_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."artwork_check_history" validate constraint "artwork_check_history_user_id_fkey";

alter table "public"."artwork_item" add constraint "artwork_item_layer_check" CHECK ((layer = ANY (ARRAY['Single'::text, 'Multi-pack inner'::text, 'Multi-pack outer'::text, 'Shelf ready'::text, 'Shipper'::text]))) not valid;

alter table "public"."artwork_item" validate constraint "artwork_item_layer_check";

alter table "public"."artwork_item" add constraint "artwork_item_market_article_id_fkey" FOREIGN KEY (market_article_id) REFERENCES market_article(id) not valid;

alter table "public"."artwork_item" validate constraint "artwork_item_market_article_id_fkey";

alter table "public"."artwork_version" add constraint "artwork_version_artwork_item_id_fkey" FOREIGN KEY (artwork_item_id) REFERENCES artwork_item(id) not valid;

alter table "public"."artwork_version" validate constraint "artwork_version_artwork_item_id_fkey";

alter table "public"."artwork_version" add constraint "artwork_version_barcode_check_check" CHECK ((barcode_check = ANY (ARRAY['Approved'::text, 'Rejected'::text, 'Pending'::text, 'N/A'::text]))) not valid;

alter table "public"."artwork_version" validate constraint "artwork_version_barcode_check_check";

alter table "public"."artwork_version" add constraint "artwork_version_digital_check_check" CHECK ((digital_check = ANY (ARRAY['Approved'::text, 'Rejected'::text, 'Pending'::text, 'N/A'::text]))) not valid;

alter table "public"."artwork_version" validate constraint "artwork_version_digital_check_check";

alter table "public"."artwork_version" add constraint "artwork_version_physical_check_check" CHECK ((physical_check = ANY (ARRAY['Approved'::text, 'Rejected'::text, 'Pending'::text, 'N/A'::text]))) not valid;

alter table "public"."artwork_version" validate constraint "artwork_version_physical_check_check";

alter table "public"."artwork_version" add constraint "artwork_version_type_check" CHECK ((type = ANY (ARRAY['Artwork creation'::text, 'Print ready'::text, 'Print proof'::text]))) not valid;

alter table "public"."artwork_version" validate constraint "artwork_version_type_check";

alter table "public"."copy_item" add constraint "copy_item_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business(id) not valid;

alter table "public"."copy_item" validate constraint "copy_item_business_id_fkey";

alter table "public"."copy_item" add constraint "copy_item_copy_element_id_fkey" FOREIGN KEY (copy_element_id) REFERENCES copy_element(id) not valid;

alter table "public"."copy_item" validate constraint "copy_item_copy_element_id_fkey";

alter table "public"."copy_item" add constraint "copy_item_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) not valid;

alter table "public"."copy_item" validate constraint "copy_item_product_id_fkey";

alter table "public"."copy_requirement" add constraint "copy_requirement_artwork_check_status_check" CHECK ((artwork_check_status = ANY (ARRAY['Pending'::text, 'Accepted'::text, 'Rejected'::text, 'N/A'::text]))) not valid;

alter table "public"."copy_requirement" validate constraint "copy_requirement_artwork_check_status_check";

alter table "public"."copy_requirement" add constraint "copy_requirement_artwork_item_id_fkey" FOREIGN KEY (artwork_item_id) REFERENCES artwork_item(id) not valid;

alter table "public"."copy_requirement" validate constraint "copy_requirement_artwork_item_id_fkey";

alter table "public"."copy_requirement" add constraint "copy_requirement_copy_element_id_fkey" FOREIGN KEY (copy_element_id) REFERENCES copy_element(id) not valid;

alter table "public"."copy_requirement" validate constraint "copy_requirement_copy_element_id_fkey";

alter table "public"."copy_requirement" add constraint "copy_requirement_copy_item_id_fkey" FOREIGN KEY (copy_item_id) REFERENCES copy_item(id) not valid;

alter table "public"."copy_requirement" validate constraint "copy_requirement_copy_item_id_fkey";

alter table "public"."country_on_market_group" add constraint "country_on_market_group_country_id_fkey" FOREIGN KEY (country_id) REFERENCES country(id) not valid;

alter table "public"."country_on_market_group" validate constraint "country_on_market_group_country_id_fkey";

alter table "public"."country_on_market_group" add constraint "country_on_market_group_market_group_id_fkey" FOREIGN KEY (market_group_id) REFERENCES market_group(id) not valid;

alter table "public"."country_on_market_group" validate constraint "country_on_market_group_market_group_id_fkey";

alter table "public"."market_article" add constraint "market_article_market_group_id_fkey" FOREIGN KEY (market_group_id) REFERENCES market_group(id) not valid;

alter table "public"."market_article" validate constraint "market_article_market_group_id_fkey";

alter table "public"."market_article" add constraint "market_article_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) not valid;

alter table "public"."market_article" validate constraint "market_article_product_id_fkey";

alter table "public"."market_group" add constraint "market_group_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business(id) not valid;

alter table "public"."market_group" validate constraint "market_group_business_id_fkey";

alter table "public"."product" add constraint "product_business_id_fkey" FOREIGN KEY (business_id) REFERENCES business(id) not valid;

alter table "public"."product" validate constraint "product_business_id_fkey";

alter table "public"."project_role" add constraint "project_role_artwork_item_id_fkey" FOREIGN KEY (artwork_item_id) REFERENCES artwork_item(id) not valid;

alter table "public"."project_role" validate constraint "project_role_artwork_item_id_fkey";

alter table "public"."project_role" add constraint "project_role_business_responsible_id_fkey" FOREIGN KEY (business_responsible_id) REFERENCES business(id) not valid;

alter table "public"."project_role" validate constraint "project_role_business_responsible_id_fkey";

alter table "public"."project_role" add constraint "project_role_market_article_id_fkey" FOREIGN KEY (market_article_id) REFERENCES market_article(id) not valid;

alter table "public"."project_role" validate constraint "project_role_market_article_id_fkey";

alter table "public"."project_role" add constraint "project_role_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) not valid;

alter table "public"."project_role" validate constraint "project_role_product_id_fkey";

alter table "public"."project_role" add constraint "project_role_role_check" CHECK ((role = ANY (ARRAY['Project manager'::text, 'Market article manager'::text, 'Artwork item manager'::text, 'Chief artwork checker'::text, 'Artwork checker'::text, 'Artwork creation manager'::text, 'Artwork creator'::text]))) not valid;

alter table "public"."project_role" validate constraint "project_role_role_check";

alter table "public"."project_role" add constraint "project_role_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."project_role" validate constraint "project_role_user_id_fkey";

grant delete on table "public"."artwork_check_history" to "anon";

grant insert on table "public"."artwork_check_history" to "anon";

grant references on table "public"."artwork_check_history" to "anon";

grant select on table "public"."artwork_check_history" to "anon";

grant trigger on table "public"."artwork_check_history" to "anon";

grant truncate on table "public"."artwork_check_history" to "anon";

grant update on table "public"."artwork_check_history" to "anon";

grant delete on table "public"."artwork_check_history" to "authenticated";

grant insert on table "public"."artwork_check_history" to "authenticated";

grant references on table "public"."artwork_check_history" to "authenticated";

grant select on table "public"."artwork_check_history" to "authenticated";

grant trigger on table "public"."artwork_check_history" to "authenticated";

grant truncate on table "public"."artwork_check_history" to "authenticated";

grant update on table "public"."artwork_check_history" to "authenticated";

grant delete on table "public"."artwork_check_history" to "service_role";

grant insert on table "public"."artwork_check_history" to "service_role";

grant references on table "public"."artwork_check_history" to "service_role";

grant select on table "public"."artwork_check_history" to "service_role";

grant trigger on table "public"."artwork_check_history" to "service_role";

grant truncate on table "public"."artwork_check_history" to "service_role";

grant update on table "public"."artwork_check_history" to "service_role";

grant delete on table "public"."artwork_item" to "anon";

grant insert on table "public"."artwork_item" to "anon";

grant references on table "public"."artwork_item" to "anon";

grant select on table "public"."artwork_item" to "anon";

grant trigger on table "public"."artwork_item" to "anon";

grant truncate on table "public"."artwork_item" to "anon";

grant update on table "public"."artwork_item" to "anon";

grant delete on table "public"."artwork_item" to "authenticated";

grant insert on table "public"."artwork_item" to "authenticated";

grant references on table "public"."artwork_item" to "authenticated";

grant select on table "public"."artwork_item" to "authenticated";

grant trigger on table "public"."artwork_item" to "authenticated";

grant truncate on table "public"."artwork_item" to "authenticated";

grant update on table "public"."artwork_item" to "authenticated";

grant delete on table "public"."artwork_item" to "service_role";

grant insert on table "public"."artwork_item" to "service_role";

grant references on table "public"."artwork_item" to "service_role";

grant select on table "public"."artwork_item" to "service_role";

grant trigger on table "public"."artwork_item" to "service_role";

grant truncate on table "public"."artwork_item" to "service_role";

grant update on table "public"."artwork_item" to "service_role";

grant delete on table "public"."artwork_version" to "anon";

grant insert on table "public"."artwork_version" to "anon";

grant references on table "public"."artwork_version" to "anon";

grant select on table "public"."artwork_version" to "anon";

grant trigger on table "public"."artwork_version" to "anon";

grant truncate on table "public"."artwork_version" to "anon";

grant update on table "public"."artwork_version" to "anon";

grant delete on table "public"."artwork_version" to "authenticated";

grant insert on table "public"."artwork_version" to "authenticated";

grant references on table "public"."artwork_version" to "authenticated";

grant select on table "public"."artwork_version" to "authenticated";

grant trigger on table "public"."artwork_version" to "authenticated";

grant truncate on table "public"."artwork_version" to "authenticated";

grant update on table "public"."artwork_version" to "authenticated";

grant delete on table "public"."artwork_version" to "service_role";

grant insert on table "public"."artwork_version" to "service_role";

grant references on table "public"."artwork_version" to "service_role";

grant select on table "public"."artwork_version" to "service_role";

grant trigger on table "public"."artwork_version" to "service_role";

grant truncate on table "public"."artwork_version" to "service_role";

grant update on table "public"."artwork_version" to "service_role";

grant delete on table "public"."business" to "anon";

grant insert on table "public"."business" to "anon";

grant references on table "public"."business" to "anon";

grant select on table "public"."business" to "anon";

grant trigger on table "public"."business" to "anon";

grant truncate on table "public"."business" to "anon";

grant update on table "public"."business" to "anon";

grant delete on table "public"."business" to "authenticated";

grant insert on table "public"."business" to "authenticated";

grant references on table "public"."business" to "authenticated";

grant select on table "public"."business" to "authenticated";

grant trigger on table "public"."business" to "authenticated";

grant truncate on table "public"."business" to "authenticated";

grant update on table "public"."business" to "authenticated";

grant delete on table "public"."business" to "service_role";

grant insert on table "public"."business" to "service_role";

grant references on table "public"."business" to "service_role";

grant select on table "public"."business" to "service_role";

grant trigger on table "public"."business" to "service_role";

grant truncate on table "public"."business" to "service_role";

grant update on table "public"."business" to "service_role";

grant delete on table "public"."copy_element" to "anon";

grant insert on table "public"."copy_element" to "anon";

grant references on table "public"."copy_element" to "anon";

grant select on table "public"."copy_element" to "anon";

grant trigger on table "public"."copy_element" to "anon";

grant truncate on table "public"."copy_element" to "anon";

grant update on table "public"."copy_element" to "anon";

grant delete on table "public"."copy_element" to "authenticated";

grant insert on table "public"."copy_element" to "authenticated";

grant references on table "public"."copy_element" to "authenticated";

grant select on table "public"."copy_element" to "authenticated";

grant trigger on table "public"."copy_element" to "authenticated";

grant truncate on table "public"."copy_element" to "authenticated";

grant update on table "public"."copy_element" to "authenticated";

grant delete on table "public"."copy_element" to "service_role";

grant insert on table "public"."copy_element" to "service_role";

grant references on table "public"."copy_element" to "service_role";

grant select on table "public"."copy_element" to "service_role";

grant trigger on table "public"."copy_element" to "service_role";

grant truncate on table "public"."copy_element" to "service_role";

grant update on table "public"."copy_element" to "service_role";

grant delete on table "public"."copy_item" to "anon";

grant insert on table "public"."copy_item" to "anon";

grant references on table "public"."copy_item" to "anon";

grant select on table "public"."copy_item" to "anon";

grant trigger on table "public"."copy_item" to "anon";

grant truncate on table "public"."copy_item" to "anon";

grant update on table "public"."copy_item" to "anon";

grant delete on table "public"."copy_item" to "authenticated";

grant insert on table "public"."copy_item" to "authenticated";

grant references on table "public"."copy_item" to "authenticated";

grant select on table "public"."copy_item" to "authenticated";

grant trigger on table "public"."copy_item" to "authenticated";

grant truncate on table "public"."copy_item" to "authenticated";

grant update on table "public"."copy_item" to "authenticated";

grant delete on table "public"."copy_item" to "service_role";

grant insert on table "public"."copy_item" to "service_role";

grant references on table "public"."copy_item" to "service_role";

grant select on table "public"."copy_item" to "service_role";

grant trigger on table "public"."copy_item" to "service_role";

grant truncate on table "public"."copy_item" to "service_role";

grant update on table "public"."copy_item" to "service_role";

grant delete on table "public"."copy_requirement" to "anon";

grant insert on table "public"."copy_requirement" to "anon";

grant references on table "public"."copy_requirement" to "anon";

grant select on table "public"."copy_requirement" to "anon";

grant trigger on table "public"."copy_requirement" to "anon";

grant truncate on table "public"."copy_requirement" to "anon";

grant update on table "public"."copy_requirement" to "anon";

grant delete on table "public"."copy_requirement" to "authenticated";

grant insert on table "public"."copy_requirement" to "authenticated";

grant references on table "public"."copy_requirement" to "authenticated";

grant select on table "public"."copy_requirement" to "authenticated";

grant trigger on table "public"."copy_requirement" to "authenticated";

grant truncate on table "public"."copy_requirement" to "authenticated";

grant update on table "public"."copy_requirement" to "authenticated";

grant delete on table "public"."copy_requirement" to "service_role";

grant insert on table "public"."copy_requirement" to "service_role";

grant references on table "public"."copy_requirement" to "service_role";

grant select on table "public"."copy_requirement" to "service_role";

grant trigger on table "public"."copy_requirement" to "service_role";

grant truncate on table "public"."copy_requirement" to "service_role";

grant update on table "public"."copy_requirement" to "service_role";

grant delete on table "public"."country" to "anon";

grant insert on table "public"."country" to "anon";

grant references on table "public"."country" to "anon";

grant select on table "public"."country" to "anon";

grant trigger on table "public"."country" to "anon";

grant truncate on table "public"."country" to "anon";

grant update on table "public"."country" to "anon";

grant delete on table "public"."country" to "authenticated";

grant insert on table "public"."country" to "authenticated";

grant references on table "public"."country" to "authenticated";

grant select on table "public"."country" to "authenticated";

grant trigger on table "public"."country" to "authenticated";

grant truncate on table "public"."country" to "authenticated";

grant update on table "public"."country" to "authenticated";

grant delete on table "public"."country" to "service_role";

grant insert on table "public"."country" to "service_role";

grant references on table "public"."country" to "service_role";

grant select on table "public"."country" to "service_role";

grant trigger on table "public"."country" to "service_role";

grant truncate on table "public"."country" to "service_role";

grant update on table "public"."country" to "service_role";

grant delete on table "public"."country_on_market_group" to "anon";

grant insert on table "public"."country_on_market_group" to "anon";

grant references on table "public"."country_on_market_group" to "anon";

grant select on table "public"."country_on_market_group" to "anon";

grant trigger on table "public"."country_on_market_group" to "anon";

grant truncate on table "public"."country_on_market_group" to "anon";

grant update on table "public"."country_on_market_group" to "anon";

grant delete on table "public"."country_on_market_group" to "authenticated";

grant insert on table "public"."country_on_market_group" to "authenticated";

grant references on table "public"."country_on_market_group" to "authenticated";

grant select on table "public"."country_on_market_group" to "authenticated";

grant trigger on table "public"."country_on_market_group" to "authenticated";

grant truncate on table "public"."country_on_market_group" to "authenticated";

grant update on table "public"."country_on_market_group" to "authenticated";

grant delete on table "public"."country_on_market_group" to "service_role";

grant insert on table "public"."country_on_market_group" to "service_role";

grant references on table "public"."country_on_market_group" to "service_role";

grant select on table "public"."country_on_market_group" to "service_role";

grant trigger on table "public"."country_on_market_group" to "service_role";

grant truncate on table "public"."country_on_market_group" to "service_role";

grant update on table "public"."country_on_market_group" to "service_role";

grant delete on table "public"."market_article" to "anon";

grant insert on table "public"."market_article" to "anon";

grant references on table "public"."market_article" to "anon";

grant select on table "public"."market_article" to "anon";

grant trigger on table "public"."market_article" to "anon";

grant truncate on table "public"."market_article" to "anon";

grant update on table "public"."market_article" to "anon";

grant delete on table "public"."market_article" to "authenticated";

grant insert on table "public"."market_article" to "authenticated";

grant references on table "public"."market_article" to "authenticated";

grant select on table "public"."market_article" to "authenticated";

grant trigger on table "public"."market_article" to "authenticated";

grant truncate on table "public"."market_article" to "authenticated";

grant update on table "public"."market_article" to "authenticated";

grant delete on table "public"."market_article" to "service_role";

grant insert on table "public"."market_article" to "service_role";

grant references on table "public"."market_article" to "service_role";

grant select on table "public"."market_article" to "service_role";

grant trigger on table "public"."market_article" to "service_role";

grant truncate on table "public"."market_article" to "service_role";

grant update on table "public"."market_article" to "service_role";

grant delete on table "public"."market_group" to "anon";

grant insert on table "public"."market_group" to "anon";

grant references on table "public"."market_group" to "anon";

grant select on table "public"."market_group" to "anon";

grant trigger on table "public"."market_group" to "anon";

grant truncate on table "public"."market_group" to "anon";

grant update on table "public"."market_group" to "anon";

grant delete on table "public"."market_group" to "authenticated";

grant insert on table "public"."market_group" to "authenticated";

grant references on table "public"."market_group" to "authenticated";

grant select on table "public"."market_group" to "authenticated";

grant trigger on table "public"."market_group" to "authenticated";

grant truncate on table "public"."market_group" to "authenticated";

grant update on table "public"."market_group" to "authenticated";

grant delete on table "public"."market_group" to "service_role";

grant insert on table "public"."market_group" to "service_role";

grant references on table "public"."market_group" to "service_role";

grant select on table "public"."market_group" to "service_role";

grant trigger on table "public"."market_group" to "service_role";

grant truncate on table "public"."market_group" to "service_role";

grant update on table "public"."market_group" to "service_role";

grant delete on table "public"."product" to "anon";

grant insert on table "public"."product" to "anon";

grant references on table "public"."product" to "anon";

grant select on table "public"."product" to "anon";

grant trigger on table "public"."product" to "anon";

grant truncate on table "public"."product" to "anon";

grant update on table "public"."product" to "anon";

grant delete on table "public"."product" to "authenticated";

grant insert on table "public"."product" to "authenticated";

grant references on table "public"."product" to "authenticated";

grant select on table "public"."product" to "authenticated";

grant trigger on table "public"."product" to "authenticated";

grant truncate on table "public"."product" to "authenticated";

grant update on table "public"."product" to "authenticated";

grant delete on table "public"."product" to "service_role";

grant insert on table "public"."product" to "service_role";

grant references on table "public"."product" to "service_role";

grant select on table "public"."product" to "service_role";

grant trigger on table "public"."product" to "service_role";

grant truncate on table "public"."product" to "service_role";

grant update on table "public"."product" to "service_role";

grant delete on table "public"."project_role" to "anon";

grant insert on table "public"."project_role" to "anon";

grant references on table "public"."project_role" to "anon";

grant select on table "public"."project_role" to "anon";

grant trigger on table "public"."project_role" to "anon";

grant truncate on table "public"."project_role" to "anon";

grant update on table "public"."project_role" to "anon";

grant delete on table "public"."project_role" to "authenticated";

grant insert on table "public"."project_role" to "authenticated";

grant references on table "public"."project_role" to "authenticated";

grant select on table "public"."project_role" to "authenticated";

grant trigger on table "public"."project_role" to "authenticated";

grant truncate on table "public"."project_role" to "authenticated";

grant update on table "public"."project_role" to "authenticated";

grant delete on table "public"."project_role" to "service_role";

grant insert on table "public"."project_role" to "service_role";

grant references on table "public"."project_role" to "service_role";

grant select on table "public"."project_role" to "service_role";

grant trigger on table "public"."project_role" to "service_role";

grant truncate on table "public"."project_role" to "service_role";

grant update on table "public"."project_role" to "service_role";


