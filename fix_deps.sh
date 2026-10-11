sed -i 's/}, \[selectedCityId, timeOffsetMins, showRoadsLayer\]);/}, \[selectedCityId, timeOffsetMins, showRoadsLayer, hydraulicSnapshotOverride\]);/g' src/components/OpenLayersMapCanvas.tsx
