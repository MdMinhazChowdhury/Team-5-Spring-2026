from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import date
from auth import verify_token
from services import transaction_service

router = APIRouter()


class CreateTransactionRequest(BaseModel):
    account_id: int
    amount: float
    category_id: int
    date_of_transaction: date


class UpdateTransactionRequest(BaseModel):
    amount: float
    category_id: int
    account_id: int
    date: date


@router.get("/transactions")
def get_transactions(account_id: Optional[int] = None, limit: int = 50, token: str = Depends(verify_token)):
    try:
        return transaction_service.get_transactions(token, account_id, limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/transactions")
def create_transaction(request: CreateTransactionRequest, token: str = Depends(verify_token)):
    try:
        new_id = transaction_service.create_transaction(
            token, request.account_id, request.amount, request.category_id, request.date_of_transaction
        )
        return {"transaction_id": new_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/transactions/{transaction_id}")
def update_transaction(transaction_id: int, request: UpdateTransactionRequest, token: str = Depends(verify_token)):
    try:
        transaction_service.update_transaction(
            token, transaction_id, request.amount, request.category_id, request.account_id, request.date
        )
        return {"message": "Transaction updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, token: str = Depends(verify_token)):
    try:
        transaction_service.delete_transaction(token, transaction_id)
        return {"message": "Transaction deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions/by-date")
def get_transactions_by_date(start_date: date, end_date: date, token: str = Depends(verify_token)):
    try:
        return transaction_service.get_transactions_by_date(token, start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions/spending-by-category")
def get_spending_by_category(start_date: date, end_date: date, token: str = Depends(verify_token)):
    try:
        return transaction_service.get_spending_by_category(token, start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions/monthly-spending")
def get_monthly_spending(year: int, month: int, token: str = Depends(verify_token)):
    try:
        return {"total": transaction_service.get_monthly_spending(token, year, month)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions/monthly-income")
def get_monthly_income(year: int, month: int, token: str = Depends(verify_token)):
    try:
        return {"total": transaction_service.get_monthly_income(token, year, month)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
