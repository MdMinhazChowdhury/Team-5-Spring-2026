from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import date
from auth import verify_token
from services import goals_service

router = APIRouter()

class CreateGoalRequest(BaseModel): #Structure of the create goal request
    name: str
    end_date: date
    target_amount: float

class UpdateGoalRequest(BaseModel): #Structure of the update goal request
    name: str
    end_date: date
    target_amount: float

# ---- Routes ---- #

@router.get("/goals") #GET Route to fetch all goals
def get_goals(token: str = Depends(verify_token)): #Verifies token before proceeding
    try:
        return goals_service.get_financial_goals(token) #Calls the service function
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) #Returns error if something goes wrong
    
@router.post("/goals") #POST Route to create a new goal
def create_goal(request: CreateGoalRequest, token: str = Depends(verify_token)):
    try:
        new_id = goals_service.create_financial_goal( #Calls service function
            token,
            request.name, #Pass the name of the goal
            str(request.end_date), #Converts data to string
            request.target_amount #Pass target amount
        )
        return {"goal_id": new_id} #Returns the new goal id
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.put("/goals/{goal_id}") #PUT Route for updating a goal
def update_goal(goal_id: str, request: UpdateGoalRequest, token: str = Depends(verify_token)):
    try:
        goals_service.update_financial_goal(
            token,
            goal_id, #Pass goal ID from URL
            request.name,
            str(request.end_date),
            request.target_amount #Pass updated target amount
        )
        return {"message": "Goal Successfully Updated!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/goals/{goal_id}") #DELETE Route for deleting a goal
def delete_goal(goal_id: str, token: str = Depends(verify_token)): #The goal_id is the unique user id (uuid)
    try:
        goals_service.delete_financial_goal(token, goal_id)
        return {"message": "Goal Successfully Deleted!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))