-- Add Description column to TransactionTable
ALTER TABLE "public"."TransactionTable"
  ADD COLUMN IF NOT EXISTS "Description" text;

-- Update create_transaction to accept and store description
CREATE OR REPLACE FUNCTION "public"."create_transaction"(
  "account_id" integer,
  "amount" numeric,
  "category_id" integer,
  "date_of_transaction" "date",
  "description" text DEFAULT NULL
) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

-- Update update_transaction to accept and store description
CREATE OR REPLACE FUNCTION "public"."update_transaction"(
  "transaction_id" integer,
  "amount" numeric,
  "category_id" integer,
  "account_id" integer,
  "date" "date",
  "description" text DEFAULT NULL
) RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  update "TransactionTable"
  set
    "Trans_Total" = amount,
    "CategoryID" = category_id,
    "AccountID" = account_id,
    "DateOfTransaction" = date,
    "Description" = description
  where "TransactionID" = transaction_id
    and "UserID" = auth.uid();
$$;

-- Drop functions whose return type is changing before recreating them
DROP FUNCTION IF EXISTS "public"."get_recent_transactions"(integer);
DROP FUNCTION IF EXISTS "public"."get_transactions"(integer);
DROP FUNCTION IF EXISTS "public"."get_transactions_by_date"("date", "date");
DROP FUNCTION IF EXISTS "public"."get_transaction_by_id"(integer);

-- Update get_recent_transactions to return Description
CREATE OR REPLACE FUNCTION "public"."get_recent_transactions"("limit_count" integer)
RETURNS TABLE(
  "TransactionID" integer,
  "Trans_Total" numeric,
  "CategoryID" integer,
  "AccountID" integer,
  "DateOfTransaction" "date",
  "Description" text
)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
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
$$;

-- Update get_transactions to return Description
CREATE OR REPLACE FUNCTION "public"."get_transactions"("account_id" integer)
RETURNS TABLE(
  "TransactionID" integer,
  "Trans_Total" numeric,
  "CategoryID" integer,
  "AccountID" integer,
  "DateOfTransaction" "date",
  "Description" text
)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
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
$$;

-- Update get_transactions_by_date to return Description
CREATE OR REPLACE FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date")
RETURNS TABLE(
  "TransactionID" integer,
  "Trans_Total" numeric,
  "CategoryID" integer,
  "AccountID" integer,
  "DateOfTransaction" "date",
  "Description" text
)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
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
$$;

-- Update get_transaction_by_id to return Description
CREATE OR REPLACE FUNCTION "public"."get_transaction_by_id"("transaction_id" integer)
RETURNS TABLE(
  "TransactionID" integer,
  "Trans_Total" numeric,
  "CategoryID" integer,
  "AccountID" integer,
  "DateOfTransaction" "date",
  "Description" text
)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
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
$$;

-- Grant permissions for updated functions
GRANT ALL ON FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date", "description" text) TO "anon";
GRANT ALL ON FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date", "description" text) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date", "description" text) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date", "description" text) TO "anon";
GRANT ALL ON FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date", "description" text) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date", "description" text) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_recent_transactions"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_recent_transactions"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_transactions"("limit_count" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_transactions"("account_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_transactions"("account_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transactions"("account_id" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) TO "service_role";
