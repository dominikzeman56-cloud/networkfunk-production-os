"""
NPOS Unified Production Hub
Sidebar-driven dashboard linking all calculators, video workshop, and preset analyzer.
"""

import streamlit as st

# Page configuration (must be first Streamlit command)
st.set_page_config(
    page_title="NPOS Production Hub",
    page_icon="🌐",
    layout="wide",
    initial_sidebar_state="expanded",
)

from . import enhanced_calculators, visual_analyzer

# Try to import video_processor, gracefully handle if it fails
try:
    from . import video_processor
    HAS_VIDEO = True
except ImportError:
    HAS_VIDEO = False


def apply_custom_css():
    """Apply NPOS dark theme styling."""
    st.markdown("""
    <style>
        /* NPOS Theme */
        .stApp {
            background-color: #0f172a;
        }
        .stSidebar {
            background-color: #1e293b;
        }
        .stSidebar .sidebar-content {
            background-color: #1e293b;
        }
        h1, h2, h3 {
            color: #10b981 !important;
        }
        .stMetric label, .stMetric [data-testid="stMetricLabel"] {
            color: #94a3b8;
        }
        .stMetric [data-testid="stMetricValue"] {
            color: #10b981;
        }
        .stAlert {
            background-color: #1e293b;
            border: 1px solid #334155;
        }
        .stTabs [data-baseweb="tab-list"] {
            gap: 2px;
        }
        .stTabs [data-baseweb="tab"] {
            border-radius: 4px 4px 0 0;
            padding: 8px 16px;
            background-color: #1e293b;
        }
        .stTabs [aria-selected="true"] {
            background-color: #10b981 !important;
            color: white !important;
        }
        .stButton button {
            background-color: #10b981;
            color: white;
            border: none;
            border-radius: 4px;
        }
        .stButton button:hover {
            background-color: #059669;
        }
        /* Sidebar navigation styling */
        .sidebar-nav {
            padding: 1rem 0;
        }
        .sidebar-nav a {
            display: block;
            padding: 0.5rem 1rem;
            color: #cbd5e1;
            text-decoration: none;
            border-radius: 4px;
            margin: 2px 0;
            transition: all 0.2s;
        }
        .sidebar-nav a:hover {
            background-color: #334155;
            color: #10b981;
        }
        .sidebar-nav a.active {
            background-color: #10b981;
            color: white;
        }
        .sidebar-section {
            color: #64748b;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 1rem 1rem 0.25rem 1rem;
        }
        .st-emotion-cache-1kyxreq {
            display: flex;
            justify-content: center;
        }
    </style>
    """, unsafe_allow_html=True)


def render_sidebar():
    """Render the sidebar navigation."""
    with st.sidebar:
        st.markdown("# 🌐 NPOS")
        st.markdown("### Production Hub")
        st.markdown("---")

        # Navigation
        st.markdown('<div class="sidebar-nav">', unsafe_allow_html=True)

        st.markdown('<div class="sidebar-section">Production Tools</div>', unsafe_allow_html=True)
        page = "Enhanced Calculators"

        pages = {
            "Enhanced Calculators": "📊",
            "Visual Serum Analyzer": "🎛",
        }

        if HAS_VIDEO:
            pages["Video Workshop"] = "🎬"

        # Radio for page selection
        page = st.radio(
            "Navigate",
            list(pages.keys()),
            format_func=lambda x: f"{pages[x]} {x}",
            label_visibility="collapsed",
        )

        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown("---")
        st.markdown(
            f"<p style='color: #64748b; font-size: 0.8rem;'>"
            f"NPOS v0.1.0 • Streamlit Hub<br>"
            f"Neurofunk Production OS</p>",
            unsafe_allow_html=True,
        )

        return page


def render_dashboard():
    """Render the main dashboard/landing page."""
    st.title("🌐 NPOS Production Hub")

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Enhanced Calculators", "3", "BPM · Harmonics · Reese")
    with col2:
        st.metric("Preset Analyzer", "Ready", "Upload .fxp files")
    with col3:
        st.metric("Video Workshop", "Connected" if HAS_VIDEO else "Offline", "🎬")

    st.markdown("---")
    st.markdown("""
    ### Quick Start

    Select a tool from the sidebar to get started:

    - **📊 Enhanced Calculators** — BPM-sync delay/reverb times, harmonic overtone series,
      and Reese bass notch/phase cancellation calculator
    - **🎛 Visual Serum Analyzer** — Upload Serum .fxp presets to visualize oscillator
      routing, filter curves, modulation maps, and macro assignments

    ### Recent Updates
    """)

    with st.expander("📊 Enhanced Calculators", expanded=True):
        st.markdown("""
        - **BPM Delay Calculator:** Quarter, eighth, sixteenth note divisions with dotted/triplet variants
        - **Harmonic Series:** Fundamental frequency → overtone series with note names and cents deviation
        - **Reese Notch Calculator:** Phase cancellation notches for detuned bass oscillators
        """)

    with st.expander("🎛 Visual Serum Preset Analyzer", expanded=True):
        st.markdown("""
        - **Binary Parser:** Reads Serum .fxp format with fallback structural analysis
        - **Oscillator Routing:** Interactive signal flow diagram
        - **Filter Response:** Matplotlib-generated filter curves with resonance modeling
        - **Modulation Matrix:** Displays LFO, envelope, and macro assignments
        """)


def main():
    """Main entry point for the Unified NPOS Hub."""
    # Apply dark theme
    apply_custom_css()

    # Render sidebar and get selected page
    page = render_sidebar()

    st.markdown("---")

    # Route to the selected page
    if page == "Enhanced Calculators":
        enhanced_calculators.main()
    elif page == "Visual Serum Analyzer":
        visual_analyzer.main()
    elif page == "Video Workshop" and HAS_VIDEO:
        video_processor.main()
    else:
        render_dashboard()


# Entry point
if __name__ == "__main__":
    main()