import pytest #The framework used for testing
import time
from fastapi.testclient import TestClient #Simulates HTTP requests without running a server
from main import app


#---- Test Client Fixture ----#
@pytest.fixture(scope='session') #Creates a fixture that runs once per test session
def client():
    return TestClient(app) #Returns a test client instance for use in tests


#---- Shared Test User Data ----#
@pytest.fixture(scope='session') #Creates a fixture that runs once per test session
def test_user():
    return { #Returns a dictionary with test user data for use in tests
        "email": f'testuser+{int(time.time())}@gmail.com',
        "password": 'TestPassword123!',
        "first_name": 'Test',
        "last_name": 'User'
    }

@pytest.fixture
def fresh_user():
    import time
    return { #Returns a dictionary with test user data for use in tests
        "email": f'testuser+{int(time.time())}@gmail.com',
        "password": 'TestPassword123!',
        "first_name": 'Test',
        "last_name": 'User'
    }





#---- Signup Happens Once ----#
@pytest.fixture(scope = 'session')
def signup_user(client, test_user):
    client.post('/signup', json={ #Signs up the test user once for use in login and protected route tests
        "first_name": test_user['first_name'],
        "last_name": test_user['last_name'],
        "email": test_user['email'],
        "password": test_user['password']
    },
    )
    return test_user

@pytest.fixture(scope='session') #Creates a fixture that runs once per test session
def token(client, signup_user): #Fixture to get a valid token for testing protected routes
    response = client.post('/login', json={ #Logs in to get a token
        "email": signup_user['email'],
        "password": signup_user['password']
    },
    )
    return response.json()['access_token'] #Returns the access token for use in tests

