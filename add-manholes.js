const fs = require('fs');
const file = './src/lib/mock-data.ts';
let data = fs.readFileSync(file, 'utf8');

const newManholes = `
  { id: 'node-mh-bandra-1', name: 'MH-BND-01 (Linking Road)', lat: 19.0620, lng: 72.8360, type: 'manhole', invertDepthMeters: 2.5, capacityLps: 350, surchargeTimelinePct: [20, 50, 80, 95, 80, 50, 20], status: 'normal' },
  { id: 'node-mh-bandra-2', name: 'MH-BND-02 (SV Road)', lat: 19.0550, lng: 72.8350, type: 'manhole', invertDepthMeters: 3.0, capacityLps: 400, surchargeTimelinePct: [30, 60, 90, 110, 90, 60, 30], status: 'warning' },
  { id: 'node-mh-andheri-1', name: 'MH-AND-01 (WEH Station)', lat: 19.1150, lng: 72.8550, type: 'manhole', invertDepthMeters: 4.0, capacityLps: 500, surchargeTimelinePct: [40, 80, 120, 140, 120, 80, 40], status: 'surcharging' },
  { id: 'node-mh-andheri-2', name: 'MH-AND-02 (Lokhandwala)', lat: 19.1410, lng: 72.8250, type: 'manhole', invertDepthMeters: 2.2, capacityLps: 250, surchargeTimelinePct: [10, 30, 50, 60, 50, 30, 10], status: 'normal' },
  { id: 'node-mh-powai-1', name: 'MH-POW-01 (JVLR)', lat: 19.1170, lng: 72.9050, type: 'manhole', invertDepthMeters: 3.5, capacityLps: 450, surchargeTimelinePct: [25, 55, 85, 105, 85, 55, 25], status: 'warning' },
  { id: 'node-mh-powai-2', name: 'MH-POW-02 (Hiranandani)', lat: 19.1190, lng: 72.9100, type: 'manhole', invertDepthMeters: 3.2, capacityLps: 420, surchargeTimelinePct: [15, 35, 65, 80, 65, 35, 15], status: 'normal' },
  { id: 'node-mh-colaba-1', name: 'MH-COL-01 (Causeway)', lat: 18.9220, lng: 72.8280, type: 'manhole', invertDepthMeters: 2.0, capacityLps: 200, surchargeTimelinePct: [50, 90, 130, 150, 130, 90, 50], status: 'surcharging' },
  { id: 'node-mh-worli-1', name: 'MH-WOR-01 (Seaface)', lat: 19.0150, lng: 72.8150, type: 'manhole', invertDepthMeters: 4.5, capacityLps: 600, surchargeTimelinePct: [20, 40, 70, 90, 70, 40, 20], status: 'normal' },
  { id: 'node-mh-dadar-1', name: 'MH-DAD-01 (Shivaji Park)', lat: 19.0270, lng: 72.8380, type: 'manhole', invertDepthMeters: 3.0, capacityLps: 380, surchargeTimelinePct: [35, 75, 115, 135, 115, 75, 35], status: 'surcharging' },
  { id: 'node-mh-juhu-1', name: 'MH-JUH-01 (Juhu Tara)', lat: 19.0990, lng: 72.8260, type: 'manhole', invertDepthMeters: 2.5, capacityLps: 300, surchargeTimelinePct: [30, 60, 100, 120, 100, 60, 30], status: 'surcharging' },
  { id: 'node-mh-kurla-1', name: 'MH-KUR-01 (LBS Marg)', lat: 19.0680, lng: 72.8790, type: 'manhole', invertDepthMeters: 3.8, capacityLps: 480, surchargeTimelinePct: [45, 85, 125, 145, 125, 85, 45], status: 'surcharging' },
  { id: 'node-mh-santacruz-1', name: 'MH-SAN-01 (SV Road)', lat: 19.0840, lng: 72.8360, type: 'manhole', invertDepthMeters: 2.8, capacityLps: 320, surchargeTimelinePct: [25, 50, 80, 100, 80, 50, 25], status: 'warning' },
`;

// Insert right after 'export const MUMBAI_NODES: DrainageNode[] = ['
data = data.replace('export const MUMBAI_NODES: DrainageNode[] = [', 'export const MUMBAI_NODES: DrainageNode[] = [\n' + newManholes);
fs.writeFileSync(file, data);
console.log('Manholes added.');
