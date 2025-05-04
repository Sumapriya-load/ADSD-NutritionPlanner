from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import os

load_dotenv() 
DATABASE_URL = os.getenv("POSTGRES_URL")


SQLALCHEMY_DATABASE_URL = os.getenv("POSTGRES_URL", "postgresql+asyncpg://user:password@localhost/dbname")
MONGODB_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Mongo client
mongo_client = AsyncIOMotorClient(MONGODB_URL)
db = mongo_client.smart_diet

async def get_sql_session():
    async with AsyncSessionLocal() as session:
        yield session

async def get_mongo_collection():
    yield db.meal_logs
