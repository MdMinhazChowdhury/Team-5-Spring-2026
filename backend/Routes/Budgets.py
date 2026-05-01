from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from auth import verify_token
from services import budget_service

router = APIRouter()

class UpsertBudgetRequest(BaseModel): #Structure of the upsert budget request
    category_id: int
    monthly_limit: float
    month: str

# ---- Routes ---- #
@router.get("/budgets") #GET Route to fetch all budgets
def get_budgets(year: int, month: int, token: str = Depends(verify_token)):
    try:
        return budget_service.get_budgets( #Returns Service Function
            token,
            year,
            month
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/budgets") #POST Route to create or update a budget
def upsert_budget(request: UpsertBudgetRequest, token: str = Depends(verify_token)):
    try:
        budget_service.upsert_budget( #Calls Service Function
            token,
            request.category_id, #Pass category ID
            request.monthly_limit, #Pass spending limit
            request.month #Pass month
        )
        return {"message": "Budget Upserted Successfully!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/budgets/{p_budget_id}") #DELETE Route to delete a specified budget
def delete_budget(p_budget_id: str, token: str = Depends(verify_token)):
    try:
        budget_service.delete_budget(token, p_budget_id)
        return {"message": "Budget Successfully Deleted!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))