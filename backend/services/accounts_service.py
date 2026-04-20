from supabase_client import supabase

ACCOUNT_TYPES = {1: "Checking", 2: "Savings"}


def fetch_accounts(token: str, user_id: str) -> list:
    response = supabase.table("Account").select("*").eq("UserID", user_id).execute()
    return [
        {
            "account_id": row["AccountID"],
            "account_balance": row["AccountBalance"],
            "account_type_id": row["AccountTypeID"],
            "account_type_name": ACCOUNT_TYPES.get(row["AccountTypeID"], "Unknown"),
        }
        for row in response.data
    ]


def create_account(token: str, account_balance: float, account_type_id: int) -> dict:
    result = supabase.postgrest.auth(token).rpc("create_account", {
        "initial_balance": account_balance,
        "account_type_id": account_type_id,
    }).execute()
    return {
        "account_id": result.data,
        "account_balance": account_balance,
        "account_type_id": account_type_id,
        "account_type_name": ACCOUNT_TYPES.get(account_type_id, "Unknown"),
    }


def delete_account(token: str, account_id: int) -> None:
    supabase.postgrest.auth(token).rpc("delete_account", {
        "account_id": account_id,
    }).execute()
