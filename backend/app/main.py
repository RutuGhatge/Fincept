from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import portfolio, analysis, news, jargon
from app.db.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings
import logging

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import ResponseValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(ResponseValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Response Validation Error", "errors": str(exc.errors())}
    )

# Root API
@app.get("/")
def read_root():
    return {
        "message": "Investment Intelligence API",
        "version": settings.VERSION,
        "status": "active"
    }

from app.db.database import db

@app.on_event("startup")
async def startup_db_client():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.disconnect()

# Include REST Routers
from app.routers import user
from app.routers import portfolio

app.include_router(user.router)
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])

# Include GraphQL Router
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

