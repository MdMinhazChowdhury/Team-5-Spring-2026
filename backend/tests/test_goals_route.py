from fastapi.testclient import TestClient
from main import app

created_goal_id = None

# ---- GET /goals tests ---- #
def test_get_goals_success(client, token): #Token and Client come from conftest.py fixtures
    response = client.get("/goals", headers= { #Sends a GET request to /goals
        "Authorization": f"Bearer {token}" #Attach token in header
    })
    assert response.status_code == 200 #Check success response
    assert isinstance(response.json(), list) #Check response in a list

def test_get_goals_no_token(client): #Testing no token provided
    response = client.get("/goals")
    assert response.status_code == 401 #Should return 401 error for Unauthorized token


# ---- POST /goals tests ---- #
def test_create_goal_success(client, token):
    global created_goal_id #Access the shared created_global_id variable
    response = client.post("/goals", json={ #Sends POST request to /goals
        "name": "Buying a Car",
        "end_date": "2027-01-01",
        "target_amount": 15000.00
    }, headers = {
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    data = response.json() #Parse response body
    assert "goal_id" in data #Check that goal_id was returned
    created_goal_id = data["goal_id"] #Saves goal_id for update

def test_create_goal_no_token(client):
     response = client.post("/goals", json={ #Sends POST request with no token
         "name": "Buying a Car",
         "end_date": "2027-01-01",
         "target_amount": 15000.00
     })
     assert response.status_code == 401

def test_create_goal_missing_field(client, token):
    response = client.post("/goals", json={ #Sends POST request with missing field. Goal_end is intenionally missing
        "name": "Buying a Car",
        "target_amount": 15000.00
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 422 #Should return a 422 Validation Error 

# ---- PUT /goals/{goal_id} tests ---- #
def test_update_goal_success(client, token):
    assert created_goal_id is not None #Ensures that create ran first
    response = client.put(f"/goals/{created_goal_id}", json={ #Sends PUT request to /goals/{created_goal_id}
        "name": "Buying a Better Car", #Updated goal name
        "end_date": "2027-03-06", #Updated end date
        "target_amount": 12500.00 #Updated target amount
    }, headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Goal Successfully Updated!"


def test_update_goal_no_token(client):
    response = client.put(f"/goals/some-fake-id", json={ #Sends PUT request with no token
        "name": "Buying a Better Car",
        "end_date": "2027-03-06",
        "target_amount": 12500.00
    })
    assert response.status_code == 401


# ---- DELETE /goals/{goal_id} tests ---- #
def test_delete_goal_success(client, token):
    assert created_goal_id is not None 
    response = client.delete(f"/goals/{created_goal_id}", headers={  #Sends DELETE request
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Goal Successfully Deleted!"

def test_delete_goal_no_token(client):
    response = client.delete("/goals/some-fake-id") #Sends DELETE request with no token
    assert response.status_code == 401