from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.webhook import router as webhook_router
from app.api.auth import router as auth_router
from app.api.contacts import router as contacts_router
from app.api.messages import router as messages_router
from app.api.automations import router as automations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.APP_NAME} starting up — environment: {settings.ENVIRONMENT}")
    yield
    print(f"🛑 {settings.APP_NAME} shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="WhatsApp Business Automation SaaS for African SMEs",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(webhook_router, prefix=API_PREFIX, tags=["Webhook"])
app.include_router(auth_router, prefix=API_PREFIX, tags=["Auth"])
app.include_router(contacts_router, prefix=API_PREFIX, tags=["Contacts"])
app.include_router(messages_router, prefix=API_PREFIX, tags=["Messages"])
app.include_router(automations_router, prefix=API_PREFIX, tags=["Automations"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to the {settings.APP_NAME} API.",
        "docs": "/docs",
    }