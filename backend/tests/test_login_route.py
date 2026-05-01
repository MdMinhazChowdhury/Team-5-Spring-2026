#---- Testing Login Route ----#
def test_login(client, signup_user):
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with test user credentials
        "email": signup_user['email'],
        "password": signup_user['password']
    })

    assert response.status_code == 200 #Asserts that the response status code is 200 OK
    data = response.json() #Parses the JSON response
    assert 'access_token' in data #Asserts that the access token is present in the response
    assert data['token_type'] == 'bearer' #Asserts that the token type is correctly specified as bearer
    assert data['email'] == signup_user['email'] #Asserts that the returned email matches the test email


def test_login_invalid_password(client, signup_user):
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with invalid password
        "email": signup_user['email'],
        "password": 'badpw123' #Intentionally incorrect password
    })
    assert response.status_code == 401 #Should return 401 for unauthorized password

def test_login_invalid_email(client, signup_user):
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with invalid email
        "email": 'bademail@gmail.com', #Intentionally incorrect email.
        "password": signup_user['password']
    })
    assert response.status_code == 401 #Should return 401 for unauthorized email


def test_login_missing_field(client, signup_user):
    response = client.post('/login', json={ #Sends a POST request to the login endpoint with missing password field
        "email": signup_user['email']
    })
    assert response.status_code == 422 #Should return 422 Validation error for missing field