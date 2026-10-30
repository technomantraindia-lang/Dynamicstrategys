const https = require('https');
const fs = require('fs');
const path = require('path');

const ids = [
  '8293664',
  '8293666',
  '8293660',
  '8293661',
  '8293662',
  '8293663',
  '8293665',
  '8293667',
  '8293668',
  '8293669',
  '8293670'
];

async function check() {
  for (const id of ids) {
    const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
    const dest = path.join('temp_indian', `${id}.jpg`);
    if (!fs.existsSync('temp_indian')) fs.mkdirSync('temp_indian');
    
    await new Promise((res) => {
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
        if (r.statusCode === 200) {
          const f = fs.createWriteStream(dest);
          r.pipe(f);
          f.on('finish', () => {
            console.log(`Saved ${id} (${fs.statSync(dest).size} bytes)`);
            res();
          });
        } else {
          console.log(`ID ${id}: status ${r.statusCode}`);
          res();
        }
      }).on('error', () => res());
    });
  }
}

check();
