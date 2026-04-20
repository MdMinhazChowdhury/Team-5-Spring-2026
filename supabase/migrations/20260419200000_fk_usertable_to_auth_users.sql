-- Change all UserID foreign keys from UserTable to auth.users
-- This removes the need to manually maintain UserTable rows on signup

ALTER TABLE "public"."Account"
    DROP CONSTRAINT "Account_UserID_fkey",
    ADD CONSTRAINT "Account_UserID_fkey"
        FOREIGN KEY ("UserID") REFERENCES "auth"."users"("id");

ALTER TABLE "public"."TransactionTable"
    DROP CONSTRAINT "TransactionTable_UserID_fkey",
    ADD CONSTRAINT "TransactionTable_UserID_fkey"
        FOREIGN KEY ("UserID") REFERENCES "auth"."users"("id");

ALTER TABLE "public"."Financial Goal"
    DROP CONSTRAINT "Financial Goal_UserID_fkey",
    ADD CONSTRAINT "Financial Goal_UserID_fkey"
        FOREIGN KEY ("UserID") REFERENCES "auth"."users"("id");
