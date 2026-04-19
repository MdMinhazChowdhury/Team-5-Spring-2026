
from src.db_api import FinanceRepository
from .conftest import DbClientStub


def test_create_account_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"initial_balance": 100.0, "account_type_id": 1}
    stub.set_fake_result("create_account", params, 42)

    new_id = repo.create_account(100.0, 1)

    assert new_id == 42
    assert ("create_account", params) in stub.calls


def test_get_accounts_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    fake_accounts = [
        {
            "AccountID": 1,
            "AccountBalance": 250.0,
            "AccountTypeID": 1,
            "AccountTypeName": "Checking",
        },
        {
            "AccountID": 2,
            "AccountBalance": 500.0,
            "AccountTypeID": 2,
            "AccountTypeName": "Savings",
        },
    ]
    stub.set_fake_result("get_accounts", params, fake_accounts)

    result = repo.get_accounts()

    assert len(result) == 2
    assert result[0]["AccountTypeName"] == "Checking"


def test_get_account_by_id_not_found():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"account_id": 999}
    stub.set_fake_result("get_account_by_id", params, [])

    result = repo.get_account_by_id(999)

    assert result is None

#RAINY DAY CASE 

def test_get_account_by_id_returns_none():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"account_id": 5}
    stub.set_fake_result("get_account_by_id", params, None)

    result = repo.get_account_by_id(5)

    assert result is None

def test_get_accounts_wrong_structure():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    stub.set_fake_result("get_accounts", params, {"unexpected": "value"})

    result = repo.get_accounts()

    # Should return the raw value, even if wrong
    assert isinstance(result, dict)

def test_get_accounts_empty_list():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    stub.set_fake_result("get_accounts", params, [])

    result = repo.get_accounts()

    assert result == []
