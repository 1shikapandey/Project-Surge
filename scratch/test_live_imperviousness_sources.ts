async function testEsriAndWorldCover() {
  console.log('Testing Esri ArcGIS Living Atlas & ESA WorldCover STAC...');

  // Esri Sentinel-2 10m Land Cover ImageServer (ArcGIS Living Atlas)
  const esriUrls = [
    'https://landscape10.arcgisonline.com/arcgis/rest/services/Sentinel2_10m_LandCover_2020/ImageServer/exportImage?f=json&bbox=72.75,18.85,72.98,19.25&bboxSR=4326&imageSR=4326&size=100,100&format=json',
    'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=72.75,18.85,72.98,19.25&bboxSR=4326&imageSR=4326&size=100,100&f=json'
  ];

  for (const url of esriUrls) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url.slice(0, 80)}...`);
      console.log('Status:', res.status, res.statusText);
      if (res.ok) {
        const json = await res.json();
        console.log('JSON Output:', JSON.stringify(json).slice(0, 150));
      }
    } catch (e: any) {
      console.log('Error:', e.message);
    }
  }

  // Test STAC API query for Delhi [77.10, 28.50, 77.35, 28.75] and Chennai [80.15, 12.90, 80.30, 13.15]
  const cities = [
    { id: 'mumbai', bbox: [72.75, 18.85, 72.98, 19.25] },
    { id: 'delhi', bbox: [77.10, 28.50, 77.35, 28.75] },
    { id: 'chennai', bbox: [80.15, 12.90, 80.30, 13.15] }
  ];

  for (const city of cities) {
    const stacSearchUrl = `https://planetarycomputer.microsoft.com/api/stac/v1/search?collections=esa-worldcover&bbox=${city.bbox.join(',')}`;
    try {
      const res = await fetch(stacSearchUrl);
      if (res.ok) {
        const data = await res.json();
        const item = data.features?.[0];
        console.log(`STAC [${city.id}] status 200 OK — item id: ${item?.id}, COG url: ${item?.assets?.map?.href}`);
      } else {
        console.log(`STAC [${city.id}] failed status:`, res.status);
      }
    } catch (e: any) {
      console.log(`STAC [${city.id}] Error:`, e.message);
    }
  }
}

testEsriAndWorldCover();
