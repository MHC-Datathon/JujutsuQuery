# ACE Intelligence System: The ClearLane Initiative 🚌💨

We're Team Jujutsu Query, and this project started with something we see every day: CUNY students trying to study on stuck buses. What began as a personal frustration with the BxM10 route turned into a comprehensive investigation that uncovered a massive system failure and led us to build a solution that could give back 7 million student hours to New York City.

## Our Team

- [Basir Abdul Samad](https://github.com/BasirS)
- [Albert Bagdasarov](https://github.com/AlbertBagdos256)
- [Caitlin Reyes](https://github.com/Caitlin-Reyes)
- [Tenzin Namdol](https://github.com/Tenzin-Namdol)

## See Our Work in Action

- **Live Dashboard**: [https://jujutsuquery-mta-analytics.streamlit.app/](https://jujutsuquery-mta-analytics.streamlit.app/)
- **Interactive Website**: [https://basirs.github.io/ACE_Intelligence_System/](https://basirs.github.io/ACE_Intelligence_System/)
- **Video Presentation**: [https://youtu.be/QIEuvQGrqm8](https://youtu.be/QIEuvQGrqm8)

## The Story Behind the Numbers

For thousands of CUNY students, the bus commute is their rolling study hall. It's where homework gets done, where notes get reviewed, and where tired students catch a moment of rest between classes and jobs. When buses get stuck in traffic because someone's blocking the bus lane, it's not just about being late. It's about lost study time that compounds into lost opportunities.

We decided to investigate whether the city's automated camera enforcement system was actually helping these students. After processing 3.78 million violation records across seven comprehensive notebooks, we discovered something shocking that we document fully in [Notebook 04](notebooks/04_final_complete_analysis.ipynb): the system has an 85.6% failure rate. That means on 477 out of 557 camera-enforced routes, bus speeds actually got worse or stayed the same despite all that enforcement.

## What We Found

### The Enforcement Paradox

We created something we call the Paradox Score, which you can see calculated in [Notebook 01](notebooks/01_understanding_the_pipeline.ipynb). This metric identifies routes where lots of enforcement happens but speeds don't improve. The worst offender? Route Q44+ accumulated 164,806 violations yet saw speeds drop by 3.3%. Even more concerning for students, the M2 route that serves Hunter College saw speeds drop by 3.8% despite heavy enforcement.

You can explore these patterns yourself in our [temporal visualizations](plots/temporal_patterns.png) and [paradox analysis charts](plots/paradox_by_period_top_routes.png).

### The Policy Loophole

Digging deeper in our analysis, we found the real problem wasn't random traffic. It was a massive policy loophole that we detail in [Notebook 04](notebooks/04_final_complete_analysis.ipynb). Here's what the data shows:

- 23% of all violations (870,810 out of 3.78 million) come from vehicles that are exempt from fines
- Nearly half (46.9%) of these exempt vehicles are chronic repeat offenders
- The worst single offender racked up 1,377 violations over 658 days

You can see the geographic concentration of these violations in our [exempt vehicle analysis map](plots/exempt_spatial_scatter.html) and the [violation distribution charts](plots/exempt_vehicle_analysis.png).

### The Human Cost

When we calculated the impact on students, the numbers were staggering. Across CUNY campuses, this system failure costs over 7 million student hours annually. That's 7 million hours that could have been spent studying, working, or resting, but were instead lost to preventable traffic delays. Our [CUNY campus analysis](plots/cuny_campus_analysis.png) breaks this down by campus, showing which students are hit hardest.

## Our Solution: The ClearLane Initiative

We didn't just identify problems. We built a solution that's ready to implement tomorrow. The ClearLane Initiative, which we detail in [Notebook 05](notebooks/05_focused_analysis.ipynb), takes a surgical approach to fixing this broken system.

Instead of trying to monitor the entire city, we identified the specific locations and times where enforcement would have the biggest impact on student commutes. Our analysis found that by focusing on just 10 high-priority bus stops near CUNY campuses during the 7 to 10 AM weekday rush, the city could dramatically improve conditions for students.

The top priority location alone had 16,868 violations, with 8,253 happening during that critical morning commute window. You can explore the full target list in our [interactive dashboard](https://jujutsuquery-mta-analytics.streamlit.app/) or see the geographic distribution in our [enhanced spatial intelligence map](plots/enhanced_spatial_intelligence_map.html).

## Addressing the Datathon Questions

### Question 1: CUNY Student Routes and Speed Changes

Our analysis in [Notebook 04](notebooks/04_final_complete_analysis.ipynb) identified 9 routes serving CUNY campuses within a 500-meter buffer. Routes like the M15+, M2, and M101 serving Hunter College showed consistent speed declines despite ACE enforcement. The comparison between ACE-enforced CUNY routes and non-enforced routes revealed that enforcement alone wasn't solving the problem, which led us to dig deeper into why.

### Question 2: Exempt Vehicle Patterns

This became the heart of our investigation. Through our [exempt vehicle analysis](notebooks/04_final_complete_analysis.ipynb), we mapped where these vehicles cluster and identified the chronic offenders. The [spatial visualization](plots/exempt_spatial_scatter.html) shows clear hotspots near major corridors, and our repeat offender analysis revealed patterns that suggest systematic abuse rather than occasional necessity.

### Question 3: CBD and Congestion Pricing

We analyzed the Central Business District thoroughly, as shown in our [CBD analysis charts](plots/cbd_congestion_pricing_analysis.png). While we found that violations increased by 15.8% in the CBD area and CUNY routes there saw speed declines of 1.3%, our analysis revealed that the localized exempt vehicle problem was more immediately solvable and would have greater impact on student commutes. You can explore the before and after patterns in our [interactive CBD map](plots/cbd_congestion_pricing_map.html).

## The Technical Foundation

Our analysis pipeline, which you can follow step by step in our notebooks, processes the data through several stages:

1. **Data Understanding** ([Notebook 01](notebooks/01_understanding_the_pipeline.ipynb)): We built transparent metrics including the Enforcement Intensity Score and Paradox Score
2. **Feature Engineering** ([Notebook 02](notebooks/02_feature_engineering.ipynb)): We created 41 features across temporal, spatial, CUNY proximity, and adaptation categories
3. **Predictive Modeling** ([Notebook 03](notebooks/03_continued_predictive_story.ipynb)): We validated the 85.6% failure rate and built deployment strategies
4. **Comprehensive Analysis** ([Notebook 04](notebooks/04_final_complete_analysis.ipynb)): Our definitive investigation that answers all three Datathon questions
5. **Focused Solutions** ([Notebook 05](notebooks/05_focused_analysis.ipynb)): The ClearLane Initiative targeting specific locations and times
6. **CUNY Impact Assessment** ([Notebook 06](notebooks/06_csv_generation.ipynb)): Detailed campus-level analysis and data exports
7. **Ridership Prediction** ([Notebook 07](notebooks/07_bus_ridership_prediction.ipynb)): Machine learning model achieving 96.3% accuracy for route prioritization

All our processed data, including the model-ready dataset with 453,935 location-hour rows, is available in the [data/processed](data/processed/) directory.

## Getting Started

If you want to explore our findings:

1. **Quick Start**: Visit our [live dashboard](https://jujutsuquery-mta-analytics.streamlit.app/) to interact with the data immediately
2. **Run Locally**: Clone this repository and follow the setup instructions below
3. **Deep Dive**: Read through our [comprehensive analysis notebook](notebooks/04_final_complete_analysis.ipynb) for the full investigation

### Local Setup

```bash
# Clone the repository
git clone https://github.com/MHC-Datathon/JujutsuQuery.git

# Install dependencies
pip install -r requirements.txt

# Launch the dashboard
python dashboard/run_dashboard.py
```

## The Impact

By implementing the ClearLane Initiative, New York City could:
- Return 7 million hours annually to CUNY students
- Save an estimated $15 million per year in operational efficiency
- Transform a reactive ticketing system into a proactive solution
- Actually improve bus speeds instead of just issuing violations

This isn't about technology for technology's sake. It's about recognizing that buses are educational infrastructure for thousands of students, and that every minute stuck in preventable traffic is a minute stolen from their futures.

## Next Steps

We've provided everything needed for immediate implementation:
- A [target list of priority locations](data/processed/clear_lane_target_list.csv)
- Specific deployment times (7-10 AM weekdays)
- Validation metrics to track success
- A phased rollout plan detailed in our final analysis

The data tells a clear story: the current system is failing our students. But it also shows us exactly how to fix it. The ClearLane Initiative isn't just another report. It's a turnkey solution, backed by 3.78 million data points and ready to deploy tomorrow.

## Acknowledgments

This project was developed for the 2025 MTA Datathon at Macaulay Honors College. We thank the MTA for providing the data that made this investigation possible, and we hope our findings contribute to meaningful improvements in New York City's public transportation system.

---

*For detailed documentation of our methodology, data sources, and technical implementation, please refer to our [comprehensive notebooks](notebooks/) and [results documentation](results/txt/).*
