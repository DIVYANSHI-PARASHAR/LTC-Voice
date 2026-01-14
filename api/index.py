"""
Vercel serverless function - FastAPI app entry point
This serves all API routes through a single FastAPI application
"""
import sys
import os

# Add backend directory to path so we can import from backend/app
backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, backend_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import calls
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="VitalStream Workflow API",
    description="Backend API for VitalStream healthcare workflow management with VAPI phone call integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration - allow all origins in production (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - router already has /calls prefix, so use /api prefix
app.include_router(calls.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "VitalStream Workflow API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "vitalstream-workflow-api",
    }
