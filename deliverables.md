### Key deliverables
Real-time rainfall ingestion and 0–3 hour nowcasting pipeline - Openmeteo / IMD api
High-resolution 2D surface/DEM model - CartoDEM v3 / Bhoonidhi (ISRO) 
Graph-based underground drainage network - (bottom)
Coupled surface–drainage hydraulic simulation engine 
Water-body, tide, and pumping-station integration 
Manhole-level surcharge and overflow prediction - Physics-Based Hydraulic Engine (Manning Slope, CartoDEM Elevation & Mass Balance)
Blockage, bottleneck, and hydraulic-overcapacity detection 
Street/intersection-level 0–3 hour flood forecasting - NA
Historical Mumbai event backtesting and validation 
Citizen ground-truth/correction layer
Predictive drainage-maintenance prioritization system
Water capture, storage, treatment, reuse and groundwater-routing layer
Real-time web GIS dashboard with forecast time slider
Flood-safe routing API
Multi-channel alerting system
Multilingual public and authority interface
Decision-support chatbot grounded in live system data
Automated flood situation-report generation
Offline/low-connectivity synchronization
Scalable near-real-time deployment architecture

### What is expected
Build a coupled flood-prediction system, rather than using rainfall/weather models independently.
Real-time rainfall input
Use high-resolution rainfall nowcasts from Doppler Weather Radar.
Continuously update rainfall intensity and predicted rainfall for the next 0–3 hours.
High-resolution terrain model
Integrate a high-resolution Digital Elevation Model (DEM).
Model roads, streets, intersections, low-lying areas, and concrete/impervious surfaces.
Determine how rainwater flows and accumulates on the surface.
Underground drainage network model
Represent the stormwater system as a directed graph:
Nodes: manholes, inlets, junctions, outfalls, etc.
Edges: pipes, drains, canals, channels, etc.
Include pipe dimensions, slopes, flow direction, and hydraulic capacity.
Coupled surface + drainage simulation
Route rainfall across the 2D surface terrain.
Determine how much water enters drainage inlets.
Simultaneously calculate flow through the underground drainage network.
Model interaction between surface runoff and underground drainage.
Hydraulic capacity and blockage prediction
Calculate whether each drain/pipe can handle incoming flow.
Detect overcapacity, bottlenecks, and potential blockages.
Predict when excess water will surcharge/backflow from drains onto streets.
Street-level flood prediction
Identify the specific streets, road segments, and intersections likely to flood.

#### Estimate parameters such as:
Water depth in centimeters
Flooded area
Time when flooding begins
Expected duration
Severity level
Direction of water flow
0–3 hour forecasting
Continuously produce a forward-looking flood forecast for the next 0–3 hours.
Update predictions as new radar rainfall data arrives.
Real-time GIS dashboard
Develop a web-based GIS interface.
Display live rainfall and predicted flooding on a city map.
Provide street-by-street/intersection-level flood projections.
Use color coding for flood severity and display estimated water depths.
Alerting and decision support
Highlight critical/bottleneck locations.
Identify areas requiring immediate intervention.
Provide warnings when predicted water depth exceeds predefined thresholds.
Navigation/routing API
Develop an API that can communicate with navigation/mapping systems.
Use predicted flood locations to identify unsafe roads.
Suggest flood-safe alternative routes for:
Emergency services
Public transport
Commuters
Update routes dynamically as flood conditions change.

### Challenge in Simple Terms
The goal is to build a real-time Urban Flood Nowcasting System that can answer:
“Given the rain happening right now, which exact roads/intersections will flood in the next 0–3 hours, how deep will the water be, and which routes should people avoid?”
What the solution needs to do
1. Take real-time rainfall data
Ingest high-resolution rainfall nowcasts from Doppler Weather Radar.
Continuously update rainfall predictions for the next 0–3 hours.
2. Understand the city's surface
Use a high-resolution DEM (Digital Elevation Model).
Represent roads, intersections, low-lying areas, slopes, and depressions.
Include impervious surfaces such as concrete/asphalt that generate rapid runoff.
3. Model the underground drainage system
Convert the stormwater network into a directed graph.
Nodes: manholes, drainage inlets, junctions, pumping stations, outfalls.
Edges: pipes, drains, canals, channels.
Include pipe diameter, length, slope, capacity, and flow direction where available.
4. Couple surface runoff with drainage
Take predicted rainfall and calculate surface runoff.
Route the runoff across the 2D terrain.
Determine how much water enters each drainage inlet.
Route that water through the underground drainage graph.
Identify locations where drainage capacity is insufficient.
5. Predict flooding
Detect:
Drainage overcapacity
Blockages
Surcharging
Backflow
Surface water accumulation
Predict exact roads/intersections likely to flood.
Estimate water depth in centimeters.
Predict when flooding starts and how it evolves over the next 0–3 hours.
6. Create a real-time GIS dashboard
Develop a browser-based map showing:
Current rainfall
Predicted rainfall
Flooded roads
Expected water depth
Flood severity
Drainage bottlenecks
0–3 hour forecast
Allow users to zoom from city level down to individual streets/intersections.
7. Develop a flood-aware routing API
Expose flood predictions through an API.
Integrate with navigation/mapping applications.
Mark flooded or high-risk roads as unavailable/unsafe.
Generate alternative routes for:
🚑 Emergency services
🚌 Public transport
🚗 General commuters
8. Make it real-time
The system should continuously receive new radar observations.
Recalculate rainfall → runoff → drainage → flooding.
Update the GIS map and routing recommendations automatically.