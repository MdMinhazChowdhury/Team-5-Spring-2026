
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
