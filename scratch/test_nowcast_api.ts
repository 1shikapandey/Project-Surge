import { GET } from '../src/app/api/nowcast/route';

async function testNowcastApi() {
  console.log('Testing GET /api/nowcast?city=mumbai...');
  try {
    const req = new Request('http://localhost:3000/api/nowcast?city=mumbai');
    const res = await GET(req);
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response data:', data);
  } catch (err: any) {
    console.error('API Exec Error:', err?.stack || err?.message || err);
  }
}

testNowcastApi();
