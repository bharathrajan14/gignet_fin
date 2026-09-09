import numpy as np
from datetime import datetime, timedelta
from sklearn.linear_model import Ridge
from typing import List, Dict, Tuple

class DemandForecastModel:
    """
    Lightweight, CPU-only ML demand forecaster using Ridge Regression with
    temporal feature engineering (day-of-week seasonality, trend, and lag features).
    Runs with 0 paid APIs, 0 GPUs, strictly on local CPU.
    """
    def __init__(self):
        self.model = Ridge(alpha=1.0)
        self.is_fitted = False

    def _generate_synthetic_baseline(self, category: str, base_level: int = 15) -> List[int]:
        """
        Creates a grounded 30-day baseline if database history is newly seeded.
        Incorporates weekend surges (e.g. plumbing/cleaning jump on Sat/Sun).
        """
        np.random.seed(42)
        days = 30
        series = []
        multiplier_map = {
            'PLUMBING': 1.2,
            'ELECTRICAL': 1.1,
            'CLEANING': 1.35,
            'CARPENTRY': 0.9,
            'APPLIANCE': 1.0,
            'MASONRY': 0.8
        }
        category_mult = multiplier_map.get(category.upper(), 1.0)
        
        for i in range(days):
            day_of_week = i % 7
            weekend_boost = 1.4 if day_of_week in [5, 6] else 1.0
            noise = np.random.normal(0, 1.5)
            val = max(3, int(base_level * category_mult * weekend_boost + noise))
            series.append(val)
        return series

    def fit_and_predict(
        self,
        category: str,
        history: List[int],
        horizon_days: int = 7
    ) -> List[Tuple[str, float, float, float]]:
        """
        Fits Ridge regressor on time series features and produces predictions
        with 90% confidence bounds.
        Returns list of (date_str, predicted_val, lower_bound, upper_bound).
        """
        if not history or len(history) < 7:
            history = self._generate_synthetic_baseline(category)

        # Build training matrix with lag features and day of week
        X = []
        y = []
        n = len(history)
        
        for i in range(7, n):
            # Features: lag-1, lag-7, rolling-3-mean, day-of-week
            lag_1 = history[i - 1]
            lag_7 = history[i - 7]
            rolling_3 = np.mean(history[i-3:i])
            day_of_week = i % 7
            
            # One-hot like day features (sin/cos representation)
            dow_sin = np.sin(2 * np.pi * day_of_week / 7.0)
            dow_cos = np.cos(2 * np.pi * day_of_week / 7.0)
            
            X.append([lag_1, lag_7, rolling_3, dow_sin, dow_cos])
            y.append(history[i])

        X = np.array(X)
        y = np.array(y)

        self.model.fit(X, y)
        self.is_fitted = True

        # Calculate residual std for empirical confidence intervals
        train_preds = self.model.predict(X)
        residual_std = float(np.std(y - train_preds)) if len(y) > 0 else 1.5
        residual_std = max(residual_std, 1.0)

        # Forecast forward
        current_history = list(history)
        predictions = []
        today = datetime.now()

        for step in range(1, horizon_days + 1):
            future_date = today + timedelta(days=step)
            day_of_week = future_date.weekday()
            
            lag_1 = current_history[-1]
            lag_7 = current_history[-7] if len(current_history) >= 7 else current_history[0]
            rolling_3 = np.mean(current_history[-3:])
            dow_sin = np.sin(2 * np.pi * day_of_week / 7.0)
            dow_cos = np.cos(2 * np.pi * day_of_week / 7.0)

            feat = np.array([[lag_1, lag_7, rolling_3, dow_sin, dow_cos]])
            pred_val = float(self.model.predict(feat)[0])
            pred_val = max(1.0, round(pred_val, 1))

            # 90% confidence interval: +/- 1.645 * residual_std
            lower_bound = max(0.0, round(pred_val - 1.645 * residual_std, 1))
            upper_bound = round(pred_val + 1.645 * residual_std, 1)

            date_str = future_date.strftime("%Y-%m-%d")
            predictions.append((date_str, pred_val, lower_bound, upper_bound))

            # Append prediction to history for next autoregressive step
            current_history.append(int(round(pred_val)))

        return predictions
