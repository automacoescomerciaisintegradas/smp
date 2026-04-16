require('dotenv').config({ path: '.env.local' });

async function fetchProfile() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!token) {
    console.error('Erro: INSTAGRAM_ACCESS_TOKEN não encontrado no .env.local');
    process.exit(1);
  }

  // Se não tivermos o ID da conta, tentamos buscar via /me
  const fields = 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography';
  const url = `https://graph.instagram.com/v23.0/me?fields=${fields}&access_token=${token}`;

  console.log('--- BUSCANDO PERFIL NO INSTAGRAM ---');
  console.log(`URL: ${url.replace(token, 'TOKEN_OCULTO')}`);

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error('Erro na API:', data.error.message);
      
      // Tentativa 2: Usando graph.facebook.com se for conta comercial
      console.log('\nTentando via Graph Facebook (Conta Business)...');
      const busUrl = `https://graph.facebook.com/v23.0/${accountId || 'me/accounts'}?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}&access_token=${token}`;
      const busRes = await fetch(busUrl);
      const busData = await busRes.json();
      
      if (busData.instagram_business_account) {
          console.log('\nDados encontrados (Business):');
          console.log(JSON.stringify(busData.instagram_business_account, null, 2));
          return;
      }
      
      console.log('Falha em ambas as tentativas.');
      return;
    }

    console.log('\nDados encontrados:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erro de rede:', err.message);
  }
}

fetchProfile();
