#This file defines a function to verify a user's token to ensure their correct information is given. This will be incorporated in almost all routes besides login and signup.
from fastapi import HTTPException, Header, Depends
from supabase_client import supabase
from typing import Optional


def verify_token(authorization: Optional[str] = Header(None)): #Reads the authorization header
    if not authorization or not authorization.startswith("Bearer "): #Checks if the authorization header is present and starts with "Bearer "
        raise HTTPException(status_code=401, detail="Missing or invalid authorization token") #Returns a 401 Unauthorized error if the token is missing or invalid
    token = authorization.split(" ")[1] #Extracts the token after 'Bearer '

    try:
        user = supabase.auth.get_user(token) #Validates token with Supabase
        return token #Returns the token for use in the routes
    except Exception:
        raise HTTPException(status_code=401, detail = "Missing or Invalid authorization token")
    
    