from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import ForecastRequest, ForecastResponse
from app.model import DemandForecastModel
from app.gap_analyzer import analyze_workforce_gap

app = FastAPI(
    title="GIGNET Demand Forecasting & Workforce Planning Microservice",
    description="SIH26089: Lightweight CPU-only ML service for cooperative demand prediction and workforce gap analysis.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_engine = DemandForecastModel()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GIGNET Forecasting Microservice",
        "version": "1.0.0",
        "hardware": "CPU-only"
    }

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
