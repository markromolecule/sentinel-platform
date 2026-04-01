alter table "public"."terms"
add column if not exists "updated_at" timestamp with time zone default now();

update "public"."terms"
set "updated_at" = coalesce("updated_at", "created_at", now())
where "updated_at" is null;

create or replace trigger "update_terms_updated_at"
before update on "public"."terms"
for each row
execute function "public"."update_updated_at_column"();
