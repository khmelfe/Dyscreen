# Dyscreen — Learning disabilities  Screening System

Dyscreen is an AI-powered system for **screening** Learning disabilities from handwriting samples. A user uploads (or draws) a handwriting image; the backend runs a deep-learning model and a set of image-analysis features, then returns a **screening probability** together with annotated visuals.

> **Important:** Dyscreen is a screening aid, **not a diagnostic tool**. It is designed to flag handwriting that may warrant further attention and to encourage referral to a qualified professional. It does not diagnose dysgraphia.

---

## Architecture

```
Dyscreen/
├── projectfinal/              # Django REST API (Python)
│   ├── Dyscreen/              # Main Django app
│   │   ├── views.py           # API endpoints
│   │   └── model_learning/
│   │       ├── Model_V3.py           # CNN + BiLSTM model definition & inference
│   │       ├── feature_extractions.py # Baseline & word-spacing analysis
│   │       ├── Heatmap_extractions.py # Grad-CAM heatmap generation
│   │       ├── testing_model.py
│   │       └── final_model.keras      # Trained model weights
│   ├── projectfinal/          # Django settings & URL routing
│   └── manage.py
├── front/frontapp/            # React web frontend
│   └── src/Components/new_design/
│       ├── LandingPage.jsx
│       ├── SubmissionPage.jsx
│       └── ResultsPage.jsx
└── Mobile/dyscreen_mobile/    # Flutter mobile app (iOS/Android)
```

---

## Model & Limitations

The shipped model is a **CNN-BiLSTM** trained with the **Hebrew-only** strategy
(starting from MobileNetV2 ImageNet weights and trained directly on the Hebrew
handwriting dataset, without English pre-training — which was found to give no
benefit for this task).

**Reported performance (5-fold cross-validation on 143 Hebrew samples):**

- AUC ≈ 0.75
- Accuracy ≈ 0.68
- Recall ≈ 0.50

**Known limitations (important context for interpreting results):**

- At the default decision threshold the model identifies roughly half of the
  true dysgraphia cases (recall ≈ 0.50), so a "low indicator" result does **not**
  rule out dysgraphia.
- The model was trained on a small Hebrew dataset (143 samples); performance is
  expected to improve substantially with more data.
- Performance was estimated via cross-validation, not on a separate held-out
  clinical test set.

For these reasons the output is presented as a **risk indicator**, and the app
always recommends professional assessment for any concern.

---

## Components

### Backend — Django REST API

- **Framework**: Django 6 + Django REST Framework
- **Port**: `8000`
- **Model**: `CNN + BiLSTM` built on a frozen MobileNetV2 backbone
  - Input shape: `224 × 448 × 3` (wide aspect ratio to match handwriting lines)
  - Architecture: MobileNetV2 → ColumnPool → Dense(128) → BiLSTM(64) → Dense(32) → Dense(1, sigmoid)
  - Training strategy: Hebrew-only (ImageNet → Hebrew), two-stage fine-tuning
- **Feature extraction** (`feature_extractions.py`):
  - Horizontal Projection Profile (HPP) for line detection
  - Baseline detection with word-above / word-below counting
  - Word-spacing analysis with large-gap detection
- **Heatmap** (`Heatmap_extractions.py`): Grad-CAM overlay showing which regions drove the prediction
- **Storage**: uploaded images and generated outputs are stored under `projectfinal/media/`

### Frontend — React Web App

- **Framework**: React 19 + React Router + Tailwind CSS
- **Pages**:
  - `SubmissionPage` — introduction + file upload + model selection + loading state
  - `ResultsPage` — screening score, annotated image, Grad-CAM heatmap, feature breakdown
- **Communication**: Axios with CSRF token support

### Mobile — Flutter App

