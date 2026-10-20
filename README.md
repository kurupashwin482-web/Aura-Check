# Aura-Check — Student Wellness Analytics

Aura-Check is an end-to-end machine learning project that explores patterns associated with student wellness using demographic information, academic routines, digital habits, sleep, physical activity, and perceived stress.

The project covers the complete machine learning workflow, from data exploration and preprocessing to Random Forest model training, hyperparameter tuning, evaluation, and deployment through a FastAPI backend and an interactive web frontend.

Machine Learning Workflow

Data cleaning: Inspecting missing values, inconsistent records, and data quality.

Exploratory Data Analysis (EDA): Examining feature distributions, relationships, and patterns in the dataset.

Data preprocessing: Preparing input features and transforming data into a format suitable for machine learning.

Model development: Training a Random Forest model for the project's prediction task.

Hyperparameter tuning: Searching for better model configurations using a defined tuning strategy.

Model evaluation: Assessing predictive performance using appropriate evaluation metrics.

Deployment: Serving the saved model through FastAPI and connecting it to a web-based interface.



> **Important:** Aura-Check is an educational analytics project, not a medical tool. Its output is an estimate from a machine-learning model—not a diagnosis, clinical assessment, or substitute for professional support.

## Live Demo

- **Frontend website:** https://aura-check-1.onrender.com
- **Backend API:** https://aura-check-0a7s.onrender.com
- **Interactive API documentation:** https://aura-check-0a7s.onrender.com/docs
- **GitHub repository:** https://github.com/kurupashwin482-web/Aura-Check

The backend is hosted separately from the static frontend. On a free hosting plan, the first request after a period of inactivity may take longer while the backend wakes up.

## Features

- Dark, modern interface for entering student profile and lifestyle information.
- Inputs covering demographic context, academic level, digital-platform habits, screen time, phone unlocks, study time, physical activity, sleep, and perceived stress.
- Machine-learning inference through a FastAPI backend.
- A results/score view intended to present the model output in an accessible way.
- Separate frontend and backend deployments.

The exact output depends on the model and the inputs submitted.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend API | Python, FastAPI, Uvicorn, Pydantic |
| Data handling | pandas |
| Model loading | joblib |
| Machine learning | scikit-learn |
| Hosting | Render Static Site + Render Web Service |

## How It Works

1. A user enters the requested profile and lifestyle information in the frontend.
2. JavaScript sends the form data to the FastAPI prediction endpoint.
3. The backend validates the request and loads the saved model from `Mental_Health_Model.pkl`.
4. The model generates a prediction, which the frontend displays.

This describes the application flow; it does not imply that the model can diagnose or reliably measure a person's mental health.

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/kurupashwin482-web/Aura-Check.git
cd Aura-Check
```

### 2. Create a virtual environment (recommended)

Windows Command Prompt:

```cmd
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install dependencies

Make sure the dependency file is named `requirements.txt`.

```bash
python -m pip install -r requirements.txt
```

### 4. Start the backend

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API root: http://127.0.0.1:8000
- Interactive API docs: http://127.0.0.1:8000/docs

### 5. Open the frontend

Open `index.html` with VS Code Live Server or another static file server. For local development, the frontend API base URL should point to:

```javascript
const API_BASE = "http://127.0.0.1:8000";
```

For the deployed website, the frontend should use:

```javascript
const API_BASE = "https://aura-check-0a7s.onrender.com";
```

Keep the existing prediction endpoint path and request payload consistent with the FastAPI implementation.

## Repository Structure

```text
Aura-Check/
├── index.html
├── script.css
├── script.js
├── main.py
├── requirements.txt
├── Mental_Health_Model.pkl
├── Mental_health_prediction_model.ipynb
└── Student Social Media And Mental Health Impact.csv
```

Filenames shown here reflect the project files; if you reorganize the project, update this section to match the repository.

## API

The FastAPI service exposes its interactive endpoint documentation at:

https://aura-check-0a7s.onrender.com/docs

Use the documentation to inspect available routes and test the request schema. The frontend and backend must agree on the endpoint path, field names, and data types.

## Limitations and Responsible Use

- Model predictions are only as useful as the dataset, target definition, features, and evaluation behind the model.
- Associations in a dataset do not establish that social media or any single habit causes a mental-health outcome.
- The output should not be used for diagnosis, treatment decisions, screening, or emergency decisions.
- Avoid entering identifiable or sensitive personal information.
- A public demo should not be treated as a confidential or clinical service.

## Future Improvements

- Document model evaluation, validation strategy, and known limitations.
- Add automated tests for request validation and prediction responses.
- Restrict backend CORS to the intended frontend origin for production.
- Improve accessibility, responsive behavior, and loading/error states.
- Add a clear explanation of what the displayed score means, based on the model's actual target and evaluation.

## Author

Developed as a student machine-learning and web-development project.

---

If you find a bug or have a suggestion, open an issue in this repository.
