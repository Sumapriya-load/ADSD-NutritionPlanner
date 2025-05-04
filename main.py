from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from .database import engine, Base
from .routers import food, log, meal

app = FastAPI(title="Smart Diet & Nutrition Planner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(food.router)
app.include_router(log.router)
app.include_router(meal.router)