- **Framework**: Flutter (Dart), targets iOS & Android
- Presents a Hebrew handwriting prompt to the user
- Supports drawing on a canvas or picking an image file (`file_picker`)
- Sends the image to the Django backend via `http` and displays the result

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/hello/` | Health check |
| `GET` | `/csrf/` | Returns a CSRF token for subsequent requests |
| `GET` | `/ping-mongo` | MongoDB connectivity check |
| `POST` | `/upload_file` | Upload a handwriting image (JPEG/PNG) and run analysis |
| `DELETE` | `/upload_file` | Delete previously uploaded files from the server |

### POST `/upload_file` — Request

`multipart/form-data`:

| Field | Type | Description |
|-------|------|-------------|
| `myfile` | File | Handwriting image (JPEG or PNG) |
| `model` | String | `"CNN_LSTM"` (default) |

### POST `/upload_file` — Response

`prob` is the model's screening probability (0–1). `pred_class` and `label`
reflect a fixed decision threshold and should be read as a **risk indicator**,
not a diagnosis.

```json
{
  "prob": 0.87,
  "pred_class": 1,
  "label": "Elevated indicator",
  "features": {
    "annotated_url": "http://localhost:8000/media/annotated/<uuid>.png",
    "hpp": [...],
    "merged_lines": 5,
    "count_under_lines": 3,
    "count_above_lines": 1,
    "total_words_found": 24,
    "amount_spaces": 23,
    "large_gap_count": 4,
    "avg_spaces": 18
  },
  "heatmap_url": "http://localhost:8000/media/heatmaps/<uuid>.png",
  "Orignal_photo": "/absolute/server/path/to/upload.jpg"
}
```

> The `label` field is a screening indicator (e.g. "Elevated indicator" /
> "Low indicator"), not a clinical diagnosis. The UI should present it alongside
> a recommendation to consult a professional.

---

## Setup & Running

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Flutter SDK 3.11+

### 1. Backend

```bash
cd projectfinal

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../Requirements.txt

# Run migrations
python manage.py migrate

# Start the dev server
python manage.py runserver
# → available at http://localhost:8000
```

### 2. Frontend

```bash
cd front/frontapp
npm install
npm start
# → available at http://localhost:3000
```

### 3. Mobile

```bash
cd Mobile/dyscreen_mobile
flutter pub get
flutter run
```
Configuring the backend address

The Flutter app needs to know where the Django backend is. localhost will not
work from a phone or emulator — on a device, localhost refers to the device
itself, not your computer. Set the backend URL according to how you run the app:

Where the app runsBackend URL to useAndroid emulatorhttp://10.0.2.2:8000  (special alias for the host machine)iOS simulatorhttp://localhost:8000 (the simulator shares the host network)Physical phonehttp://<YOUR_COMPUTER_LAN_IP>:8000 (e.g. http://192.168.1.42:8000)

Find your computer's LAN IP (for a physical device — the phone must be on the
same Wi-Fi network as your computer):

bash# macOS / Linux
ipconfig getifaddr en0        # macOS Wi-Fi
hostname -I                   # Linux (first address)

# Windows
ipconfig                      # look for the IPv4 Address under your Wi-Fi adapter

Set it in the app: open lib/main.dart and update the base URL constant, e.g.:

dart// lib/main.dart
const String backendBaseUrl = "http://192.168.1.42:8000";  // <-- your IP here

On the Django side, start the server so it listens on all interfaces (not just
localhost), and make sure the host is allowed:

bashpython manage.py runserver 0.0.0.0:8000

ALLOWED_HOSTS = ['*'] is already set for development, so the backend will accept
the connection. If you tighten ALLOWED_HOSTS later, add your computer's IP to it.


Troubleshooting: if the app can't connect, check that (1) the phone and
computer are on the same network, (2) the server was started with 0.0.0.0:8000
(not the default 127.0.0.1), and (3) your computer's firewall allows incoming
connections on port 8000.


> Make sure the Django backend is running and the device/emulator can reach `http://localhost:8000` (or update the IP in `lib/main.dart` for a physical device).

---

## Environment

The backend reads optional settings from `projectfinal/.env`. Variables currently used:

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string (optional — needed for `/ping-mongo`) |

---

## Notes

- `DEBUG = True` and `ALLOWED_HOSTS = ['*']` are set for development. Change both before any production deployment.
- The model file `final_model.keras` must be present at `projectfinal/Dyscreen/model_learning/final_model.keras` before starting the backend. This should be the CNN-BiLSTM (Hebrew-only) model trained on the full Hebrew dataset.
- Image preprocessing at inference time must match training exactly (same input size and preprocessing function), or predictions will be unreliable.
- Uploaded files and generated heatmaps are stored in `projectfinal/media/` and deleted automatically when the user starts a new analysis.
- **Dyscreen is a screening aid, not a diagnostic system.** Results should always be interpreted by, or referred to, a qualified professional.
