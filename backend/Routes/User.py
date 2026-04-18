from fastapi import APIRouter, HTTPException, Depends, Header
from supabase_client import supabase
from auth import verify_token #Imports the token verification function from the auth.py file to validate user tokens for protected routes.

router = APIRouter()

class UserCreation:
    first_name: str
    last_name: str
    email: str


@router.get("/user") #Defines a GET route for the user endpoint
def get_current_user(token: str = Depends(verify_token)): #Depends runs verify_token automatically and passes the user_id in.
    try:
        user = supabase.auth.get_user(token) #Calls Supabase's get_user function that validates the token and gets the user's info.

        return{
            "email":user.user.email, #Returns the user's email.
            "id": user.user.id #Returns the user's unique Supabase ID.
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token.") #Returns a 401 Unauthorized error if the token is invalid or expired.  