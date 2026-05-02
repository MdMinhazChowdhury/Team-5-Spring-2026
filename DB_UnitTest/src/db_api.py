from typing import Any, Dict, List, Optional
import datetime


class DbClient:
    """Abstract DB client – real one will call Supabase, stub will be used in tests."""
    def rpc(self, func_name: str, params: Dict[str, Any]) -> Any:
        raise NotImplementedError


class FinanceRepository:
    def __init__(self, db: DbClient):
        self.db = db

    # ---------- ACCOUNTS ----------

    def create_account(self, initial_balance: float, account_type_id: int) -> int:
        return self.db.rpc("create_account", {
            "initial_balance": initial_balance,
            "account_type_id": account_type_id,
        })

    def delete_account(self, account_id: int) -> None:
        self.db.rpc("delete_account", {
            "account_id": account_id,
        })

    def update_account(self, account_id: int, account_type_id: int) -> None:
        self.db.rpc("update_account", {
            "account_id": account_id,
            "account_type_id": account_type_id,
        })

    def update_account_balance(self, account_id: int, new_balance: float) -> None:
        self.db.rpc("update_account_balance", {
            "account_id": account_id,
            "new_balance": new_balance,
        })

    def get_account_by_id(self, account_id: int) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_account_by_id", {
            "account_id": account_id,
        })
        return rows[0] if rows else None

    def get_accounts(self) -> List[Dict[str, Any]]:
        return self.db.rpc("get_accounts", {})

    def get_account_overview(self, account_id: int) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_account_overview", {
            "account_id": account_id,
        })
        return rows[0] if rows else None

    def get_balance_summary(self) -> float:
        return self.db.rpc("get_balance_summary", {})

    def get_account_types(self) -> List[Dict[str, Any]]:
        return self.db.rpc("get_account_types", {})

    # ---------- GOALS ----------

    def create_financial_goal(self, goal_name: str, goal_end: datetime.date,
                              end_goal_amount: float) -> str:
        return self.db.rpc("create_financial_goal", {
            "goal_name": goal_name,
            "goal_end": goal_end,
            "end_goal_amount": end_goal_amount,
        })

    def delete_financial_goal(self, goal_id: str) -> None:
        self.db.rpc("delete_financial_goal", {
            "goal_id": goal_id,
        })

    def get_financial_goals(self) -> List[Dict[str, Any]]:
        return self.db.rpc("get_financial_goals", {})

    def get_goal_by_id(self, goal_id: str) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_goal_by_id", {
            "goal_id": goal_id,
        })
        return rows[0] if rows else None

    def get_goal_progress(self, goal_id: str) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_goal_progress", {
            "goal_id": goal_id,
        })
        return rows[0] if rows else None

    def update_financial_goal(self, goal_id: str, name: str,
                              end_date: datetime.date, end_goal_amount: float) -> None:
        self.db.rpc("update_financial_goal", {
            "goal_id": goal_id,
            "name": name,
            "end_date": end_date,
            "end_goal_amount": end_goal_amount,
        })

    def update_goal_progress(self, goal_id: str, amount: float) -> None:
        self.db.rpc("update_goal_progress", {
            "goal_id": goal_id,
            "amount": amount,
        })

    # ---------- TRANSACTIONS ----------

    def create_transaction(self, account_id: int, amount: float,
                           category_id: int, date_of_transaction: datetime.date) -> int:
        return self.db.rpc("create_transaction", {
            "account_id": account_id,
            "amount": amount,
            "category_id": category_id,
            "date_of_transaction": date_of_transaction,
        })

    def delete_transaction(self, transaction_id: int) -> None:
        self.db.rpc("delete_transaction", {
            "transaction_id": transaction_id,
        })

    def update_transaction(self, transaction_id: int, amount: float,
                           category_id: int, account_id: int,
                           date: datetime.date) -> None:
        self.db.rpc("update_transaction", {
            "transaction_id": transaction_id,
            "amount": amount,
            "category_id": category_id,
            "account_id": account_id,
            "date": date,
        })

    def get_transaction_by_id(self, transaction_id: int) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_transaction_by_id", {
            "transaction_id": transaction_id,
        })
        return rows[0] if rows else None

    def get_transactions(self, account_id: int) -> List[Dict[str, Any]]:
        return self.db.rpc("get_transactions", {
            "account_id": account_id,
        })

    def get_transactions_by_date(self, start_date: datetime.date,
                                 end_date: datetime.date) -> List[Dict[str, Any]]:
        return self.db.rpc("get_transactions_by_date", {
            "start_date": start_date,
            "end_date": end_date,
        })

    def get_recent_transactions(self, limit_count: int) -> List[Dict[str, Any]]:
        return self.db.rpc("get_recent_transactions", {
            "limit_count": limit_count,
        })

    def get_spending_by_category(self, start_date: datetime.date,
                                 end_date: datetime.date) -> List[Dict[str, Any]]:
        return self.db.rpc("get_spending_by_category", {
            "start_date": start_date,
            "end_date": end_date,
        })

    def get_monthly_income(self, year: int, month: int) -> float:
        return self.db.rpc("get_monthly_income", {
            "year": year,
            "month": month,
        })

    def get_monthly_spending(self, year: int, month: int) -> float:
        return self.db.rpc("get_monthly_spending", {
            "year": year,
            "month": month,
        })

    # ---------- USER ----------

    def get_user_info(self) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_user_info", {})
        return rows[0] if rows else None

    def get_user_summary(self) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_user_summary", {})

        if not isinstance(rows, list):
            return None
        if len(rows) == 0:
            return None

        return rows[0]

    def update_user_info(self, first_name: str, last_name: str, email: str) -> None:
        self.db.rpc("update_user_info", {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
        })

    # ---------- CATEGORIES ----------

    def get_categories(self) -> List[Dict[str, Any]]:
        return self.db.rpc("get_categories", {})

    def get_category_by_id(self, category_id: int) -> Optional[Dict[str, Any]]:
        rows = self.db.rpc("get_category_by_id", {
            "category_id": category_id,
        })
        return rows[0] if rows else None

    # ---------- BUDGETS ----------

    def get_budgets(self, year: int, month: int):
        return self.db.rpc("get_budgets", {
            "p_year": year,
            "p_month": month,
        })

    def upsert_budget(self, category_id: int, monthly_limit: float, month: str):
        return self.db.rpc("upsert_budget", {
            "p_category_id": category_id,
            "p_monthly_limit": monthly_limit,
            "p_month": month,
        })

    def delete_budget(self, budget_id: str):
        return self.db.rpc("delete_budget", {
            "p_budget_id": budget_id,
        })
