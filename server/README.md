# NPOS Streamlit Server

Local Python server for NPOS tools.

## Setup

```bash
cd server
pip install -r requirements.txt
```

## Run Tools

```bash
# Video Workshop Processor
streamlit run apps/video_processor.py

# Preset Analyzer
streamlit run apps/preset_analyzer.py

# Calculators
streamlit run apps/calculators.py
```

## All Tools

```bash
streamlit run --server.port 8501 apps/
```
