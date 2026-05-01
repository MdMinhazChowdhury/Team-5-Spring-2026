#This file defines the signup route for the FastAPI application, allowing users to create new accounts using Supabase for authentication and user management. It includes error handling to manage potential issues during the signup process.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase_client import supabase

router = APIRouter()

class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

@router.post("/signup") #Defines a POST route for the signup endpoint
def signup(request: SignupRequest):
    try:
        response = supabase.auth.sign_up({ #Calls Supabase authenticator to create a new user account with the provided info.
            "email": request.email.lower(), #Passes the email from the signup request.
            "password": request.password, #Passes the password from the signup request, Supabase handles hashing and security.
            "options": #Extra settings that allows Supabase's builtin functions to accept data beyond the email and password.
            {
                "data": # User Metadata - Supabase's storage for other user information.
                {
                    "first_name": request.first_name, #Grabs the user's first name from the request body and stores in the Supabase metadata.
                    "last_name": request.last_name #Grabs the user's last name from the request body and stores in the Supabase metadata.
                }
            }
        })

        return{
            "message": "Signup successful", #Success confirmation message returned to the client.
            "access_token": response.session.access_token, #Returns the session token for auto-login.
            "email": response.user.email.lower(), #Returns the user's email.
            "first_name": request.first_name, #Returns the user's first name.
            "last_name": request.last_name #Returns the user's last name.
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) #Returns a 400 Bad Request error if there was an issue with the signup process, such as an email already in use or invalid input.