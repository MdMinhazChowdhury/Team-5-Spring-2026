import os #Imports the os module to interact with the operating system
from dotenv import load_dotenv #Imports the load_dotenv function from the dotenv library to load environment variables from a .env file
from supabase import create_client, Client #Imports the create_client function and Client class from the supabase library to create a Supabase client instance

load_dotenv() # Loads environment variables from a .env file

URL: str = os.getenv("SUPABASE_URL") # Retrieves the Supabase URL from environment variables
KEY: str = os.getenv("SUPABASE_KEY") # Retrieves the Supabase Key from environment variables


supabase: Client = create_client(URL, KEY) # Creates a Supabase client instance using the URL and Key