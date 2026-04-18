This folder contains the FastAPI backend content for the Financial Tracker App

-- Setup --
1. Create a virtual environment: pyhon -m venv venv
2. Activate it venv\Scripst\activate
3. Install dependencies: pip install -r requirements.txt
4. Run the server: uvicorn main:app --reload

-- Routes Included --
1. POST /signup - Create a new user account
2. POST /login - Login and receive a JWT token
3. GET /user - Get info regarding the current logged in user


-- How to Test --
1. Make sure your virtual environment is activated. You can reactivavte by running venv\Scripst\activate
2. Make sure the test user does not already exist in Supabase before running tests. User's are unique so if one is already created, not all tests will successfully add a user.
3. Run all tests: pytest tests/test_routes.py -v

-- Environment Variables --
1. Create a .env file in the backend folder.
2. Use .evn.example. as a template. This ensures the sensitive URL and KEY are not stored.
3. Replace the placeholder values with actual Supabase credentials. (i.e. URL and KEY)
