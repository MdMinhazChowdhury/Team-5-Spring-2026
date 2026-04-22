#---- Testing Protected User Route ----#
def test_user_success(client, token):
    response = client.get('/user', headers={ #Sends a GET request to the user endpoint with the authorization header
        "Authorization": f'Bearer {token}' #Includes the token in the Authorization header
    })

    assert response.status_code == 200 #Asserts that the response status code is 200 OK
    data = response.json() #Parses the JSON response
    assert 'id' in data #Asserts that the user ID is returned in the response
    assert 'email' in data #Asserts that the email is returned in the response


def test_user_no_token(client):
    response = client.get('/user') #Sends a GET request to the user endpoint without an authorization header
    assert response.status_code == 401 #Should return 401  Unauthorized for missing token

def test_user_invalid_token(client):
    response = client.get('/user', headers={ #Sends a GET request to the user endpoint with an invalid token
        'Authorization': 'Bearer intentonallyinvalidtoken123' #Intentionally invalid token
    })
    assert response.status_code == 401 #Should return 401 Unauthorized for invalid token