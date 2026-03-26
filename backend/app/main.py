from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config.settings import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import ResponseValidationError, RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request, exc):
    logger.error(f"Request Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Input Validation Error", "errors": exc.errors()}
    )

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
from app.routers import user, portfolio, analysis, news, jargon, recommendations, tasks, geopolitics

app.include_router(user.router)
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(news.router, prefix="/api/v1/news", tags=["news"])
app.include_router(geopolitics.router, prefix="/api/v1/news", tags=["geopolitics"])
app.include_router(jargon.router, prefix="/api/v1/jargon", tags=["jargon"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])

# Include GraphQL Router
from strawberry.fastapi import GraphQLRouter
from app.graphql.schema import schema

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

