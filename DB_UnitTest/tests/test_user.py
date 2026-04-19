
from src.db_api import FinanceRepository
from .conftest import DbClientStub


def test_get_user_info_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    fake_user = {
        "UserID": "00000000-0000-0000-0000-000000000001",
        "FirstName": "Kaylie",
        "LastName": "Thibodeaux",
        "Email": "kaylie@example.com",
    }
    stub.set_fake_result("get_user_info", params, [fake_user])

    result = repo.get_user_info()

    assert result["FirstName"] == "Kaylie"


def test_get_user_summary_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    fake_summary = {
        "total_balance": 500.0,
        "total_income": 1000.0,
        "total_spending": -500.0,
        "goal_count": 2,
        "total_goal_progress": 300.0,
    }
    stub.set_fake_result("get_user_summary", params, [fake_summary])

    result = repo.get_user_summary()

    assert result["total_balance"] == 500.0
    assert result["goal_count"] == 2


#RAINY DAY CASE
def test_get_user_info_returns_none():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    stub.set_fake_result("get_user_info", params, None)

    result = repo.get_user_info()

    assert result is None

def test_get_user_summary_wrong_structure():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    stub.set_fake_result("get_user_summary", params, {"bad": "data"})

    result = repo.get_user_summary()

    # Wrong structure should return None
    assert result is None


#BOUNDARY CASE
def test_get_user_summary_empty_list():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    stub.set_fake_result("get_user_summary", params, [])

    result = repo.get_user_summary()

    assert result is None
