from supabase_client import supabase


def get_transactions(token, account_id=None, limit=50):
    client = supabase.postgrest.auth(token)
    if account_id:
        return client.rpc("get_transactions", {"account_id": account_id}).execute().data
    return client.rpc("get_recent_transactions", {"limit_count": limit}).execute().data


def create_transaction(token, account_id, amount, category_id, date_of_transaction, description=None):
    return supabase.postgrest.auth(token).rpc("create_transaction", {
        "account_id": account_id,
        "amount": amount,
        "category_id": category_id,
        "date_of_transaction": str(date_of_transaction),
        "description": description,
    }).execute().data


def update_transaction(token, transaction_id, amount, category_id, account_id, date, description=None):
    supabase.postgrest.auth(token).rpc("update_transaction", {
        "transaction_id": transaction_id,
        "amount": amount,
        "category_id": category_id,
        "account_id": account_id,
        "date": str(date),
        "description": description,
    }).execute()


def delete_transaction(token, transaction_id):
    supabase.postgrest.auth(token).rpc("delete_transaction", {
        "transaction_id": transaction_id,
    }).execute()


def get_transactions_by_date(token, start_date, end_date):
    return supabase.postgrest.auth(token).rpc("get_transactions_by_date", {
        "start_date": str(start_date),
        "end_date": str(end_date),
    }).execute().data


def get_spending_by_category(token, start_date, end_date):
    return supabase.postgrest.auth(token).rpc("get_spending_by_category", {
        "start_date": str(start_date),
        "end_date": str(end_date),
    }).execute().data


def get_monthly_spending(token, year, month):
    return supabase.postgrest.auth(token).rpc("get_monthly_spending", {
        "year": year,
        "month": month,
    }).execute().data


def get_monthly_income(token, year, month):
    return supabase.postgrest.auth(token).rpc("get_monthly_income", {
        "year": year,
        "month": month,
    }).execute().data


def get_categories(token):
    return supabase.postgrest.auth(token).rpc("get_categories", {}).execute().data


def get_user_summary(token):
    return supabase.postgrest.auth(token).rpc("get_user_summary", {}).execute().data
