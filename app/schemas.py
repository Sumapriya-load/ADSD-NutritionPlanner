from pydantic import BaseModel, Field
from typing import List

class FoodItemBase(BaseModel):
    name: str

class FoodItemCreate(FoodItemBase):
    pass

class FoodItem(FoodItemBase):
    id: int
    calories: float
    protein: float
    carbs: float
    fat: float

    class Config:
        orm_mode = True

class MealLog(BaseModel):
    user_id: str = Field(...)
    food_id: int
    quantity: float

class MealLogOut(MealLog):
    id: str
