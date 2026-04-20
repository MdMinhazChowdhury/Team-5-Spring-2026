-- TransactionID has no default value, causing NOT NULL violation on insert.
-- Add a sequence and set it as the default.

CREATE SEQUENCE IF NOT EXISTS "public"."TransactionTable_TransactionID_seq"
    AS bigint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."TransactionTable"
    ALTER COLUMN "TransactionID" SET DEFAULT nextval('"public"."TransactionTable_TransactionID_seq"'::regclass);

ALTER SEQUENCE "public"."TransactionTable_TransactionID_seq"
    OWNED BY "public"."TransactionTable"."TransactionID";
