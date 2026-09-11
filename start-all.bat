@echo off
echo ========================================================
echo        STARTING GIGNET 5-SERVICE ECOSYSTEM
echo ========================================================
echo.

echo [1/5] Starting GIGNET Core Backend (Port 5000)...
start "GIGNET Backend (5000)" cmd /k "cd backend && npm run dev"

echo [2/5] Starting Python Demand Forecasting & ML Service (Port 8000)...
start "GIGNET Forecast (8000)" cmd /k "cd forecast-service && (if exist .venv\Scripts\python.exe (.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload) else (python -m uvicorn app.main:app --port 8000 --reload))"

echo [3/5] Starting Customer App (Port 5173)...
start "Customer App (5173)" cmd /k "cd apps\customer-app && npm run dev"

echo [4/5] Starting Worker App (Port 5174)...
start "Worker App (5174)" cmd /k "cd apps\worker-app && npm run dev"

echo [5/5] Starting Admin Operations Hub (Port 5175)...
start "Admin App (5175)" cmd /k "cd apps\admin-app && npm run dev"

echo.
echo ========================================================
echo All 5 GIGNET services launched in separate windows!
echo - Customer App: http://localhost:5173
echo - Worker App:   http://localhost:5174
echo - Admin App:    http://localhost:5175
echo - Backend API:  http://localhost:5000/health
echo - Forecast ML:  http://localhost:8000/health
echo ========================================================
pause
