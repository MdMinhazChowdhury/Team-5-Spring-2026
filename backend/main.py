from fastapi import FastAPI
from Routes import Login, Signup, User #Imports route files from the Routes Folder

app = FastAPI() #Creates an instance of the FastAPI class

app.include_router(Login.router) #Includes the Login router from the Login route file
app.include_router(Signup.router) #Includes the Signup router from the Signup route file
app.include_router(User.router) #Includes the User router from the User route file