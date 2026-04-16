async function seed() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  const CLOUDFLARE_D1_TOKEN = process.env.CLOUDFLARE_D1_TOKEN || "";
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
  const CLOUDFLARE_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || "";

  const files = [
    { name: "cleudo-icon.png", path: "C:\\Users\\autom\\cleudocode\\web\\cleudo-icon.png", type: "image", size: 535558 },
    { name: "cleudo-logo.png", path: "C:\\Users\\autom\\cleudocode\\web\\cleudo-logo.png", type: "image", size: 427317 },
    { name: "header-bg.png", path: "C:\\Users\\autom\\cleudocode\\web\\header-bg.png", type: "image", size: 427317 },
    { name: "login_step.png", path: "C:\\Users\\autom\\cleudocode\\login_step.png", type: "image", size: 20380 }
  ];

  console.log(`🚀 Ingestão REST Direta: Processando ${files.length} arquivos...`);

  for (const file of files) {
    try {
      // 1. Gemini Embedding via REST (Versão Estável v1)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: file.name }] }
        })
      });

      if (!geminiRes.ok) throw new Error(`Gemini Error: ${await geminiRes.text()}`);
      const { embedding } = await geminiRes.json();

      // 2. Cloudflare D1 via REST
      const d1Url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`;
      const res = await fetch(d1Url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_D1_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: `INSERT INTO vectors (id, content, type, metadata, vector) VALUES (?, ?, ?, ?, ?)`,
          params: [
            crypto.randomUUID(),
            file.name,
            file.type,
            JSON.stringify({ path: file.path, size: file.size }),
            JSON.stringify(embedding.values)
          ]
        })
      });

      if (res.ok) console.log(`✅ ${file.name} sincronizado.`);
      else console.error(`❌ Erro D1 em ${file.name}`);

    } catch (e) {
      console.error(`💥 Falha em ${file.name}:`, e.message);
    }
  }
}

seed();
