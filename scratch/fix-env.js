const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
let content = fs.readFileSync(envPath, 'utf8');

const token = 'EAA0ZCSdRLI3EBRJqGZCMKKfSEY6eSnVbZCL3tR5XOl47c0pCj6SupNCEWFPZCPFmizhvzXQQXpzZCnJ3LfgEZBtSEaYdfKTQzLlU2OloByOSJPRIRZBZBaXUKZC8bPZAKmEAQdZCPNzkO5vUwkS1zmoVWj9QqkHNr4uWiwKygErhtUCt33GJmOosojZCIUPHDoMF0DigqgLM1wFU2x1FhuvWK7B5kRGxX7CzJbUq2yI2NG0gpZBncQHZCo6CfHHHgLZC0ZB5kgrSajE3SMPj0sQZD';
const id = '31312992044981677';
const appId = '1446210993200002';

const lines = [
    `INSTAGRAM_ACCESS_TOKEN=${token}`,
    `INSTAGRAM_ACCOUNT_ID=${id}`,
    `META_APP_ID=${appId}`,
    `FACEBOOK_CLIENT_ID=${appId}`,
    `META_API_VERSION=v23.0`
];

lines.forEach(line => {
    const key = line.split('=')[0];
    if (content.includes(key + '=')) {
        const regex = new RegExp(key + '=.*', 'g');
        content = content.replace(regex, line);
    } else {
        content += '\n' + line;
    }
});

fs.writeFileSync(envPath, content.trim() + '\n');
console.log('Ambiente restaurado com sucesso!');
