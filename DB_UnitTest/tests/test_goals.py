
import datetime
from src.db_api import FinanceRepository
from .conftest import DbClientStub


def test_create_financial_goal_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {
        "goal_name": "Emergency Fund",
        "goal_end": datetime.date(2025, 12, 31),
        "end_goal_amount": 1000.0,
    }
    fake_goal_id = "00000000-0000-0000-0000-000000000001"
    stub.set_fake_result("create_financial_goal", params, fake_goal_id)

    goal_id = repo.create_financial_goal(
        "Emergency Fund",
        datetime.date(2025, 12, 31),
        1000.0,
    )

    assert goal_id == fake_goal_id


def test_get_goal_by_id_not_found():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"goal_id": "00000000-0000-0000-0000-000000000999"}
    stub.set_fake_result("get_goal_by_id", params, [])

    result = repo.get_goal_by_id(params["goal_id"])

    assert result is None

#RAINY DAY CASE

def test_get_goal_progress_returns_none():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"goal_id": "abc"}
    stub.set_fake_result("get_goal_progress", params, None)

    result = repo.get_goal_progress("abc")

    assert result is None

def test_get_financial_goals_wrong_structure():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    stub.set_fake_result("get_financial_goals", params, {"oops": "bad"})

    result = repo.get_financial_goals()

    assert isinstance(result, dict)

#BOUNDARY CASE
def test_get_financial_goals_empty():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {}
    stub.set_fake_result("get_financial_goals", params, [])

    result = repo.get_financial_goals()

    assert result == []
