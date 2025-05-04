# Smart Diet & Nutrition Planner Backend

## Overview
This FastAPI application provides endpoints for searching nutritional information and logging meals, using PostgreSQL for structured food data and MongoDB for user meal logs.

## Features
- Search for foods in local DB, with USDA API fallback
- Log meals to MongoDB

## Tech Stack
- FastAPI, SQLAlchemy (PostgreSQL), Motor (MongoDB), Pydantic, HTTPX

## Setup

1. Clone the repo.
2. Create and activate a virtual environment.
3. Install dependencies:
   pip install -r requirements.txt
4. Set environment variables:
   - POSTGRES_URL (e.g., postgresql+asyncpg://user:password@localhost/dbname)
   - MONGO_URL (e.g., mongodb://localhost:27017)
   - USDA_API_KEY
5. Start the server:
   uvicorn app.main:app --reload
