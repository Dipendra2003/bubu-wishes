import https from 'https';

https.get('https://tenor.com/search/bubu+dudu-gifs', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/https:\/\/media\.tenor\.com\/[^"']+\.gif/g);
    if (matches) {
      console.log('Found GIFs:');
      console.log([...new Set(matches)].slice(0, 5).join('\n'));
    } else {
      console.log('No gifs found');
    }
  });
}).on('error', err => {
  console.log('Error:', err.message);
});
