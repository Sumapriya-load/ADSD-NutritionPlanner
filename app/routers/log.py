from fastapi import APIRouter, Depends
from ..database import get_mongo_collection
from ..schemas import MealLog, MealLogOut

router = APIRouter(prefix="/logs", tags=["logs"])

@router.post("/", response_model=MealLogOut)
async def log_meal(meal: MealLog, collection=Depends(get_mongo_collection)):
    doc = meal.dict()
    result = await collection.insert_one(doc)
    return {**doc, "id": str(result.inserted_id)}
