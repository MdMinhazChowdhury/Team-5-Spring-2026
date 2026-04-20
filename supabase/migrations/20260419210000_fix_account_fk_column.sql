-- Fix incorrect FK: Account.AccountID incorrectly referenced AccountType
-- It should be Account.AccountTypeID -> AccountType.AccountTypeID

ALTER TABLE "public"."Account"
    DROP CONSTRAINT "Account_AccountID_fkey",
    ADD CONSTRAINT "Account_AccountTypeID_fkey"
        FOREIGN KEY ("AccountTypeID") REFERENCES "public"."AccountType"("AccountTypeID");
