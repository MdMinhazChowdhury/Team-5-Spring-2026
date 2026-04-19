


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_account"("initial_balance" numeric, "account_type_id" integer) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  new_id int4;
begin
  insert into "Account" (
    "AccountBalance",
    "AccountTypeID",
    "UserID"
  )
  values (
    initial_balance,
    account_type_id,
    auth.uid()
  )
  returning "AccountID" into new_id;

  return new_id;
end;
$$;


ALTER FUNCTION "public"."create_account"("initial_balance" numeric, "account_type_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_financial_goal"("goal_name" "text", "goal_end" "date", "end_goal_amount" numeric) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  new_goal_id uuid;
begin
  insert into "Financial Goal" (
    "GoalID",
    "Goal_Name",
    "Goal_End",
    "End_Goal_Amount",
    "Current_Goal_Amount",
    "UserID"
  )
  values (
    gen_random_uuid(),
    goal_name,
    goal_end,
    end_goal_amount,
    0,
    auth.uid()
  )
  returning "GoalID" into new_goal_id;

  return new_goal_id;
end;
$$;


ALTER FUNCTION "public"."create_financial_goal"("goal_name" "text", "goal_end" "date", "end_goal_amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  new_id int4;
begin
  -- Insert the transaction
  insert into "TransactionTable" (
    "AccountID",
    "Trans_Total",
    "CategoryID",
    "DateOfTransaction",
    "UserID"
  )
  values (
    account_id,
    amount,
    category_id,
    date_of_transaction,
    auth.uid()
  )
  returning "TransactionID" into new_id;

  -- Update the account balance
  update "Account"
  set "AccountBalance" = "AccountBalance" + amount
  where "AccountID" = account_id
    and "UserID" = auth.uid();

  return new_id;
end;
$$;


ALTER FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_account"("account_id" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- Delete all transactions for this account (only if owned by the user)
  delete from "TransactionTable"
  where "AccountID" = account_id
    and "UserID" = auth.uid();

  -- Delete the account itself
  delete from "Account"
  where "AccountID" = account_id
    and "UserID" = auth.uid();
end;
$$;


ALTER FUNCTION "public"."delete_account"("account_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_financial_goal"("goal_id" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  delete from "Financial Goal"
  where "GoalID" = goal_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."delete_financial_goal"("goal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_transaction"("transaction_id" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  acc_id int4;
  amt numeric;
begin
  -- Fetch the transaction details (only if it belongs to the user)
  select 
    "AccountID",
    "Trans_Total"
  into acc_id, amt
  from "TransactionTable"
  where "TransactionID" = transaction_id
    and "UserID" = auth.uid();

  -- If no transaction found, exit quietly
  if acc_id is null then
    return;
  end if;

  -- Delete the transaction
  delete from "TransactionTable"
  where "TransactionID" = transaction_id
    and "UserID" = auth.uid();

  -- Reverse the amount from the account balance
  update "Account"
  set "AccountBalance" = "AccountBalance" - amt
  where "AccountID" = acc_id
    and "UserID" = auth.uid();
end;
$$;


ALTER FUNCTION "public"."delete_transaction"("transaction_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_account_by_id"("account_id" integer) RETURNS TABLE("AccountID" integer, "AccountBalance" numeric, "AccountTypeID" integer, "AccountTypeName" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    a."AccountID",
    a."AccountBalance",
    a."AccountTypeID",
    t."AccountName" as "AccountTypeName"
  from "Account" a
  join "AccountType" t
    on a."AccountTypeID" = t."AccountTypeID"
  where a."AccountID" = account_id
    and a."UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."get_account_by_id"("account_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_account_overview"("account_id" integer) RETURNS TABLE("AccountID" integer, "AccountBalance" numeric, "AccountTypeID" integer, "total_income" numeric, "total_spending" numeric, "transaction_count" integer)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  with acc as (
    select 
      a."AccountID",
      a."AccountBalance",
      a."AccountTypeID"
    from "Account" a
    where a."AccountID" = account_id
      and a."UserID" = auth.uid()
  ),
  inc as (
    select coalesce(sum("Trans_Total"), 0) as total_income
    from "TransactionTable"
    where "AccountID" = account_id
      and "UserID" = auth.uid()
      and "Trans_Total" > 0
  ),
  spend as (
    select coalesce(sum("Trans_Total"), 0) as total_spending
    from "TransactionTable"
    where "AccountID" = account_id
      and "UserID" = auth.uid()
      and "Trans_Total" < 0
  ),
  cnt as (
    select count(*) as transaction_count
    from "TransactionTable"
    where "AccountID" = account_id
      and "UserID" = auth.uid()
  )
  select
    acc."AccountID",
    acc."AccountBalance",
    acc."AccountTypeID",
    inc.total_income,
    spend.total_spending,
    cnt.transaction_count
  from acc, inc, spend, cnt;
$$;


ALTER FUNCTION "public"."get_account_overview"("account_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_account_types"() RETURNS TABLE("AccountTypeID" integer, "AccountType" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    "AccountTypeID",
    "AccountType"
  from "AccountType";
$$;


ALTER FUNCTION "public"."get_account_types"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_accounts"() RETURNS TABLE("AccountID" integer, "AccountBalance" numeric, "AccountTypeID" integer, "AccountTypeName" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    a."AccountID",
    a."AccountBalance",
    a."AccountTypeID",
    t."AccountName" as "AccountTypeName"
  from "Account" a
  join "AccountType" t
    on a."AccountTypeID" = t."AccountTypeID"
  where a."UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."get_accounts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_balance_summary"() RETURNS numeric
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select coalesce(sum("AccountBalance"), 0)
  from "Account"
  where "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."get_balance_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_categories"() RETURNS TABLE("CategoryID" integer, "Category_Title" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    "CategoryID",
    "Category_Title"
  from "CategoryTable";
$$;


ALTER FUNCTION "public"."get_categories"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_by_id"("category_id" integer) RETURNS TABLE("CategoryID" integer, "Category_Title" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    "CategoryID",
    "Category_Title"
  from "CategoryTable"
  where "CategoryID" = category_id;
$$;


ALTER FUNCTION "public"."get_category_by_id"("category_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_financial_goals"() RETURNS TABLE("GoalID" "uuid", "Goal_Name" "text", "Goal_End" "date", "End_Goal_Amount" numeric, "Current_Goal_Amount" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    "GoalID",
    "Goal_Name",
    "Goal_End",
    "End_Goal_Amount",
    "Current_Goal_Amount"
  from "Financial Goal"
  where "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."get_financial_goals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_goal_by_id"("goal_id" "uuid") RETURNS TABLE("GoalID" "uuid", "Goal_Name" "text", "Goal_End" "date", "End_Goal_Amount" numeric, "Current_Goal_Amount" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select
    "GoalID",
    "Goal_Name",
    "Goal_End",
    "End_Goal_Amount",
    "Current_Goal_Amount"
  from "Financial Goal"
  where "GoalID" = goal_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."get_goal_by_id"("goal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_goal_progress"("goal_id" "uuid") RETURNS TABLE("GoalID" "uuid", "Goal_Name" "text", "End_Goal_Amount" numeric, "Current_Goal_Amount" numeric, "Goal_End" "date")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select
    "GoalID",
    "Goal_Name",
    "End_Goal_Amount",
    "Current_Goal_Amount",
    "Goal_End"
  from "Financial Goal"
  where "GoalID" = goal_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."get_goal_progress"("goal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_monthly_income"("year" integer, "month" integer) RETURNS numeric
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select coalesce(sum("Trans_Total"), 0)
  from "TransactionTable"
  where "UserID" = auth.uid()
    and extract(year from "DateOfTransaction") = year
    and extract(month from "DateOfTransaction") = month
    and "Trans_Total" > 0;
$$;


ALTER FUNCTION "public"."get_monthly_income"("year" integer, "month" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_monthly_spending"("year" integer, "month" integer) RETURNS numeric
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select coalesce(sum("Trans_Total"), 0)
  from "TransactionTable"
  where "UserID" = auth.uid()
    and extract(year from "DateOfTransaction") = year
    and extract(month from "DateOfTransaction") = month
    and "Trans_Total" < 0;
$$;


ALTER FUNCTION "public"."get_monthly_spending"("year" integer, "month" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_recent_transactions"("limit_count" integer) RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" "date")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction"
  from "TransactionTable"
  where "UserID" = auth.uid()
  order by "DateOfTransaction" desc
  limit limit_count;
$$;


ALTER FUNCTION "public"."get_recent_transactions"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_spending_by_category"("start_date" "date", "end_date" "date") RETURNS TABLE("CategoryID" integer, "Category_Title" "text", "Total_Spending" numeric)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    c."CategoryID",
    c."Category_Title",
    coalesce(sum(t."Trans_Total"), 0) as "Total_Spending"
  from "TransactionTable" t
  join "CategoryTable" c
    on t."CategoryID" = c."CategoryID"
  where t."UserID" = auth.uid()
    and t."DateOfTransaction" between start_date and end_date
    and t."Trans_Total" < 0
  group by c."CategoryID", c."Category_Title"
  order by "Total_Spending" asc;  -- most spent categories first (more negative)
$$;


ALTER FUNCTION "public"."get_spending_by_category"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" "date")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction"
  from "TransactionTable"
  where "TransactionID" = transaction_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_transactions"("account_id" integer) RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" "date")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction"
  from "TransactionTable"
  where "AccountID" = account_id
    and "UserID" = auth.uid()
  order by "DateOfTransaction" desc;
$$;


ALTER FUNCTION "public"."get_transactions"("account_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") RETURNS TABLE("TransactionID" integer, "Trans_Total" numeric, "CategoryID" integer, "AccountID" integer, "DateOfTransaction" "date")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select
    "TransactionID",
    "Trans_Total",
    "CategoryID",
    "AccountID",
    "DateOfTransaction"
  from "TransactionTable"
  where "UserID" = auth.uid()
    and "DateOfTransaction" between start_date and end_date
  order by "DateOfTransaction" desc;
$$;


ALTER FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_info"() RETURNS TABLE("UserID" "uuid", "FirstName" "text", "LastName" "text", "Email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$select 
    "UserID",
    "FirstName",
    "LastName",
    "Email"
  from "UserTable"
  where "UserID" = auth.uid();$$;


ALTER FUNCTION "public"."get_user_info"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_summary"() RETURNS TABLE("total_balance" numeric, "total_income" numeric, "total_spending" numeric, "goal_count" integer, "total_goal_progress" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  with 
  acc as (
    select coalesce(sum("AccountBalance"), 0) as total_balance
    from "Account"
    where "UserID" = auth.uid()
  ),
  inc as (
    select coalesce(sum("Trans_Total"), 0) as total_income
    from "TransactionTable"
    where "UserID" = auth.uid()
      and "Trans_Total" > 0
  ),
  spend as (
    select coalesce(sum("Trans_Total"), 0) as total_spending
    from "TransactionTable"
    where "UserID" = auth.uid()
      and "Trans_Total" < 0
  ),
  goals as (
    select 
      count(*) as goal_count,
      coalesce(sum("Current_Goal_Amount"), 0) as total_goal_progress
    from "Financial Goal"
    where "UserID" = auth.uid()
  )
  select 
    acc.total_balance,
    inc.total_income,
    spend.total_spending,
    goals.goal_count,
    goals.total_goal_progress
  from acc, inc, spend, goals;
end;
$$;


ALTER FUNCTION "public"."get_user_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_account"("account_id" integer, "account_type_id" integer) RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  update "Account"
  set "AccountTypeID" = account_type_id
  where "AccountID" = account_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."update_account"("account_id" integer, "account_type_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_account_balance"("account_id" integer, "new_balance" numeric) RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  update "Account"
  set "AccountBalance" = new_balance
  where "AccountID" = account_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."update_account_balance"("account_id" integer, "new_balance" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_financial_goal"("goal_id" "uuid", "name" "text", "end_date" "date", "end_goal_amount" numeric) RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  update "Financial Goal"
  set 
    "Goal_Name" = name,
    "Goal_End" = end_date,
    "End_Goal_Amount" = end_goal_amount
  where "GoalID" = goal_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."update_financial_goal"("goal_id" "uuid", "name" "text", "end_date" "date", "end_goal_amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_goal_progress"("goal_id" "uuid", "amount" numeric) RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  update "Financial Goal"
  set "Current_Goal_Amount" = "Current_Goal_Amount" + amount
  where "GoalID" = goal_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."update_goal_progress"("goal_id" "uuid", "amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  update "TransactionTable"
  set 
    "Trans_Total" = amount,
    "CategoryID" = category_id,
    "AccountID" = account_id,
    "DateOfTransaction" = date
  where "TransactionID" = transaction_id
    and "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_info"("first_name" "text", "last_name" "text", "email" "text") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  update "UserTable"
  set 
    "FirstName" = first_name,
    "LastName" = last_name,
    "Email" = email
  where "UserID" = auth.uid();
$$;


ALTER FUNCTION "public"."update_user_info"("first_name" "text", "last_name" "text", "email" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Account" (
    "AccountID" bigint NOT NULL,
    "AccountBalance" numeric,
    "UserID" "uuid" DEFAULT "gen_random_uuid"(),
    "AccountTypeID" bigint
);


ALTER TABLE "public"."Account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."AccountType" (
    "AccountTypeID" bigint NOT NULL,
    "AccountName" "text" NOT NULL
);


ALTER TABLE "public"."AccountType" OWNER TO "postgres";


ALTER TABLE "public"."AccountType" ALTER COLUMN "AccountTypeID" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."AccountType_AccountTypeID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."Account" ALTER COLUMN "AccountID" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Account_AccountID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."CategoryTable" (
    "CategoryID" integer NOT NULL,
    "Category_Title" "text" NOT NULL
);


ALTER TABLE "public"."CategoryTable" OWNER TO "postgres";


COMMENT ON TABLE "public"."CategoryTable" IS 'Contains the category ID with the category title';



ALTER TABLE "public"."CategoryTable" ALTER COLUMN "CategoryID" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."CategoryTable_CategoryID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."Financial Goal" (
    "GoalID" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "Goal_Name" "text" DEFAULT ''::"text" NOT NULL,
    "Goal_End" "date",
    "End_Goal_Amount" numeric,
    "Current_Goal_Amount" numeric,
    "UserID" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."Financial Goal" OWNER TO "postgres";


COMMENT ON TABLE "public"."Financial Goal" IS 'Holds the financial goals of each user based on their userID';



CREATE TABLE IF NOT EXISTS "public"."TransactionTable" (
    "Trans_Total" numeric,
    "DateOfTransaction" "date" NOT NULL,
    "TransactionID" bigint NOT NULL,
    "UserID" "uuid" DEFAULT "gen_random_uuid"(),
    "CategoryID" integer,
    "AccountID" bigint
);


ALTER TABLE "public"."TransactionTable" OWNER TO "postgres";


COMMENT ON TABLE "public"."TransactionTable" IS 'Holds Each user''s transaction (both positive and negative).';



CREATE TABLE IF NOT EXISTS "public"."UserTable" (
    "UserID" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "FirstName" "text" NOT NULL,
    "LastName" "text",
    "Email" "text"
);


ALTER TABLE "public"."UserTable" OWNER TO "postgres";


COMMENT ON TABLE "public"."UserTable" IS 'Holds information about all users on the finance tracker. Each has their own unique user ID.';



ALTER TABLE ONLY "public"."AccountType"
    ADD CONSTRAINT "AccountType_pkey" PRIMARY KEY ("AccountTypeID");



ALTER TABLE ONLY "public"."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("AccountID");



ALTER TABLE ONLY "public"."CategoryTable"
    ADD CONSTRAINT "CategoryTable_pkey" PRIMARY KEY ("CategoryID");



ALTER TABLE ONLY "public"."Financial Goal"
    ADD CONSTRAINT "Financial Goal_pkey" PRIMARY KEY ("GoalID");



ALTER TABLE ONLY "public"."TransactionTable"
    ADD CONSTRAINT "TransactionTable_pkey" PRIMARY KEY ("TransactionID");



ALTER TABLE ONLY "public"."UserTable"
    ADD CONSTRAINT "UserTable_pkey" PRIMARY KEY ("UserID");



ALTER TABLE ONLY "public"."Account"
    ADD CONSTRAINT "Account_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "public"."AccountType"("AccountTypeID");



ALTER TABLE ONLY "public"."Account"
    ADD CONSTRAINT "Account_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "public"."UserTable"("UserID");



ALTER TABLE ONLY "public"."Financial Goal"
    ADD CONSTRAINT "Financial Goal_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "public"."UserTable"("UserID");



ALTER TABLE ONLY "public"."TransactionTable"
    ADD CONSTRAINT "TransactionTable_AccountID_fkey" FOREIGN KEY ("AccountID") REFERENCES "public"."Account"("AccountID");



ALTER TABLE ONLY "public"."TransactionTable"
    ADD CONSTRAINT "TransactionTable_CategoryID_fkey" FOREIGN KEY ("CategoryID") REFERENCES "public"."CategoryTable"("CategoryID");



ALTER TABLE ONLY "public"."TransactionTable"
    ADD CONSTRAINT "TransactionTable_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "public"."UserTable"("UserID");



ALTER TABLE "public"."Account" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."AccountType" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."CategoryTable" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."Financial Goal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."TransactionTable" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."UserTable" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can view their own data" ON "public"."Account" FOR SELECT USING (("UserID" = "auth"."uid"()));



CREATE POLICY "Users can view their own data" ON "public"."Financial Goal" FOR SELECT USING (("UserID" = "auth"."uid"()));



CREATE POLICY "Users can view their own data" ON "public"."TransactionTable" FOR SELECT USING (("UserID" = "auth"."uid"()));



CREATE POLICY "Users can view their own data" ON "public"."UserTable" FOR SELECT USING (("UserID" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_account"("initial_balance" numeric, "account_type_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_account"("initial_balance" numeric, "account_type_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_account"("initial_balance" numeric, "account_type_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_financial_goal"("goal_name" "text", "goal_end" "date", "end_goal_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."create_financial_goal"("goal_name" "text", "goal_end" "date", "end_goal_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_financial_goal"("goal_name" "text", "goal_end" "date", "end_goal_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_transaction"("account_id" integer, "amount" numeric, "category_id" integer, "date_of_transaction" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_account"("account_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_account"("account_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_account"("account_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_financial_goal"("goal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_financial_goal"("goal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_financial_goal"("goal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_transaction"("transaction_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_transaction"("transaction_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_transaction"("transaction_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_account_by_id"("account_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_account_by_id"("account_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_account_by_id"("account_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_account_overview"("account_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_account_overview"("account_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_account_overview"("account_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_account_types"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_account_types"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_account_types"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_accounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_accounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_accounts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_balance_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_balance_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_balance_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_categories"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_by_id"("category_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_by_id"("category_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_by_id"("category_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_financial_goals"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_financial_goals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_financial_goals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_goal_by_id"("goal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_goal_by_id"("goal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_goal_by_id"("goal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_goal_progress"("goal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_goal_progress"("goal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_goal_progress"("goal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_monthly_income"("year" integer, "month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_monthly_income"("year" integer, "month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_monthly_income"("year" integer, "month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_monthly_spending"("year" integer, "month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_monthly_spending"("year" integer, "month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_monthly_spending"("year" integer, "month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recent_transactions"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_recent_transactions"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_transactions"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_spending_by_category"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_spending_by_category"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_spending_by_category"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transaction_by_id"("transaction_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_transactions"("account_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_transactions"("account_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transactions"("account_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transactions_by_date"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_info"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_info"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_info"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_account"("account_id" integer, "account_type_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_account"("account_id" integer, "account_type_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_account"("account_id" integer, "account_type_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_account_balance"("account_id" integer, "new_balance" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_account_balance"("account_id" integer, "new_balance" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_account_balance"("account_id" integer, "new_balance" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_financial_goal"("goal_id" "uuid", "name" "text", "end_date" "date", "end_goal_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_financial_goal"("goal_id" "uuid", "name" "text", "end_date" "date", "end_goal_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_financial_goal"("goal_id" "uuid", "name" "text", "end_date" "date", "end_goal_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_goal_progress"("goal_id" "uuid", "amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_goal_progress"("goal_id" "uuid", "amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_goal_progress"("goal_id" "uuid", "amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transaction"("transaction_id" integer, "amount" numeric, "category_id" integer, "account_id" integer, "date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_info"("first_name" "text", "last_name" "text", "email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_info"("first_name" "text", "last_name" "text", "email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_info"("first_name" "text", "last_name" "text", "email" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."Account" TO "anon";
GRANT ALL ON TABLE "public"."Account" TO "authenticated";
GRANT ALL ON TABLE "public"."Account" TO "service_role";



GRANT ALL ON TABLE "public"."AccountType" TO "anon";
GRANT ALL ON TABLE "public"."AccountType" TO "authenticated";
GRANT ALL ON TABLE "public"."AccountType" TO "service_role";



GRANT ALL ON SEQUENCE "public"."AccountType_AccountTypeID_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."AccountType_AccountTypeID_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."AccountType_AccountTypeID_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Account_AccountID_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Account_AccountID_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Account_AccountID_seq" TO "service_role";



GRANT ALL ON TABLE "public"."CategoryTable" TO "anon";
GRANT ALL ON TABLE "public"."CategoryTable" TO "authenticated";
GRANT ALL ON TABLE "public"."CategoryTable" TO "service_role";



GRANT ALL ON SEQUENCE "public"."CategoryTable_CategoryID_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."CategoryTable_CategoryID_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."CategoryTable_CategoryID_seq" TO "service_role";



GRANT ALL ON TABLE "public"."Financial Goal" TO "anon";
GRANT ALL ON TABLE "public"."Financial Goal" TO "authenticated";
GRANT ALL ON TABLE "public"."Financial Goal" TO "service_role";



GRANT ALL ON TABLE "public"."TransactionTable" TO "anon";
GRANT ALL ON TABLE "public"."TransactionTable" TO "authenticated";
GRANT ALL ON TABLE "public"."TransactionTable" TO "service_role";



GRANT ALL ON TABLE "public"."UserTable" TO "anon";
GRANT ALL ON TABLE "public"."UserTable" TO "authenticated";
GRANT ALL ON TABLE "public"."UserTable" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































