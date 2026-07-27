# NPOS Streamlit Video Workshop Processor

import streamlit as st
import os
import tempfile
from pathlib import Path

st.title("🎥 Video Workshop Processor")
st.markdown("Upload workshop videos for transcription and summarization.")

# Video upload
uploaded_video = st.file_uploader("Upload video (MP4, MOV)", type=["mp4", "mov"])

if uploaded_video:
    st.video(uploaded_video)

    if st.button("Process Video"):
        with st.spinner("Extracting audio and transcribing..."):
            # Save uploaded file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
                tmp.write(uploaded_video.getvalue())
                video_path = tmp.name

            st.success(f"Video saved: {video_path}")
            st.info("Next steps: Extract audio with ffmpeg, transcribe with Whisper, summarize with LLM")

            # Cleanup
            os.unlink(video_path)
