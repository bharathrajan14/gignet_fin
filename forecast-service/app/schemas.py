from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class ForecastRequest(BaseModel):
    cooperative_id: str = Field(..., description="ID of the cooperative society")
    cooperative_name: str = Field(..., description="Name of the cooperative")
    service_category: str = Field(..., description="Service category (e.g. PLUMBING, ELECTRICAL)")
    available_workforce: int = Field(..., ge=0, description="Current active online/verified workers in this category")
    historical_daily_demand: Optional[List[int]] = Field(default=[], description="Past 14-30 days daily booking counts")
    horizon_days: int = Field(default=7, ge=1, le=14, description="Forecast horizon in days")

class DailyForecastItem(BaseModel):
    day_offset: int
    date_str: str
    predicted_demand: float
    confidence_lower: float
    confidence_upper: float
    available_workforce: int
    workforce_gap: float  # Positive = Deficit/Shortage, Negative = Surplus
    action_recommendation: str  # BALANCED, REQUEST_WORKERS_INWARD, DISPATCH_WORKERS_OUTWARD

class ForecastResponse(BaseModel):
    cooperative_id: str
    cooperative_name: str
    service_category: str
    current_workforce: int
    total_7day_predicted_demand: float
    total_7day_gap: float
    overall_status: str  # SHORTAGE, SURPLUS, BALANCED
    sharing_recommendation: Optional[str] = None
    daily_breakdown: List[DailyForecastItem]
    model_metadata: Dict[str, str]
