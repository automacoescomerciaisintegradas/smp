
async function test() {
    const url = 'https://s.shopee.com.br/70G4t7VuAU';
    console.log('Testing URL:', url);
    
    try {
        const h = await fetch(url, { 
            method: 'HEAD', 
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });
        const targetUrl = h.url;
        console.log('Final URL:', targetUrl);
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });
        
        const html = await response.text();
        console.log('HTML Length:', html.length);
        
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        
        console.log('Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
        console.log('Image:', imageMatch ? imageMatch[1] : 'NOT FOUND');
        
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
