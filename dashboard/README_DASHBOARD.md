# ACE Intelligence System Dashboard

## Quick Start

### Option 1: Easy Launch (Recommended)
```bash
python dashboard/run_dashboard.py
```

### Option 2: Manual Launch
```bash
cd dashboard
streamlit run app.py
```

## Features

### 🚌 The Rolling Study Hall
- Introduction to the student-centric approach
- Problem statement and motivation

### 📊 The Problem is Local & Predictable
- Interactive hotspot map showing violation clusters
- Temporal analysis with hourly and daily patterns
- CUNY campus proximity analysis

### 🗺️ Interactive 3D Bus Route Map
- **NEW!** Kepler.gl-powered 3D visualization
- Bus segments colored by average speed
- 3D extrusion based on violation counts
- Interactive controls for pan, zoom, and rotation

### 🎯 The 'ClearLane' Solution
- Data-driven target list for enforcement
- Priority scoring algorithm
- Actionable recommendations

## Generating the 3D Map

The interactive 3D map requires running a data processing script:

1. **From the Dashboard**: Click the "🗺️ Generate 3D Kepler.gl Map" button in the sidebar
2. **From Jupyter**: Run the new cell in `01_Final_Analysis.ipynb` (Part 5B)
3. **From Command Line**:
   ```bash
   cd notebooks
   python kepler_3d_map_generator.py
   ```

### What the Script Does:
1. **Data Loading**: Loads violation data and MTA bus route segment speeds
2. **Geometry Creation**: Creates LineString geometries for bus route segments
3. **Spatial Join**: Matches violation points to route segments using 50m buffer
4. **Data Aggregation**: Counts violations per segment and calculates average speeds
5. **3D Visualization**: Creates Kepler.gl map with two layers:
   - **Speed Layer**: Lines colored by average bus speed
   - **3D Layer**: Lines extruded by violation count

## Dependencies

All required packages are listed in `requirements.txt`:
- `streamlit>=1.28.0` - Web app framework
- `keplergl>=0.3.2` - Interactive 3D mapping
- `geopandas>=0.13.0` - Spatial data processing
- `pandas>=1.5.0` - Data manipulation
- Additional spatial and visualization libraries

## File Structure

```
dashboard/
├── app.py                  # Main Streamlit application
├── run_dashboard.py        # Launcher with dependency checking
└── README_DASHBOARD.md     # This file

notebooks/
├── 01_Final_Analysis.ipynb         # Main analysis notebook
└── kepler_3d_map_generator.py      # 3D map generation script

data/
├── processed/
│   ├── violations_with_stops.parquet    # Processed violation data
│   └── clear_lane_target_list.csv       # Target enforcement locations
└── raw/
    └── MTA_Bus_Route_Segment_Speeds...csv  # MTA speed data

visualizations/
├── interactive_3d_map.html         # Generated Kepler.gl map
├── exempt_hotspots_map.html        # Folium hotspot map
├── exempt_violations_by_hour.png   # Temporal analysis charts
└── exempt_violations_by_day.png
```

## Troubleshooting

### Map Generation Issues
- **Large Dataset**: Processing may take 5-10 minutes
- **Memory Usage**: Requires ~4GB RAM for full dataset
- **File Paths**: Ensure data files exist in expected locations

### Missing Dependencies
The launcher script automatically installs missing packages, but you can also:
```bash
pip install -r requirements.txt
```

### Display Issues
- **3D Map Not Loading**: Check browser console for JavaScript errors
- **Components Not Rendering**: Try refreshing the page
- **File Not Found**: Ensure all data files are in the correct directories

## Map Controls

### Interactive 3D Map Controls:
- **Pan**: Click and drag
- **Zoom**: Mouse wheel
- **Rotate 3D View**: Ctrl + Click and drag
- **Layer Toggle**: Use panel in top-right corner
- **Tooltips**: Hover over segments for details

### Map Layers:
1. **Bus Segments (Speed)**:
   - Color scale: Green (fast) to Red (slow)
   - Shows average speed per segment

2. **Bus Segments (3D Violations)**:
   - Height represents violation count
   - Color represents borough
   - Creates 3D "tower" effect

## Data Sources

- **MTA Bus Violations**: Camera enforcement violations dataset
- **Bus Route Speeds**: MTA GTFS and speed data
- **CUNY Locations**: Campus coordinate data
- **Spatial Analysis**: Geographic proximity calculations

---

For technical support or questions, please check the main project README or open an issue.