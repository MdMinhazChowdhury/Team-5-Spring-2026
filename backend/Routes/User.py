import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from supabase_client import supabase, URL, KEY
from auth import verify_token

router = APIRouter()


class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


@router.get("/user")
def get_current_user(token: str = Depends(verify_token)):
    try:
        user = supabase.auth.get_user(token)
        metadata = user.user.user_metadata or {}

        return {
            "email": user.user.email,
            "id": user.user.id,
            "first_name": metadata.get("first_name", ""),
            "last_name": metadata.get("last_name", ""),
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")


@router.put("/user")
def update_current_user(request: UpdateUserRequest, token: str = Depends(verify_token)):
    try:
        update_data = {}
        if request.email:
            update_data["email"] = request.email
        if request.password:
            update_data["password"] = request.password

        metadata_update = {}
        if request.first_name is not None:
            metadata_update["first_name"] = request.first_name
        if request.last_name is not None:
            metadata_update["last_name"] = request.last_name
        if metadata_update:
            update_data["data"] = metadata_update

        response = httpx.patch(
            f"{URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": KEY,
                "Content-Type": "application/json",
            },
            json=update_data,
        )

        if not response.is_success:
            raise HTTPException(status_code=response.status_code, detail=response.json().get("message", "Update failed"))

        return {"message": "Profile updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
