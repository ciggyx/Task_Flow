// bench-register.js
const autocannon = require('autocannon');

let counter = 0;
const inst = autocannon({
  url: 'http://localhost:3002',
  connections: 1000,    
  duration: 4,       
  requests: [
    {
      method: 'POST',
      path: '/auth/register',
      headers: { 'content-type': 'application/json' },
      setupRequest: (req) => {
        counter++;
        const email = `load${Date.now()}-${counter}@example.com`;
        const name = `user${Date.now()}-${counter}`;
        req.body = JSON.stringify({ name, email, password: 'Pass1234' });
        return req;
      }
    }
  ]
}, (err, res) => {
  if (err) throw err;
  require('fs').writeFileSync('autocannon-register-report.json', JSON.stringify(res, null, 2));
  console.log('Finished. Report -> autocannon-register-report.json');
});

autocannon.track(inst, { renderProgressBar: true });
