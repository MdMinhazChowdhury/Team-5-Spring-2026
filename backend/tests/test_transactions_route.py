import pytest


@pytest.fixture(scope='session')
def account_id(client, token):
    response = client.post('/accounts', json={
        "account_balance": 1000.00,
        "account_type_id": 1
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    return response.json()['account_id']


@pytest.fixture(scope='session')
def transaction_id(client, token, account_id):
    response = client.post('/transactions', json={
        "account_id": account_id,
        "amount": 50.00,
        "category_id": 1,
        "date_of_transaction": "2026-04-23",
        "description": "Fixture transaction"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    return response.json()['transaction_id']


# ---- GET /transactions ----

def test_get_transactions_no_auth(client):
    response = client.get('/transactions')
    assert response.status_code == 401


def test_get_transactions_invalid_token(client):
    response = client.get('/transactions', headers={
        'Authorization': 'Bearer intentionallyinvalidtoken123'
    })
    assert response.status_code == 401


def test_get_transactions_success(client, token):
    response = client.get('/transactions', headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ---- POST /transactions ----

def test_create_transaction_success(client, token, account_id):
    response = client.post('/transactions', json={
        "account_id": account_id,
        "amount": 50.00,
        "category_id": 1,
        "date_of_transaction": "2026-04-23",
        "description": "Test transaction"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert 'transaction_id' in response.json()


def test_create_transaction_missing_field(client, token):
    response = client.post('/transactions', json={
        "amount": 50.00,
        "category_id": 1,
        "date_of_transaction": "2026-04-23"
        # missing required account_id
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 422


def test_create_transaction_no_auth(client):
    response = client.post('/transactions', json={
        "account_id": 1,
        "amount": 50.00,
        "category_id": 1,
        "date_of_transaction": "2026-04-23",
        "description": "Test"
    })
    assert response.status_code == 401


# ---- PUT /transactions/{id} ----

def test_update_transaction_success(client, token, account_id, transaction_id):
    response = client.put(f'/transactions/{transaction_id}', json={
        "amount": 75.00,
        "category_id": 1,
        "account_id": account_id,
        "date": "2026-04-23",
        "description": "Updated transaction"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_update_transaction_no_auth(client, transaction_id):
    response = client.put(f'/transactions/{transaction_id}', json={
        "amount": 75.00,
        "category_id": 1,
        "account_id": 1,
        "date": "2026-04-23"
    })
    assert response.status_code == 401


# ---- DELETE /transactions/{id} ----

def test_delete_transaction_success(client, token, transaction_id):
    response = client.delete(f'/transactions/{transaction_id}', headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200


def test_delete_transaction_no_auth(client, transaction_id):
    response = client.delete(f'/transactions/{transaction_id}')
    assert response.status_code == 401


# ---- GET /categories ----

def test_get_categories_success(client, token):
    response = client.get('/categories', headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert isinstance(response.json(), list)
