import streamlit as st
import pandas as pd
import os
import folium
from streamlit_folium import st_folium
from PIL import Image
import streamlit.components.v1 as components

# --- Page Configuration ---
st.set_page_config(
    page_title="ClearLane MTA Analysis",
    page_icon="🚌",
    layout="wide"
)

# --- Data Loading ---
# creating a function to cache the data, so it loads only once
@st.cache_data
def load_data():
    # constructing the correct relative paths to the data files
    base_path = os.path.dirname(__file__)
    processed_data_path = os.path.join(base_path, '..', 'data', 'processed', 'clear_lane_target_list.csv')
    
    if not os.path.exists(processed_data_path):
        st.error(f"Error: The data file was not found at {processed_data_path}")
        st.error("Please ensure the `clear_lane_target_list.csv` file exists in the `data/processed/` directory.")
        return None
        
    target_list_df = pd.read_csv(processed_data_path)
    return target_list_df

df = load_data()

# --- Sidebar Navigation ---
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", [
    "The Rolling Study Hall",
    "The Problem is Local & Predictable",
    "Interactive 3D Bus Route Map",
    "The 'ClearLane' Solution"
])
st.sidebar.info(
    "This application presents a data-driven strategy to improve MTA bus service "
    "by focusing on the routes most critical to CUNY students."
)

# Add button to generate 3D map
st.sidebar.markdown("---")
if st.sidebar.button("🗺️ Generate 3D Kepler.gl Map", help="Run the script to create the interactive 3D map"):
    with st.spinner("Generating 3D map... This may take a few minutes."):
        import subprocess
        import sys

        # Run the Kepler map generator script
        try:
            script_path = os.path.join(os.path.dirname(__file__), '..', 'notebooks', 'kepler_3d_map_generator.py')
            result = subprocess.run([sys.executable, script_path], capture_output=True, text=True, cwd=os.path.dirname(script_path))

            if result.returncode == 0:
                st.sidebar.success("✅ 3D map generated successfully!")
            else:
                st.sidebar.error(f"❌ Error generating map: {result.stderr}")
        except Exception as e:
            st.sidebar.error(f"❌ Error: {str(e)}")

# --- Page 1: The Story ---
if page == "The Rolling Study Hall":
    st.title("Protecting the Rolling Study Hall 🚌")
    st.subheader("A Student-Centric Strategy to Get NYC Buses on Time")
    
    st.markdown("""
    For thousands of CUNY students, the daily bus commute is more than just a ride—it's a crucial, quiet window of time for learning. It's a **'rolling study hall'** where we prepare for exams, finish homework, and get a head start on our education.
    
    But chronic bus delays caused by lane and stop blockages threaten this vital time. This project began with a simple goal: to use MTA's own data to find a way to protect these rolling study halls for every student in New York City.
    """)
    
    st.info("Use the navigation on the left to follow our journey from data to a deployable solution.")

# --- Page 2: The Analysis ---
elif page == "The Problem is Local & Predictable":
    st.title("The Problem Isn't Everywhere, It's *Somewhere*")
    st.markdown("""
    Our analysis of 3.7 million violations led to a key discovery: the problem is hyper-concentrated. It's not random noise; it's a predictable pattern caused by a small number of chronic, exempt-vehicle offenders at specific locations.
    """)

    st.header("Interactive Hotspot Map")
    st.markdown("This map shows the top 100 hotspots for exempt vehicle violations, with CUNY campuses marked for reference. Notice the dense clusters around major transit hubs.")
    
    # loading and displaying the interactive map
    map_path = os.path.join(os.path.dirname(__file__), '..', 'visualizations', 'exempt_hotspots_map.html')
    if os.path.exists(map_path):
        with open(map_path, 'r', encoding='utf-8') as f:
            html_map = f.read()
        st.components.v1.html(html_map, height=500)
    else:
        st.warning("Map file not found. Please generate `exempt_hotspots_map.html` from the notebook.")

    st.header("...And It Happens Like Clockwork")
    st.markdown("These blockages are not only geographically concentrated, but they are also temporally predictable. They overwhelmingly occur on weekday mornings, peaking between **7 AM and 10 AM**—the exact window when students are trying to get to class.")

    # loading and displaying the temporal plots
    col1, col2 = st.columns(2)
    with col1:
        hourly_plot_path = os.path.join(os.path.dirname(__file__), '..', 'visualizations', 'exempt_violations_by_hour.png')
        if os.path.exists(hourly_plot_path):
            st.image(Image.open(hourly_plot_path))
        else:
            st.warning("Hourly plot not found.")
            
    with col2:
        daily_plot_path = os.path.join(os.path.dirname(__file__), '..', 'visualizations', 'exempt_violations_by_day.png')
        if os.path.exists(daily_plot_path):
            st.image(Image.open(daily_plot_path))
        else:
            st.warning("Daily plot not found.")


