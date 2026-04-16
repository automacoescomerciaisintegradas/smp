import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  MetaAdsDeployService,
  type MetaAdsDeployRequest,
} from '../src/services/meta/meta-ads-deploy.service';
import { createMetaApiClient } from '../src/services/meta/meta-api-client';
import type { CallToAction, CampaignObjective } from '../src/types/sama';

interface DeployManifest extends Partial<MetaAdsDeployRequest> {}

function loadEnvFiles() {
  const loadEnvFile = (process as typeof process & {
    loadEnvFile?: (filePath?: string) => void;
  }).loadEnvFile;

  for (const candidate of ['.env.local', '.env']) {
    const resolved = path.resolve(candidate);
    if (!existsSync(resolved)) {
      continue;
    }

    if (loadEnvFile) {
      loadEnvFile(resolved);
      continue;
    }
  }
}

async function loadManifest(manifestPath?: string): Promise<DeployManifest> {
  if (!manifestPath) {
    return {};
  }

  const absolutePath = path.resolve(manifestPath);
  const fileContent = await readFile(absolutePath, 'utf8');
  return JSON.parse(fileContent) as DeployManifest;
}

function parseCountries(value?: string): string[] | undefined {
  if (!value) {
    return undefined;
  }

  return value
    .split(',')
    .map(item => item.trim().toUpperCase())
    .filter(Boolean);
}

function getRuntimeEnv() {
  const required = {
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN,
    META_AD_ACCOUNT_ID: process.env.META_AD_ACCOUNT_ID,
    FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    accessToken: required.META_ACCESS_TOKEN!,
    adAccountId: required.META_AD_ACCOUNT_ID!,
    pageId: required.FACEBOOK_PAGE_ID!,
    instagramActorId: process.env.INSTAGRAM_ACCOUNT_ID,
    apiVersion: process.env.META_API_VERSION || 'v25.0',
  };
}

function coerceRequest(input: DeployManifest): MetaAdsDeployRequest {
  return {
    sourceDir: input.sourceDir || 'anuncios',
    campaignName: input.campaignName || '',
    adSetName: input.adSetName || 'Conjunto Principal',
    objective: (input.objective || 'TRAFFIC') as CampaignObjective,
    dailyBudget: Number(input.dailyBudget || 0),
    destinationUrl: input.destinationUrl || '',
    primaryText: input.primaryText || '',
    headline: input.headline,
    description: input.description,
    cta: (input.cta || 'LEARN_MORE') as CallToAction,
    countries: input.countries,
    mode: input.mode || 'DRAFT',
    dryRun: input.dryRun,
  };
}

function printHelp() {
  console.log(`Uso:
  npm run meta:ads:deploy -- --manifest ./anuncios/deploy.json --dry-run

Opcoes principais:
  --source           Pasta com os anuncios. Default: ./anuncios
  --manifest         JSON com os campos do deploy
  --campaignName     Nome da campanha
  --adSetName        Nome do conjunto de anuncios
  --objective        Objetivo da campanha. Ex.: TRAFFIC
  --dailyBudget      Orcamento diario em moeda inteira. Ex.: 150
  --destinationUrl   URL de destino do anuncio
  --primaryText      Texto principal
  --headline         Headline do anuncio
  --description      Descricao curta
  --cta              CTA. Ex.: LEARN_MORE
  --countries        Lista CSV de paises. Ex.: BR,US
  --mode             DRAFT ou LIVE
  --dry-run          Gera o plano sem criar nada na Meta
  --json             Imprime somente JSON
  --help             Exibe esta ajuda`);
}

async function main() {
  loadEnvFiles();

  const { values } = parseArgs({
    options: {
      source: { type: 'string' },
      manifest: { type: 'string' },
      campaignName: { type: 'string' },
      adSetName: { type: 'string' },
      objective: { type: 'string' },
      dailyBudget: { type: 'string' },
      destinationUrl: { type: 'string' },
      primaryText: { type: 'string' },
      headline: { type: 'string' },
      description: { type: 'string' },
      cta: { type: 'string' },
      countries: { type: 'string' },
      mode: { type: 'string' },
      dryRun: { type: 'boolean' },
      json: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: false,
  });

  if (values.help) {
    printHelp();
    return;
  }

  const manifest = await loadManifest(values.manifest);
  const request = coerceRequest({
    ...manifest,
    sourceDir: values.source || manifest.sourceDir,
    campaignName: values.campaignName || manifest.campaignName,
    adSetName: values.adSetName || manifest.adSetName,
    objective: (values.objective as CampaignObjective | undefined) || manifest.objective,
    dailyBudget: values.dailyBudget ? Number(values.dailyBudget) : manifest.dailyBudget,
    destinationUrl: values.destinationUrl || manifest.destinationUrl,
    primaryText: values.primaryText || manifest.primaryText,
    headline: values.headline || manifest.headline,
    description: values.description || manifest.description,
    cta: (values.cta as CallToAction | undefined) || manifest.cta,
    countries: parseCountries(values.countries) || manifest.countries,
    mode: (values.mode || manifest.mode || 'DRAFT').toUpperCase() as 'DRAFT' | 'LIVE',
    dryRun: values.dryRun || manifest.dryRun,
  });

  const runtimeEnv = getRuntimeEnv();
  const metaClient = createMetaApiClient({
    accessToken: runtimeEnv.accessToken,
    adAccountId: runtimeEnv.adAccountId,
    apiVersion: runtimeEnv.apiVersion,
    baseUrl: 'https://graph.facebook.com',
  });

  const service = new MetaAdsDeployService(metaClient, {
    adAccountId: runtimeEnv.adAccountId,
    pageId: runtimeEnv.pageId,
    instagramActorId: runtimeEnv.instagramActorId,
  });

  const result = await service.deploy(request);

  if (values.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Sucesso: ${result.success ? 'sim' : 'nao'}`);
  if (result.campaign) {
    console.log(`Campanha: ${result.campaign.name} -> ${result.campaign.metaCampaignId}`);
  }
  if (result.adSet) {
    console.log(`Conjunto: ${result.adSet.name} -> ${result.adSet.metaAdSetId}`);
  }
  console.log(`Anuncios processados: ${result.plan?.assetGroups.length || result.ads.length}`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
