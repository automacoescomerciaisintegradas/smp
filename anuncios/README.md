# Pasta `anuncios`

Estrutura esperada para o hook `meta:ads:deploy`:

```text
anuncios/
  deploy.json
  anuncio-1/
    vertical.mp4
    horizontal.mp4
    quadrado.mp4
  anuncio-2/
    vertical.mp4
    horizontal.mp4
    quadrado.mp4
  anuncio-3/
    vertical.mp4
    horizontal.mp4
    quadrado.mp4
```

Tambem funciona com imagens: `jpg`, `jpeg`, `png` ou `webp`.

Comando de validacao:

```bash
npm run meta:ads:deploy -- --manifest ./anuncios/deploy.json --dry-run
```

Quando o plano estiver correto, troque no `deploy.json`:

```json
{
  "mode": "LIVE",
  "dryRun": false
}
```
