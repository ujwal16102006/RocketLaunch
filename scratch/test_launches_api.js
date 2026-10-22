const http = require('http');

http.get('http://localhost:3000/api/launches?type=upcoming&limit=12', (res) => {
  let body = '';
  res.on('data', (d) => (body += d));
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    try {
      const json = JSON.parse(body);
      console.log('Launches length:', json.launches ? json.launches.length : 'none');
      console.log('Error field:', json.error);
      if (json.launches && json.launches.length > 0) {
        console.log('First launch name:', json.launches[0].name);
        console.log('First launch net:', json.launches[0].net);
      }
    } catch (e) {
      console.log('Raw body preview:', body.slice(0, 500));
    }
  });
}).on('error', (err) => console.error('Fetch error:', err.message));
