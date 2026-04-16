
async function test() {
    const shopid = '313150954';
    const itemid = '23891090146';
    const url = `https://shopee.com.br/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`;
    
    console.log('Testing API:', url);
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://shopee.com.br/'
            }
        });
        
        const data = await response.json();
        console.log('API Response Success:', !!data.data);
        if (data.data) {
            console.log('Title:', data.data.name);
            console.log('Price:', data.data.price / 100000); // Shopee price is usually * 100000
            console.log('Image:', `https://down-br.img.susercontent.com/file/${data.data.image}`);
        } else {
            console.log('Response:', JSON.stringify(data).substring(0, 200));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
