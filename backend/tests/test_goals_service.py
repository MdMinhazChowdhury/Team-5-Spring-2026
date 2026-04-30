from services.goals_service import get_financial_goals, create_financial_goal, update_financial_goal, delete_financial_goal

created_goal_id = None

# ---- Service Tests ---- #
def test_get_financial_goals(token):
    result = get_financial_goals(token)
    assert result is not None
    assert isinstance(result, list)

def test_create_financial_goal(token):
    global created_goal_id
    result = create_financial_goal(
        token = token,
        goal_name = "Buying Car",
        goal_end = "2027-01-01",
        end_goal_amount = 15000.00,
    )
    assert result is not None
    created_goal_id = result
    assert created_goal_id is not None


def test_update_financial_goal(token):
    assert created_goal_id is not None
    result = update_financial_goal(
        token,
        goal_id = created_goal_id,
        name = "Buying Different Car",
        end_date = "2027-03-06",
        end_goal_amount = 12500.00
    )
    assert result is not None


def test_delete_financial_goal(token):
    assert created_goal_id is not None
    result = delete_financial_goal(
        token,
        goal_id = created_goal_id
    )
    assert result is not None

