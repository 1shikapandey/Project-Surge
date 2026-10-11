const fs = require('fs');
let code = fs.readFileSync('src/components/OpenLayersMapCanvas.tsx', 'utf8');

const replacement = `      const { roads } = getCityDataset(selectedCityId);
      const road = roads.find(r => r.id === selectedFeatureId);
      if (road && road.coordinates.length > 0) {
        const midIdx = Math.floor(road.coordinates.length / 2);
        const midCoord = road.coordinates[midIdx];
        const coord = fromLonLat([midCoord[1], midCoord[0]]);
        mapRef.current.getView().animate({ center: coord, zoom: 16, duration: 600 });
        const snapshotData = hydraulicSnapshotOverride || getHydraulicSnapshotAtTime(timeOffsetMins, selectedCityId);
        const roadState = snapshotData.roadStates.find(r => r.roadId === road.id);
        const depthCm = roadState ? roadState.waterDepthCm : 0;
        const severity = roadState ? roadState.severity : 'safe';
        const isCritical = depthCm >= 20;
        const isWarning = depthCm >= 8;
        const isGalli = road.highwayCategory === 'Galli / Local Lane' || road.id.startsWith('galli-');

        setPopupContent({
          title: road.name,
          subtitle: \`Borough: \${road.borough} • DEM Alt: \${road.demElevationMeters}m MSL\`,
          badge: {
            text: isGalli ? 'Galli / Local Lane' : (road.highwayCategory || 'Arterial Corridor'),
            color: isGalli ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-800'
          },
          details: [
            {
              label: 'Water Depth',
              value: \`\${depthCm} cm\`,
              color: isCritical ? 'text-orange-600 font-bold' : isWarning ? 'text-orange-600 font-bold' : 'text-green-700'
            },
            {
              label: 'Severity Level',
              value: severity.toUpperCase(),
              color: isCritical ? 'text-orange-600 font-bold' : isWarning ? 'text-orange-600 font-bold' : 'text-green-700'
            },
            {
              label: 'Corridor Passability',
              value: depthCm >= 35 ? 'IMPASSABLE / CLOSED' : depthCm >= 15 ? 'HIGH-CLEARANCE ONLY' : 'OPEN TO TRAFFIC'
            }
          ]
        });
        overlayRef.current.setPosition(coord);
      } else {
        // Fallback for ANY other feature in our vector sources (lakes, reports, hotspots)
        const sources = [
          reportsClusterSourceRef.current?.getSource(),
          signalsVectorSourceRef.current,
          hotspotsVectorSourceRef.current,
          evacuationVectorSourceRef.current,
          drainageVectorSourceRef.current
        ];
        
        for (const source of sources) {
          if (!source) continue;
          const features = source.getFeatures();
          const target = features.find(f => f.get('id') === selectedFeatureId);
          if (target) {
            const geom = target.getGeometry();
            if (geom) {
              let extent = geom.getExtent();
              let coord = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
              mapRef.current.getView().animate({ center: coord, zoom: 16, duration: 600 });
              
              setPopupContent({
                title: target.get('name') || target.get('title') || 'Selected Feature',
                subtitle: target.get('issueType') || target.get('borough') || 'Selected from sidebar',
                badge: { text: target.get('type') || 'Asset', color: 'bg-blue-100 text-blue-800' },
                details: []
              });
              overlayRef.current.setPosition(coord);
              break;
            }
          }
        }
      }`;

code = code.replace(/const \{ roads \} = getCityDataset\(selectedCityId\);[\s\S]*?overlayRef\.current\.setPosition\(coord\);\s+\}/g, replacement);

fs.writeFileSync('src/components/OpenLayersMapCanvas.tsx', code);
