from supabase_client import supabase

def get_budgets(token: str, year: int, month: int): 
    return supabase.postgrest.auth(token). rpc("get_budgets", { #Authenticates the request with the user's token and calls the "get_budgets" RPC function in the database with the necessary parameters.
        "p_year": year,
        "p_month": month
    }).execute().data 

def upsert_budget(token: str, category_id: int, monthly_limit: float, month: str):
    return supabase.postgrest.auth(token).rpc("upsert_budget", {
        "p_category_id": category_id,
        "p_monthly_limit": monthly_limit,
        "p_month": month
    }).execute().data

def delete_budget(token: str, budget_id: str):
    return supabase.postgrest.auth(token).rpc("delete_budget", {"p_budget_id": budget_id}).execute().data