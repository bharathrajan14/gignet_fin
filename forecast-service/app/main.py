import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import (
    ForecastRequest,
    ForecastResponse,
    ProblemPredictRequest,
    ProblemPredictResponse
)
from app.model import DemandForecastModel
from app.gap_analyzer import analyze_workforce_gap
from app.problem_classifier import classifier_instance

logger = logging.getLogger("gignet.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model ONCE during FastAPI startup
    try:
        logger.info("Initializing DistilBERT Problem Classification Model at startup...")
        classifier_instance.load()
        logger.info(
            f"DistilBERT model loaded in {classifier_instance.load_time_seconds:.2f}s "
            f"(Status: {'ready' if classifier_instance.is_loaded else 'failed'})"
        )
    except Exception as e:
        logger.error(f"Failed to load model on startup: {str(e)}", exc_info=True)
    yield

app = FastAPI(
    title="GIGNET Demand Forecasting & ML Problem Inference Service",
    description="SIH26089: CPU inference service for DistilBERT problem classification and workforce forecasting.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_engine = DemandForecastModel()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "GIGNET ML Inference & Demand Forecasting Microservice",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "predict_problem": "/predict-problem",
            "predict_demand": "/predict-demand"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "modelLoaded": classifier_instance.is_loaded,
        "modelType": "distilbert",
        "framework": "pytorch"
    }

@app.post("/predict-problem", response_model=ProblemPredictResponse)
def predict_problem(req: ProblemPredictRequest):
    """
    Classify natural-language customer problem description into a canonical GIGNET subSkillId.
    """
    try:
        result = classifier_instance.predict(req.description, top_k=3)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction error for input '{req.description}': {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/predict-demand", response_model=ForecastResponse)
def predict_demand(req: ForecastRequest):
    try:
        predictions = model_engine.fit_and_predict(
            category=req.service_category,
            history=req.historical_daily_demand or [],
            horizon_days=req.horizon_days
        )
        response = analyze_workforce_gap(
            cooperative_id=req.cooperative_id,
            cooperative_name=req.cooperative_name,
            service_category=req.service_category,
            available_workforce=req.available_workforce,
            predictions=predictions
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
