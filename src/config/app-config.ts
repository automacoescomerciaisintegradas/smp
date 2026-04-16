import type { Metadata } from 'next';

export const appConfig = {
  productName: 'Social Flow',
  shortProductName: 'SocialFlow',
  metadataTitle: 'Social Flow | Automações Comerciais Integradas',
  companyName: 'Automações Comerciais Integradas',
  companyShortName: 'ACI',
  tagline: 'Bem-vindo(a) ao Futuro da Criação de Conteúdo!',
  adminTagline: 'Operação de Conteúdo e Automação',
  description:
    'Bem-vindo(a) ao Futuro da Criação de Conteúdo! 🤖✨ - A IA que realmente faz as coisas.',
  supportEmail: 'contato@automacoescomerciais.com.br',
  supportWhatsappUrl: 'https://wa.me/558894227586',
  websiteUrl: 'https://automacoescomerciais.com.br',
  socialHandle: '@aci_oficial',
  themeColor: '#E54D42',
} as const;

export function getPageTitle(title?: string) {
  return title ? `${title} | ${appConfig.productName}` : appConfig.metadataTitle;
}

export function createPageMetadata({
  title,
  description,
}: {
  title?: string;
  description?: string;
} = {}): Metadata {
  return {
    title: getPageTitle(title),
    description: description || appConfig.description,
    applicationName: appConfig.productName,
  };
}
