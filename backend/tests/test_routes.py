import pytest #The framework used for testing
import time
from fastapi.testclient import TestClient #Simulates HTTP requests without running a server
from main import app

client = TestClient(app) #Creates a test client for the FastAPI app

#---- Data for testing ----#
Test_Email = f'testuser+{int(time.time())}@gmail.com'
Test_Password = 'TestPassword123!'
Test_First_Name = 'Test'
Test_Last_Name = 'User'


#---- Helper Function ----#
def get_token(): #Reusable function for creating new tokens for testing protected routes.
    response = client.post('/login', json={ #Login to get a token
        "email": Test_Email, #OAuth2 form sends email as username
        "password": Test_Password
    })
    return response.json()['access_token'] #Returns just the token string


#---- Testing Signup Route ----#
def test_signup_success():
    response = client.post('/signup', json={ #Sends a POST request to the signup endpoint with test user data
        "first_name": Test_First_Name,
        "last_name": Test_Last_Name,
        "email": Test_Email,
        "password": Test_Password
    })

    assert response.status_code == 200 #Asserts that the response status code is 200 OK
    data = response.json() #Parses the JSON response
    assert data['message'] == 'Signup successful' #Asserts that the success message is correct
    assert data['email'] == Test_Email #Asserts that the returned email matches the test email
    assert data['first_name'] == Test_First_Name #Asserts that the returned first name matches the test first name
    assert data['last_name'] == Test_Last_Name #Asserts that the returned last name matches the test last name

def test_signup_duplicate_email():
    response = client.post('/signup', json={ #Attempts to sign up with the same email again
        "first_name": Test_First_Name,
        "last_name": Test_Last_Name,
        "email": Test_Email,
        "password": Test_Password
    })
    assert response.status_code == 400 #Asserts that the response status code is 400 Bad Request for duplicate email


def test_signup_missing_field():
    response = client.post('/signup', json={ #Attempts to sign up with a missing field (last_name)
        "first_name": Test_First_Name,
        "email": Test_Email,
        "password": Test_Password 
    })
    assert response.status_code == 422 #If working, should return 422 Validation error


#---- Testing Login Route ----#
def test_login():
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with test user credentials
        "email": Test_Email, 
        "password": Test_Password
    })

    assert response.status_code == 200 #Asserts that the response status code is 200 OK
    data = response.json() #Parses the JSON response
    assert 'access_token' in data #Asserts that the access token is present in the response
    assert data['token_type'] == 'bearer' #Asserts that the token type is correctly specified as bearer
    assert data['email'] == Test_Email #Asserts that the returned email matches the test email


def test_login_invalid_password():
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with invalid password
        "email": Test_Email,
        "password": 'badpw123' #Intentionally incorrect password
    })
    assert response.status_code == 401 #Should return 401 for unauthorized password

def test_login_invalid_email():
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with invalid email
        "email": 'bademail@gmail.com', #Intentionally incorrect email.
        "password": Test_Password
    })
    assert response.status_code == 401 #Should return 401 for unauthorized email


def test_login_missing_field():
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with missing password field
        "email": Test_Email
    })
    assert response.status_code == 422 #Should return 422 Validation error for missing field

#---- Testing Protected User Route ----#
def test_user_success():
    token = get_token() #Gets a valid token using the helper function
    response = client.get('/user', headers={ #Sends a GET request to the user endpoint with the authorization header
        "Authorization": f'Bearer {token}' #Includes the token in the Authorization header
    })

    assert response.status_code == 200 #Asserts that the response status code is 200 OK
    data = response.json() #Parses the JSON response
    assert 'email' in data #Asserts that the email is returned in the response
    assert 'id' in data #Asserts that a user ID is returned in the response
    assert data['email'] == Test_Email #Asserts that the returned email matches the test email


def test_user_no_token():
    response = client.get('/user') #Sends a GET request to the user endpoint without an authorization header
    assert response.status_code == 401 #Should return 401  Unauthorized for missing token

def test_user_invalid_token():
    response = client.get('/user', headers={ #Sends a GET request to the user endpoint with an invalid token
        'Authorization': 'Bearer intentonallyinvalidtoken123' #Intentionally invalid token
    })
    assert response.status_code == 401 #Should return 401 Unauthorized for invalid token

