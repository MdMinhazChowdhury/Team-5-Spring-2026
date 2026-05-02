
import datetime
from src.db_api import FinanceRepository
from .conftest import DbClientStub


def test_create_transaction_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {
        "account_id": 1,
        "amount": -50.0,
        "category_id": 2,
        "date_of_transaction": datetime.date(2025, 1, 1),
    }
    stub.set_fake_result("create_transaction", params, 101)

    new_id = repo.create_transaction(
        account_id=1,
        amount=-50.0,
        category_id=2,
        date_of_transaction=datetime.date(2025, 1, 1),
    )

    assert new_id == 101
    assert ("create_transaction", params) in stub.calls


def test_get_transactions_by_date_sunny():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {
        "start_date": datetime.date(2025, 1, 1),
        "end_date": datetime.date(2025, 1, 31),
    }
    fake_rows = [
        {
            "TransactionID": 1,
            "Trans_Total": -20.0,
            "CategoryID": 2,
            "AccountID": 1,
            "DateOfTransaction": datetime.date(2025, 1, 10),
        }
    ]
    stub.set_fake_result("get_transactions_by_date", params, fake_rows)

    result = repo.get_transactions_by_date(
        datetime.date(2025, 1, 1),
        datetime.date(2025, 1, 31),
    )

    assert len(result) == 1
    assert result[0]["Trans_Total"] == -20.0

#RAINY DAY CASE

def test_create_transaction_negative_amount():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {
        "account_id": 1,
        "amount": -999999,
        "category_id": 2,
        "date_of_transaction": datetime.date(2025, 1, 1),
    }
    stub.set_fake_result("create_transaction", params, None)

    result = repo.create_transaction(
        1, -999999, 2, datetime.date(2025, 1, 1)
    )

    assert result is None

def test_get_transaction_by_id_empty_list():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {"transaction_id": 123}
    stub.set_fake_result("get_transaction_by_id", params, [])

    result = repo.get_transaction_by_id(123)

    assert result is None

#BOUNDARY CASE
def test_get_transactions_by_date_no_results():
    stub = DbClientStub()
    repo = FinanceRepository(stub)

    params = {
        "start_date": datetime.date(2025, 1, 1),
        "end_date": datetime.date(2025, 1, 2),
    }
    stub.set_fake_result("get_transactions_by_date", params, [])

    result = repo.get_transactions_by_date(
        datetime.date(2025, 1, 1),
        datetime.date(2025, 1, 2),
    )

    assert result == []
