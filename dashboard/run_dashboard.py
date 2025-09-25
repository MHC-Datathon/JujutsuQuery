#!/usr/bin/env python3
"""
Launch script for the ACE Intelligence System Dashboard
This script ensures all dependencies are installed and launches the Streamlit app
"""

import sys
import subprocess
import os
import pkg_resources

def check_and_install_dependencies():
    """Check if required packages are installed, install if missing"""

    required_packages = {
        'streamlit': '1.28.0',
        'pandas': '1.5.0',
        'geopandas': '0.13.0',
        'keplergl': '0.3.2',
        'folium': '0.14.0',
        'streamlit-folium': '0.13.0',
        'pillow': '9.0.0',
        'shapely': '2.0.0',
        'numpy': '1.24.0',
        'pyarrow': '12.0.0',
        'matplotlib': '3.7.0'
    }

    print("🔍 Checking dependencies...")
    missing_packages = []

    for package, min_version in required_packages.items():
        try:
            if package == 'pillow':
                # Pillow is imported as PIL
                __import__('PIL')
            else:
                __import__(package.replace('-', '_'))
            print(f"✅ {package} - OK")
        except ImportError:
            print(f"❌ {package} - Missing")
            missing_packages.append(package)

    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', '--upgrade'
            ] + missing_packages)
            print("✅ All dependencies installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing packages: {e}")
            print("Please install manually: pip install " + " ".join(missing_packages))
            return False
    else:
        print("✅ All dependencies are satisfied!")

    return True

def launch_dashboard():
    """Launch the Streamlit dashboard"""
    print("\n🚀 Launching ACE Intelligence System Dashboard...")

    # Change to the dashboard directory
    dashboard_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(dashboard_dir)

    try:
        # Launch Streamlit
        subprocess.run([
            sys.executable, '-m', 'streamlit', 'run', 'app.py',
            '--server.port=8501',
            '--server.address=localhost',
            '--server.headless=false'
        ])
    except KeyboardInterrupt:
        print("\n👋 Dashboard stopped by user")
    except Exception as e:
        print(f"❌ Error launching dashboard: {e}")

def main():
    """Main function"""
    print("=" * 60)
    print("🚌 ACE Intelligence System Dashboard Launcher")
    print("=" * 60)

    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return

    print(f"✅ Python {sys.version.split()[0]} detected")

    # Check and install dependencies
    if not check_and_install_dependencies():
        return

    # Launch the dashboard
    launch_dashboard()

if __name__ == "__main__":
    main()