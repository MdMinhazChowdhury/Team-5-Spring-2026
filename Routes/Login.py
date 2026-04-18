#This code defines a login route for a FastAPI application that uses Supabase for authentication. It includes error handling for invalid login attempts and returns a JWT token upon successful authentication.

from fastapi import APIRouter, HTTPException #APIRouter groups routes and HTTPException returns errors
from pydantic import BaseModel #BaseModel is used to define data models for request and response bodies
from supabase_client import supabase 

router = APIRouter() #Creates an instance of the APIRouter class to define routes for the login functionality

class LoginRequest(BaseModel): #Establishes the structure of the login request
    email: str
    password: str

@router.post("/login") #Defines a POST route for the login endpoint
def login(request: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({ #Calls Supabase authenticator to verify email and password.
            "email": request.email, #Passes the email from the login request to the Supabase authentication function
            "password": request.password  #Passes the password from the login request to the Supabase authentication function   
        })

        jwt_token = response.session.access_token #Retrieves the JWT token from the authentication response. This token is signed by Supabase and expires based on SupaBase project settings.

        return{
            "access_token": jwt_token, #Returns the Supabase JWT to the client 
            "token_type": "bearer", #Indicates to the client that this is a bearer token.
            "email": response.user.email #Returns the logged-in user's email to the client.
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password") #Returns a 401 Unauthorized error if the email or password is invalid.
