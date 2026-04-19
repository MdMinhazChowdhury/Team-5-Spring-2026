from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Routes import Login, Signup, User, Transactions, Dashboard, Accounts #Imports route files from the Routes Folder

app = FastAPI() #Creates an instance of the FastAPI class

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(Login.router) #Includes the Login router from the Login route file
app.include_router(Signup.router) #Includes the Signup router from the Signup route file
app.include_router(User.router) #Includes the User router from the User route file
app.include_router(Transactions.router) #Includes the Transactions router
app.include_router(Dashboard.router) #Includes the Dashboard router
app.include_router(Accounts.router) #Includes the Accounts router