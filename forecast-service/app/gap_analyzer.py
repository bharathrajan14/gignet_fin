from typing import List, Dict, Tuple
from app.schemas import DailyForecastItem, ForecastResponse

def analyze_workforce_gap(
    cooperative_id: str,
    cooperative_name: str,
    service_category: str,
    available_workforce: int,
    predictions: List[Tuple[str, float, float, float]]
) -> ForecastResponse:
    """
    Computes real workforce deficit / surplus gaps based on ML demand forecast
    and active cooperative labor capacity.
    """
    daily_items: List[DailyForecastItem] = []
    total_demand = 0.0
    total_gap = 0.0

    for idx, (date_str, pred_demand, lower, upper) in enumerate(predictions, start=1):
        # Gap = Demand - Supply
        # A positive gap means more demand than workers -> shortage!
        gap = round(pred_demand - available_workforce, 1)
        total_demand += pred_demand
        total_gap += gap

        if gap > 2.0:
            rec = "REQUEST_WORKERS_INWARD"
        elif gap < -3.0:
            rec = "DISPATCH_WORKERS_OUTWARD"
        else:
            rec = "BALANCED"

        daily_items.append(DailyForecastItem(
            day_offset=idx,
            date_str=date_str,
            predicted_demand=pred_demand,
            confidence_lower=lower,
            confidence_upper=upper,
            available_workforce=available_workforce,
            workforce_gap=gap,
            action_recommendation=rec
        ))

    total_demand = round(total_demand, 1)
    total_gap = round(total_gap, 1)

    if total_gap > 5.0:
        overall_status = "SHORTAGE"
        sharing_rec = (
            f"Deficit Alert: {cooperative_name} faces a projected net shortage of "
            f"~{int(round(total_gap))} worker shifts in {service_category} over the next 7 days. "
            f"Recommend triggering Federation Workforce Sharing to pull available workers from neighboring societies."
        )
    elif total_gap < -10.0:
        overall_status = "SURPLUS"
        sharing_rec = (
            f"Surplus Capacity: {cooperative_name} has an excess capacity of "
            f"~{int(abs(round(total_gap)))} worker shifts in {service_category}. "
            f"Available to fulfill outward loan requests to neighboring societies."
        )
    else:
        overall_status = "BALANCED"
        sharing_rec = (
            f"Optimal Balance: {cooperative_name} workforce closely matches predicted {service_category} "
            f"demand for the coming week."
        )

    return ForecastResponse(
        cooperative_id=cooperative_id,
        cooperative_name=cooperative_name,
        service_category=service_category,
        current_workforce=available_workforce,
        total_7day_predicted_demand=total_demand,
        total_7day_gap=total_gap,
        overall_status=overall_status,
        sharing_recommendation=sharing_rec,
        daily_breakdown=daily_items,
        model_metadata={
            "algorithm": "Ridge Regression with Temporal Seasonality",
            "compute_target": "CPU-only (0 GPU / 0 Paid APIs)",
            "forecast_horizon": f"{len(predictions)} days"
        }
    )
