from fastapi import APIRouter, HTTPException, Depends
from auth import verify_token
from services import transaction_service

router = APIRouter()


@router.get("/dashboard/summary")
def get_user_summary(token: str = Depends(verify_token)):
    try:
        return transaction_service.get_user_summary(token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
