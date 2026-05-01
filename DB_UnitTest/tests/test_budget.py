from src.db_api import FinanceRepository
from .conftest import DbClientStub


# ---------------------------------------------------------
# SUNNY DAY TESTS
# ---------------------------------------------------------

def test_get_budgets_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"p_year": 2026, "p_month": 4}
    fake_result = [
        {
            "budget_id": "uuid-1",
            "category_id": 1,
            "category_title": "Food",
            "monthly_limit": 500.0,
            "spent": 120.0,
        },
        {
            "budget_id": "uuid-2",
            "category_id": 2,
            "category_title": "Gas",
            "monthly_limit": 200.0,
            "spent": 50.0,
        },
    ]

    stub.set_fake_result("get_budgets", params, fake_result)

    result = repo.get_budgets(2026, 4)

    assert len(result) == 2
    assert result[0]["category_title"] == "Food"
    assert ("get_budgets", params) in stub.calls


def test_upsert_budget_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {
        "p_category_id": 1,
        "p_monthly_limit": 300.0,
        "p_month": "2026-04-01",
    }

    stub.set_fake_result("upsert_budget", params, None)

    result = repo.upsert_budget(1, 300.0, "2026-04-01")

    assert result is None
    assert ("upsert_budget", params) in stub.calls


def test_delete_budget_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"p_budget_id": "uuid-123"}
    stub.set_fake_result("delete_budget", params, None)

    result = repo.delete_budget("uuid-123")

    assert result is None
    assert ("delete_budget", params) in stub.calls


# ---------------------------------------------------------
# RAINY DAY TESTS
# ---------------------------------------------------------

def test_get_budgets_returns_none():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"p_year": 2026, "p_month": 4}
    stub.set_fake_result("get_budgets", params, None)

    result = repo.get_budgets(2026, 4)

    assert result is None


def test_get_budgets_wrong_structure():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"p_year": 2026, "p_month": 4}
    stub.set_fake_result("get_budgets", params, {"unexpected": "value"})

    result = repo.get_budgets(2026, 4)

    assert isinstance(result, dict)


def test_upsert_budget_failure():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {
        "p_category_id": 1,
        "p_monthly_limit": 300.0,
        "p_month": "2026-04-01",
    }

    stub.set_fake_result("upsert_budget", params, {"error": "bad input"})

    result = repo.upsert_budget(1, 300.0, "2026-04-01")

    assert isinstance(result, dict)
    assert "error" in result


def test_delete_budget_failure():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"p_budget_id": "uuid-123"}
