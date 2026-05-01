from fastapi.testclient import TestClient
from main import app

created_budget_id = None

# ---- GET /budgets tests ---- #
def test_get_budgets_success(client, token):
    response = client.get("/budgets", params= {"year": 2027, "month": 1}, headers= {"Authorization": f"Bearer {token}"}) #Sends a GET request to /budgets. Attach token in header
    assert response.status_code == 200 #Check sucess response
    assert isinstance(response.json(), list) #Check response in a list

def test_get_budgets_no_token(client):
    response = client.get("/budgets", params= {"year": 2027, "month": 1})
    assert response.status_code == 401 #Should return 401 error for Unauthorized token

def test_get_budgets_missing_params(client, token):
    response = client.get("/budgets", headers= {"Authorization": f"Bearer {token}"})
    assert response.status_code == 422 #Should return a 422 Validation Error


# ---- POST /budgets tests ---- #
def test_upsert_budget_success(client, token):
    global created_budget_id
    response = client.post("/budgets", json={ #Creates the budget
        "category_id": 1,
        "monthly_limit": 250.00,
        "month": "2027-01-01"
    }, headers= {"Authorization": f"Bearer {token}"})
    assert response.status_code == 200  
    

    get_response = client.get("/budgets", params= {"year": 2027, "month": 1}, headers= {"Authorization":f"Bearer {token}"}) #Get budgets for the month. Since the upsert doesn't return an ID, we need to fetch budgets to get it

    assert get_response.status_code == 200
    budgets = get_response.json() #Parse response body
    assert len(budgets) > 0 #Verfies that at least 1 budget exists
    created_budget_id = budgets[0]["budget_id"] #Grabs the ID from the first result
    assert created_budget_id is not None #Confirms we got a real ID
    

def test_upsert_budget_update(client, token):
    response = client.post("/budgets", json={
        "category_id": 1,
        "monthly_limit": 500.00,
        "month": "2027-01-01"
    }, headers= {"Authorization": f"Bearer {token}"})
    assert response.status_code == 200

def test_upsert_budget_no_token(client):
    response = client.post("/budgets", json={
        "category_id": 1,
        "monthly_limit": 500.00,
        "month": "2027-01-01"
    })
    assert response.status_code == 401


def test_upsert_budget_missing_field(client, token):
    response = client.post("/budgets", json={
        "category_id": 1,
        "month": "2027-01-01"
    }, headers= {"Authorization": f"Bearer {token}"})
    assert response.status_code == 422


# ---- DELETE /budgets tests ---- #
def test_delete_budget_success(client, token):
    assert created_budget_id is not None
    response = client.delete(
        f"/budgets/{created_budget_id}",
        headers= {"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Budget Successfully Deleted!"

def test_delete_budget_no_token(client):
    response = client.delete("/budgets/some-fake-uuid")
    assert response.status_code == 401