from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase_client import supabase
from auth import verify_token

router = APIRouter()

ACCOUNT_TYPES = {1: "Checking", 2: "Savings"}


class AccountCreate(BaseModel):
    account_balance: float
    account_type_id: int  # 1=Checking, 2=Savings


@router.get("/accounts") #Returns all accounts belonging to the authenticated user
def get_accounts(token: str = Depends(verify_token)):
    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        response = supabase.table("Account").select("*").eq("UserID", user_id).execute()

        accounts = []
        for row in response.data:
            accounts.append({
                "account_id": row["AccountID"],
                "account_balance": row["AccountBalance"],
                "account_type_id": row["AccountTypeID"],
                "account_type_name": ACCOUNT_TYPES.get(row["AccountTypeID"], "Unknown"),
            })

        return accounts

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/accounts") #Creates a new account for the authenticated user
def create_account(request: AccountCreate, token: str = Depends(verify_token)):
    try:
        if request.account_type_id not in ACCOUNT_TYPES:
            raise HTTPException(status_code=400, detail="Invalid account type. Use 1 for Checking or 2 for Savings.")

        result = supabase.postgrest.auth(token).rpc("create_account", {
            "initial_balance": request.account_balance,
            "account_type_id": request.account_type_id,
        }).execute()
        new_id = result.data

        return {
            "account_id": new_id,
            "account_balance": request.account_balance,
            "account_type_id": request.account_type_id,
            "account_type_name": ACCOUNT_TYPES.get(request.account_type_id, "Unknown"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/accounts/{account_id}") #Deletes an account owned by the authenticated user
def delete_account(account_id: int, token: str = Depends(verify_token)):
    try:
        supabase.postgrest.auth(token).rpc("delete_account", {
            "account_id": account_id,
        }).execute()

        return {"message": "Account deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
