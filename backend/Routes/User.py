from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from supabase_client import supabase
from auth import verify_token #Imports the token verification function from the auth.py file to validate user tokens for protected routes.

router = APIRouter()


class UpdateUserRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


@router.get("/user") #Defines a GET route for the user endpoint
def get_current_user(token: str = Depends(verify_token)): #Depends runs verify_token automatically and passes the token in.
    try:
        user = supabase.auth.get_user(token) #Calls Supabase's get_user function that validates the token and gets the user's info.
        metadata = user.user.user_metadata or {}

        return{
            "email": user.user.email, #Returns the user's email.
            "id": user.user.id, #Returns the user's unique Supabase ID.
            "first_name": metadata.get("first_name", ""), #Returns the user's first name from metadata.
            "last_name": metadata.get("last_name", ""), #Returns the user's last name from metadata.
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") #Returns a 401 Unauthorized error if the token is invalid or expired.


@router.put("/user") #Defines a PUT route to update user profile
def update_current_user(request: UpdateUserRequest, token: str = Depends(verify_token)):
    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id

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
            update_data["user_metadata"] = metadata_update

        supabase.auth.admin.update_user_by_id(user_id, update_data)

        return {"message": "Profile updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
