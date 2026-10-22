import http from 'http';
import { selectNextUpcomingLaunch } from '../utils/nextLaunchSelector.js';

http.get('http://localhost:3000/api/launches?type=upcoming&limit=25', (res) => {
  let body = '';
  res.on('data', (d) => (body += d));
  res.on('end', () => {
    const json = JSON.parse(body);
    const launches = json.launches || [];
    console.log('Total fetched:', launches.length);
    launches.forEach((l, idx) => {
      console.log(`[${idx}] ${l.name} | NET: ${l.net} | status: ${l.status?.name}`);
    });
    const next = selectNextUpcomingLaunch(launches);
    console.log('Selected next launch:', next ? next.name : 'NONE (null)');
  });
});
