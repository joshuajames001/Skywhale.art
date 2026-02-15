import https from 'https';
import fs from 'fs';

const data = JSON.stringify({
    action: 'list-models'
});

const options = {
    hostname: 'gtixrzbgnstqulqvphtx.supabase.co',
    port: 443,
    path: '/functions/v1/generate-story-content',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const json = JSON.parse(body);
                if (json.models) {
                    const names = json.models
                        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                        .map(m => m.name);

                    fs.writeFileSync('models.json', JSON.stringify(names, null, 2));
                    console.log('✅ Wrote models.json');
                } else {
                    console.log('Response:', body);
                }
            } catch (e) {
                console.log('Raw Body:', body);
            }
        } else {
            console.error(`❌ Error ${res.statusCode}:`, body);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
