const fs = require('fs');
let code = fs.readFileSync('src/components/OpenLayersMapCanvas.tsx', 'utf8');

const replacement = `let svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#ea580c' stroke='#ffffff' stroke-width='2'/><path d='M12 8v5M12 15.5v1' stroke='white' stroke-width='2.5' stroke-linecap='round'/></svg>";
      let pinColor = '#ea580c';
      if (sig.issueType === 'blocked_inlet') {
        pinColor = '#dc2626';
        svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#dc2626' stroke='#ffffff' stroke-width='2'/><path d='M6 6h12M6 9h12M6 12h12M6 15h12' stroke='white' stroke-width='1.5'/></svg>";
      }
      else if (sig.issueType === 'drain_overflow') {
        pinColor = '#991b1b';
        svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#991b1b' stroke='#ffffff' stroke-width='2'/><path d='M5 13c2-4 12-4 14 0M5 10c2-4 12-4 14 0' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/></svg>";
      }
      else if (sig.issueType === 'sewer_backflow') {
        pinColor = '#7e22ce';
        svgCode = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='11' fill='#7e22ce' stroke='#ffffff' stroke-width='2'/><path d='M12 5v14M8 9l4-4 4 4' stroke='white' stroke-width='2' stroke-linecap='round' fill='none'/></svg>";
      }

      const iconUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgCode);

      feature.setStyle([
        new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: 'rgba(239, 68, 68, 0.2)' }),
            stroke: new Stroke({ color: pinColor, width: 1.5, lineDash: [3, 3] })
          })
        }),
        new Style({
          image: new Icon({ src: iconUrl, scale: 0.85 })
        }),`;

// Need to replace the signal style block
code = code.replace(/let pinColor = '#ea580c';\s+if \(sig\.issueType === 'blocked_inlet'\) pinColor = '#dc2626';\s+else if \(sig\.issueType === 'drain_overflow'\) pinColor = '#991b1b';\s+else if \(sig\.issueType === 'sewer_backflow'\) pinColor = '#7e22ce';\s+feature\.setStyle\(\[\s+new Style\({\s+image: new CircleStyle\({\s+radius: 12,\s+fill: new Fill\({ color: 'rgba\(239, 68, 68, 0\.2\)' }\),\s+stroke: new Stroke\({ color: pinColor, width: 1\.5, lineDash: \[3, 3\] }\)\s+}\)\s+}\),\s+new Style\({\s+image: new CircleStyle\({\s+radius: 6,\s+fill: new Fill\({ color: pinColor }\),\s+stroke: new Stroke\({ color: '#ffffff', width: 2 }\)\s+}\),/g, replacement);

fs.writeFileSync('src/components/OpenLayersMapCanvas.tsx', code);
