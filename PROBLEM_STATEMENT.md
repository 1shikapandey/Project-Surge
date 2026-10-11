### Urban Flood Nowcasting System (Drainage and Rainfall Coupling)

Urban flooding in major Indian metros like Mumbai, Delhi, and Chennai has become an annual crisis. Traditional Numerical Weather Prediction (NWP) models fall short because knowing how much rain will fall does not automatically translate into knowing where the streets will flood. Urban flooding is a hyper-local phenomenon dictated by micro-topography, concrete imperviousness, and heavily strained, invisible drainage networks. Currently, municipal bodies lack real-time, street-level predictive systems. Consequently, cities are caught off guard by rapid water accumulation, leading to severe traffic gridlocks, economic disruption, and loss of life.

The system delivers a high-resolution, real-time Urban Flood Nowcasting System (0–3 hour lead time) capable of predicting street-level inundation before it happens.

The architecture builds a coupled framework fusing real-time rainfall nowcasts with high-resolution Digital Elevation Models (DEM) and a graph-based mathematical model of the city's underground drainage network. By mapping how water flows, accumulates, and surcharges across concrete surfaces and drainage nodes, the solution pinpoints exactly which streets or intersections will flood. It develops a pipeline that takes high-resolution rainfall nowcasts (from Doppler Weather Radars) and instantly routes that volume across a 2D surface terrain model. Stormwater drain networks are represented as a directed graph (nodes as manholes/inlets, edges as pipes/canals). The model calculates hydraulic capacity and predicts where blockages or overcapacity will cause backflow onto the streets. A dynamic, web-based GIS dashboard displays real-time, street-by-street flooding projections (e.g., water depth estimations in centimeters) with a 0–3 hour forward-looking window, alongside an API utility that interfaces with navigation maps to suggest flood-safe alternative routes for emergency services, public transit, and commuters during heavy downpours.

#### Organization
Ministry of Earth Sciences (MoES)
#### Department
National Centre for Medium Range Weather Forecasting (NCMRWF)
#### Category
Software
#### Theme
Disaster Management
