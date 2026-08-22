import { registryConfig, subRegistries } from "../../registry/config.ts";
import type { RegistryDomain } from "./registry/item-types.ts";

const registryPathConfig = {
  indexPath: "/registry.json",
  indexAliasPaths: ["/r/registry.json"],
  itemPathPattern: "/r/{name}.json",
  itemAliasPathPatterns: [],
} as const;

export const siteConfig = {
  ...registryConfig,
  registry: registryPathConfig,
  subRegistries,
} as const;

export function getCanonicalDomainRegistryIndexUrl(domain: RegistryDomain): string {
  return `${getSiteOrigin()}${getCanonicalDomainRegistryIndexPath(domain)}`;
}

export function getCanonicalDomainRegistryItemUrl(
  domain: RegistryDomain,
  itemName: string,
): string {
  return `${getSiteOrigin()}${getCanonicalDomainRegistryItemPath(domain, itemName)}`;
}

export function getCanonicalDomainRegistryIndexPath(domain: RegistryDomain): string {
  return normalizeSitePath(`/r/${domain}/registry.json`);
}

/**
 * Customised item JSON. The config lives in a path segment rather than a query string for two
 * reasons: `/r/{domain}/{name}.json` is prerendered to a static file and Vercel's filesystem
 * handler matches on pathname only, so a query variant would never reach the server; and a `?`/`&`
 * in an install URL breaks the unquoted shell command.
 */
export function getCustomizedRegistryItemPath(
  domain: RegistryDomain,
  itemName: string,
  config: string,
): string {
  return normalizeSitePath(
    `/rc/${domain}/${encodeURIComponent(itemName)}/${encodeURIComponent(config)}.json`,
  );
}

export function getCustomizedRegistryItemUrl(
  domain: RegistryDomain,
  itemName: string,
  config: string,
): string {
  return `${getSiteOrigin()}${getCustomizedRegistryItemPath(domain, itemName, config)}`;
}

export function getCanonicalDomainRegistryItemPath(
  domain: RegistryDomain,
  itemName: string,
): string {
  return normalizeSitePath(`/r/${domain}/${encodeURIComponent(itemName)}.json`);
}

export function getCanonicalRegistryIndexUrl(): string {
  return `${getSiteOrigin()}${getCanonicalRegistryIndexPath()}`;
}

export function getCanonicalRegistryItemUrl(itemName: string): string {
  return `${getSiteOrigin()}${getCanonicalRegistryItemPath(itemName)}`;
}

export function getCanonicalDocsUrl(path: string): string {
  return getCanonicalSiteUrl(path);
}

export function getCanonicalSiteUrl(path: string): string {
  return `${getSiteOrigin()}${normalizeSitePath(path)}`;
}

export function getDocsMarkdownPath(path: string): string {
  return `${normalizeSitePath(path)}.md`;
}

export function getCanonicalRegistryIndexPath(): string {
  return normalizeSitePath(siteConfig.registry.indexPath);
}

export function getCanonicalRegistryItemPath(itemName: string): string {
  return formatRegistryItemPath(siteConfig.registry.itemPathPattern, itemName);
}

export function getAliasRegistryIndexPaths(): string[] {
  return siteConfig.registry.indexAliasPaths.map(normalizeSitePath);
}

export function getAliasRegistryItemPaths(itemName: string): string[] {
  return siteConfig.registry.itemAliasPathPatterns.map((pattern) =>
    formatRegistryItemPath(pattern, itemName),
  );
}

function getSiteOrigin(): string {
  return siteConfig.homepage.replace(/\/+$/u, "");
}

function normalizeSitePath(path: string): string {
  const trimmedPath = path.replace(/^\/+|\/+$/gu, "");

  return trimmedPath ? `/${trimmedPath}` : "/";
}

function formatRegistryItemPath(pattern: string, itemName: string): string {
  return normalizeSitePath(pattern.replaceAll("{name}", encodeURIComponent(itemName)));
}
