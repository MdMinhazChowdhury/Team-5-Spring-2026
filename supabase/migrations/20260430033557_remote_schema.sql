drop extension if exists "pg_net";


  create table "public"."Budget" (
    "BudgetID" uuid not null default gen_random_uuid(),
    "UserID" uuid not null default auth.uid(),
    "CategoryID" integer,
    "MonthlyLimit" numeric,
    "Month" date
      );


alter table "public"."Budget" enable row level security;

alter table "public"."Account" alter column "UserID" set default auth.uid();

alter table "public"."Financial Goal" alter column "UserID" set default auth.uid();

alter table "public"."TransactionTable" alter column "UserID" set default auth.uid();

CREATE UNIQUE INDEX "Budget_pkey" ON public."Budget" USING btree ("BudgetID");

alter table "public"."Budget" add constraint "Budget_pkey" PRIMARY KEY using index "Budget_pkey";

alter table "public"."Budget" add constraint "Budget_CategoryID_fkey" FOREIGN KEY ("CategoryID") REFERENCES public."CategoryTable"("CategoryID") not valid;

alter table "public"."Budget" validate constraint "Budget_CategoryID_fkey";

alter table "public"."UserTable" add constraint "usertable_userid_fkey" FOREIGN KEY ("UserID") REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."UserTable" validate constraint "usertable_userid_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_budget(p_budget_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  delete from "Budget"
  where "BudgetID" = p_budget_id
    and "UserID" = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_budgets(p_year integer, p_month integer)
 RETURNS TABLE(budget_id uuid, category_id integer, category_title text, monthly_limit double precision, spent double precision)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    b."BudgetID" as budget_id,
    b."CategoryID" as category_id,
    c."Category_Title" as category_title,
    b."MonthlyLimit" as monthly_limit,
    coalesce(sum(t."Trans_Total"), 0) as spent
  from "Budget" b
  join "CategoryTable" c
    on c."CategoryID" = b."CategoryID"
  left join "TransactionTable" t
    on t."CategoryID" = b."CategoryID"
   and t."UserID" = b."UserID"
   and extract(year from t."DateOfTransaction") = p_year
   and extract(month from t."DateOfTransaction") = p_month
  where b."UserID" = auth.uid()
    and extract(year from b."Month") = p_year
    and extract(month from b."Month") = p_month
  group by b."BudgetID", b."CategoryID", c."Category_Title", b."MonthlyLimit";
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_budget(p_category_id integer, p_monthly_limit double precision, p_month date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into "Budget" (
    "BudgetID",
    "UserID",
    "CategoryID",
    "MonthlyLimit",
    "Month"
  )
  values (
    gen_random_uuid(),
    auth.uid(),
    p_category_id,
    p_monthly_limit,
    p_month
  )
  on conflict ("UserID", "CategoryID", "Month")
  do update set
    "MonthlyLimit" = excluded."MonthlyLimit";
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_transaction(account_id integer, amount numeric, category_id integer, date_of_transaction date, description text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  new_id int4;
begin
  insert into "TransactionTable" (
    "AccountID",
    "Trans_Total",
    "CategoryID",
    "DateOfTransaction",
    "UserID",
    "Description"
  )
  values (
    account_id,
    amount,
    category_id,
    date_of_transaction,
    auth.uid(),
    description
  )
  returning "TransactionID" into new_id;

  update "Account"
  set "AccountBalance" = "AccountBalance" + amount
  where "AccountID" = account_id
    and "UserID" = auth.uid();

  return new_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_recent_transactions(limit_count integer)
 RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" date, "Description" text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction",
    "Description"
  from "TransactionTable"
  where "UserID" = auth.uid()
  order by "DateOfTransaction" desc
  limit limit_count;
$function$
;

CREATE OR REPLACE FUNCTION public.get_transaction_by_id(transaction_id integer)
 RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" date, "Description" text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction",
    "Description"
  from "TransactionTable"
  where "TransactionID" = transaction_id
    and "UserID" = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_transactions(account_id integer)
 RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" date, "Description" text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction",
    "Description"
  from "TransactionTable"
  where "AccountID" = account_id
    and "UserID" = auth.uid()
  order by "DateOfTransaction" desc;
$function$
;

CREATE OR REPLACE FUNCTION public.get_transactions_by_date(start_date date, end_date date)
 RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" date, "Description" text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction",
    "Description"
  from "TransactionTable"
  where "UserID" = auth.uid()
    and "DateOfTransaction" between start_date and end_date
  order by "DateOfTransaction" desc;
$function$
;

CREATE OR REPLACE FUNCTION public.update_transaction(transaction_id integer, amount numeric, category_id integer, account_id integer, date date, description text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  update "TransactionTable"
  set
    "Trans_Total" = amount,
    "CategoryID" = category_id,
    "AccountID" = account_id,
    "DateOfTransaction" = date,
    "Description" = description
  where "TransactionID" = transaction_id
    and "UserID" = auth.uid();
$function$
;

grant delete on table "public"."Budget" to "anon";

grant insert on table "public"."Budget" to "anon";

grant references on table "public"."Budget" to "anon";

grant select on table "public"."Budget" to "anon";

grant trigger on table "public"."Budget" to "anon";

grant truncate on table "public"."Budget" to "anon";

grant update on table "public"."Budget" to "anon";

grant delete on table "public"."Budget" to "authenticated";

grant insert on table "public"."Budget" to "authenticated";

grant references on table "public"."Budget" to "authenticated";

grant select on table "public"."Budget" to "authenticated";

grant trigger on table "public"."Budget" to "authenticated";

grant truncate on table "public"."Budget" to "authenticated";

grant update on table "public"."Budget" to "authenticated";

grant delete on table "public"."Budget" to "service_role";

grant insert on table "public"."Budget" to "service_role";

grant references on table "public"."Budget" to "service_role";

grant select on table "public"."Budget" to "service_role";

grant trigger on table "public"."Budget" to "service_role";

grant truncate on table "public"."Budget" to "service_role";

grant update on table "public"."Budget" to "service_role";


