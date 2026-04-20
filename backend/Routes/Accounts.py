from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase_client import supabase
from auth import verify_token
from services import accounts_service

router = APIRouter()


class AccountCreate(BaseModel):
    account_balance: float
    account_type_id: int  # 1=Checking, 2=Savings


@router.get("/accounts")
def get_accounts(token: str = Depends(verify_token)):
    try:
        user_id = supabase.auth.get_user(token).user.id
        return accounts_service.fetch_accounts(token, user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/accounts")
def create_account(request: AccountCreate, token: str = Depends(verify_token)):
    try:
        if request.account_type_id not in accounts_service.ACCOUNT_TYPES:
            raise HTTPException(status_code=400, detail="Invalid account type. Use 1 for Checking or 2 for Savings.")
        return accounts_service.create_account(token, request.account_balance, request.account_type_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/accounts/{account_id}")
def delete_account(account_id: int, token: str = Depends(verify_token)):
    try:
        accounts_service.delete_account(token, account_id)
        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
