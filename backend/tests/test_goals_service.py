from services.goals_service import get_financial_goals, create_financial_goal, update_financial_goal, delete_financial_goal

created_goal_id = None #Variable that stores goal_id after creation for use in other tests

# ---- Service Tests ---- #
def test_get_financial_goals(token):
    result = get_financial_goals(token)
    assert result is not None
    assert isinstance(result, list)

def test_create_financial_goal(token):
    global created_goal_id #Access the shared created_goal_id variable
    result = create_financial_goal(
        token = token,
        name = "Buying Car",
        end_date = "2027-01-01",
        target_amount = 15000.00,
    )
    assert result is not None
    created_goal_id = result #Saves the returned goal_id for next tests
    assert created_goal_id is not None #Confirms that the ID was obtained again


def test_update_financial_goal(token):
    assert created_goal_id is not None #Ensures create ran first
    result = update_financial_goal(
        token,
        goal_id = created_goal_id,
        name = "Buying Different Car",
        end_date = "2027-03-06",
        target_amount = 12500.00
    )
    assert result is not None


def test_delete_financial_goal(token):
    assert created_goal_id is not None
    result = delete_financial_goal(
        token,
        goal_id = created_goal_id #Uses teh ID from create test
    )
    assert result is not None

