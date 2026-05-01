from services.budget_service import get_budgets, upsert_budget, delete_budget

created_budget_id = None #Stores budget_id after creation, so we can use for deletion test

# ---- Service Tests ---- #
def test_get_budgets(token):
    result = get_budgets(
        token = token,
        year = 2026,
        month = 4
    )
    assert result is not None
    assert isinstance(result, list)


def test_upsert_budget(token):
    global created_budget_id #Access the shared created_budget_id variable 
    result = upsert_budget(
        token = token,
        category_id = 1,
        monthly_limit = 250.00, 
        month = "2027-01-01"
    )

    budgets = get_budgets(token=token, year = 2027, month = 1)
    print(f"\nBudgets response = {budgets}")
    assert budgets is not None
    assert len(budgets) > 0
    created_budget_id = budgets[0]["budget_id"]
    assert created_budget_id is not None



def test_delete_budget(token):
    assert created_budget_id is not None #Ensures upsert ran first
    result = delete_budget(
        token = token,
        budget_id = created_budget_id #Uses the budget id from the upsert test
    )
    assert result is not None