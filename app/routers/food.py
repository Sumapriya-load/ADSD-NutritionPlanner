from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .. import schemas, models
from ..database import get_sql_session
from typing import List
import httpx
import os
from collections import defaultdict

router = APIRouter(prefix="/food", tags=["food"])

@router.get("/search", response_model=List[schemas.FoodItem])
async def search_food(query: str, session: AsyncSession = Depends(get_sql_session)):
    print("🔍 Searching in DB for:", query)
    result = await session.execute(
        select(models.FoodItem).where(models.FoodItem.name.ilike(f"%{query}%"))
    )
    items = result.scalars().all()

    if items:
        print(f"✅ Found {len(items)} items in DB.")
        return items

    print("❌ Not found in DB. Fetching from USDA API...")
    async with httpx.AsyncClient() as client:
        api_key = os.getenv("USDA_API_KEY")
        print("🔑 Using API Key:", api_key)
        resp = await client.get(
            f"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={api_key}&query={query}"
        )
        data = resp.json()
        print("📦 Response from USDA:", data)

        unique_foods = defaultdict(lambda: {"calories": -1})

        for item in data.get("foods", []):
            try:
                name = item["description"].strip().upper()
                nutrients = item.get("foodNutrients", [])

                cal = nutrients[0]["value"] if len(nutrients) > 0 else 0
                protein = nutrients[1]["value"] if len(nutrients) > 1 else 0
                carbs = nutrients[2]["value"] if len(nutrients) > 2 else 0
                fat = nutrients[3]["value"] if len(nutrients) > 3 else 0

                if cal > unique_foods[name]["calories"]:
                    unique_foods[name] = {
                        "calories": cal,
                        "protein": protein,
                        "carbs": carbs,
                        "fat": fat
                    }

            except Exception as e:
                print("⚠️ Error parsing item:", e)
                continue

        foods = []
        for name, values in unique_foods.items():
            fi = models.FoodItem(
                name=name,
                calories=values["calories"],
                protein=values["protein"],
                carbs=values["carbs"],
                fat=values["fat"]
            )
            session.add(fi)
            foods.append(fi)

        await session.commit()
        print(f"✅ Added {len(foods)} new unique items from USDA.")
        return foods
