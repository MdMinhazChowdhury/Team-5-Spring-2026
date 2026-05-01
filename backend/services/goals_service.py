from supabase_client import supabase

def get_financial_goals(token: str):
    return supabase.postgrest.auth(token).rpc("get_financial_goals", {}).execute().data #Authenticates the request with the user's token and calls the "get_financial_goals" RPC function in the database with the necessary parameters. The ".execute().data" part executes the RPC call and retrieves the resulting data, which is then returned to the caller.

def create_financial_goal(token: str, name: str, end_date: str, target_amount: float): 
    return supabase.postgrest.auth(token).rpc("create_financial_goal", { 
        "goal_name": name,
        "goal_end": end_date,
        "end_goal_amount": target_amount,
    }).execute().data


def update_financial_goal(token: str, goal_id: str, name: str, end_date: str, target_amount: float):
    return supabase.postgrest.auth(token).rpc("update_financial_goal", {
        "goal_id": goal_id,
        "name": name,
        "end_date": end_date,
        "end_goal_amount": target_amount
    }).execute().data


def delete_financial_goal(token: str, goal_id: str):
    return supabase.postgrest.auth(token).rpc("delete_financial_goal", {"goal_id": goal_id}).execute().data