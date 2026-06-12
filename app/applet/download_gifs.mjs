import https from 'https';
import fs from 'fs';
import path from 'path';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function run() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  await download('https://media.tenor.com/qIuXjorg6-sAAAAC/bubu-waiting-bubu-wait.gif', path.join(publicDir, 'waiting.gif'));
  await download('https://media.tenor.com/7JmlRYlF6ooAAAAC/bubu-dance-happy.gif', path.join(publicDir, 'happy.gif'));
  console.log('Downloaded');
}

run();
