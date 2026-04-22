#---- Testing Signup Route ----#
def test_signup_success(client, fresh_user):
    response = client.post('/signup', json={ #Sends a POST request to the signup endpoint with test user data
        "first_name": fresh_user['first_name'],
        "last_name": fresh_user['last_name'],
        "email": fresh_user['email'],
        "password": fresh_user['password']
    })

    assert response.status_code == 200 #Asserts that the response status code is 200 OK
    data = response.json() #Parses the JSON response
    assert data['message'] == 'Signup successful' #Asserts that the success message is correct
    assert data['email'] == fresh_user['email'] #Asserts that the returned email matches the fresh user email
    assert data['first_name'] == fresh_user['first_name'] #Asserts that the returned first name matches the fresh user first name
    assert data['last_name'] == fresh_user['last_name'] #Asserts that the returned last name matches the fresh user last name


def test_signup_duplicate_email(client, test_user):
    response = client.post('/signup', json={ #Attempts to sign up with the same email again
        "first_name": test_user['first_name'],
        "last_name": test_user['last_name'],
        "email": test_user['email'],
        "password": test_user['password']
    })
    assert response.status_code == 400 #Asserts that the response status code is 400 Bad Request for duplicate email


def test_signup_missing_field(client, test_user):
    response = client.post('/signup', json={ #Attempts to sign up with a missing field (last_name)
        "first_name": test_user['first_name'],
        "email": test_user['email'],
        "password": test_user['password']
    })
    assert response.status_code == 422 #If working, should return 422 Validation error