# --- Page 3: Interactive 3D Bus Route Map ---
elif page == "Interactive 3D Bus Route Map":
    st.title("3D Bus Route Visualization with Kepler.gl 🗺️")
    st.subheader("Bus Segments Colored by Speed, Extruded by Violation Counts")

    st.markdown("""
    This interactive 3D map shows NYC bus route segments with two key visualizations:
    - **Line Color**: Represents average bus speed (red = slow, green = fast)
    - **3D Height**: Represents the number of violations that occurred on each segment

    Use your mouse to:
    - **Drag** to pan the map
    - **Scroll** to zoom in/out
    - **Hold Ctrl + Drag** to rotate the 3D view
    - **Click** on segments to see detailed information
    """)

    # Check if the interactive 3D map exists
    map_3d_path = os.path.join(os.path.dirname(__file__), '..', 'visualizations', 'interactive_3d_map.html')

    if os.path.exists(map_3d_path):
        st.success("✅ 3D map loaded successfully!")

        # Load and display the Kepler.gl map
        with open(map_3d_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        # Display the map using components
        components.html(html_content, height=700)

        st.markdown("---")
        st.markdown("""
        **Map Legend:**
        - **Layer 1 (Speed)**: Bus segments colored by average speed
        - **Layer 2 (3D Violations)**: Segments extruded by violation count
        - **Tooltip**: Hover over segments to see Route ID, speed, violation count, and borough
        """)

        st.info("""
        💡 **How to Use This Map:**
        1. Toggle layers on/off using the layer panel (top-right)
        2. Change the view angle by holding Ctrl and dragging
        3. Use the legend to understand the color coding
        4. Click on segments to see detailed route information
        """)

    else:
        st.warning("⚠️ 3D map not found. Please generate it first using the button in the sidebar.")

        st.markdown("""
        ### To generate the 3D map:
        1. Click the **"🗺️ Generate 3D Kepler.gl Map"** button in the sidebar
        2. Wait for the processing to complete (may take several minutes)
        3. Refresh this page to view the interactive map
        """)

        st.info("""
        The 3D map generation process:
        - Loads violation data and bus route segment speeds
        - Performs spatial joins to match violations to route segments
        - Aggregates data to calculate violation counts per segment
        - Creates an interactive Kepler.gl visualization
        """)


# --- Page 4: The Solution ---
elif page == "The 'ClearLane' Solution":
    st.title("The 'ClearLane' Initiative 🎯")
    st.subheader("From Data to a Deployable Strategy")
    st.markdown("""
    Our analysis culminates in a single, actionable recommendation: The 'ClearLane' Initiative. Instead of reactive, city-wide ticketing, we propose a proactive, data-driven strategy.
    
    The table below is our **ClearLane Target List**. It synthesizes violation counts, temporal patterns, and CUNY proximity into a single priority score. It tells the MTA the **exact bus stops** that need enforcement and the **exact time**—weekday mornings—to deploy it for maximum impact on student commutes.
    """)

    if df is not None:
        st.dataframe(df.style.background_gradient(cmap='Reds', subset=['ClearLane Priority Score']))
    else:
        st.error("Data could not be loaded. Cannot display the target list.")

    st.header("Expected Impact")
    st.success("""
    By piloting this initiative at just these top locations, the MTA can achieve a surgical, high-impact return on its enforcement resources. This isn't about more tickets; it's about smarter enforcement that protects the student journey and makes buses faster for everyone.
    """)


