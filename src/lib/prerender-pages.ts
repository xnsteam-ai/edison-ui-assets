import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import { getDocsRoutePathFromSourcePath } from "./docs/catalog-core.ts";
import { registryCatalog, registryDomains, type RegistryItemType } from "./registry/item-types.ts";
import { parseRegistryMdx } from "./registry/mdx.ts";
import { getRegistryDomainFromPath } from "./registry/paths.ts";
import { getRegistryItemRoutePath, getRegistrySectionsWithItems } from "./registry/sections.ts";
import { shouldExcludeFromSitemap } from "./seo.ts";
import {
  getAliasRegistryIndexPaths,
  getAliasRegistryItemPaths,
  getCanonicalDomainRegistryIndexPath,
  getCanonicalDomainRegistryItemPath,
  getCanonicalRegistryIndexPath,
  getCanonicalRegistryItemPath,
  getDocsMarkdownPath,
} from "./site-config.ts";

type PrerenderPage = {
  path: string;
  sitemap?: {
    exclude?: boolean;
  };
};

type RegistryPrerenderItem = {
  name: string;
  type: RegistryItemType;
  domain: (typeof registryDomains)[number];
};

type PrerenderPagesInput = {
  docsPagePaths: readonly string[];
  registryItems: readonly RegistryPrerenderItem[];
};

const docsRoot = fileURLToPath(new URL("../../registry/docs", import.meta.url));
const registryItemsRoot = fileURLToPath(new URL("../../registry/items", import.meta.url));

export function getPrerenderPages(): PrerenderPage[] {
  return createPrerenderPages({
    docsPagePaths: getDocsPagePaths(),
    registryItems: getRegistryPrerenderItems(),
  });
}

export function createPrerenderPages({
  docsPagePaths,
  registryItems,
}: PrerenderPagesInput): PrerenderPage[] {
  const paths = new Set<string>();
  const addPath = (path: string) => {
    paths.add(normalizePagePath(path));
  };

  addPath("/");
  addPath(getCanonicalRegistryIndexPath());
  getAliasRegistryIndexPaths().forEach(addPath);
  addPath("/llms.txt");
  addPath("/llms-full.txt");
  addPath("/robots.txt");

  addPath(registryCatalog.basePath);
  addPath(getDocsMarkdownPath(registryCatalog.basePath));

  // Stark External's catalog page. It lives outside the docs/registry route trees, so nothing else
  // in this function would pick it up.
  addPath("/external");

  for (const section of getRegistrySectionsWithItems(registryItems)) {
    addPath(section.basePath);
    addPath(getDocsMarkdownPath(section.basePath));
  }

  for (const docsPath of docsPagePaths) {
    addPath(docsPath);
    addPath(getDocsMarkdownPath(docsPath));
  }

  for (const domain of registryDomains) {
    addPath(getCanonicalDomainRegistryIndexPath(domain));
  }

  for (const item of registryItems) {
    addPath(getCanonicalRegistryItemPath(item.name));
    addPath(getCanonicalDomainRegistryItemPath(item.domain, item.name));
    getAliasRegistryItemPaths(item.name).forEach(addPath);

    const itemPath = getRegistryItemRoutePath(item);

    addPath(itemPath);
    addPath(getDocsMarkdownPath(itemPath));
  }

  return Array.from(paths, toPrerenderPage);
}

function toPrerenderPage(path: string): PrerenderPage {
  if (!shouldExcludeFromSitemap(path)) {
    return { path };
  }

  return {
    path,
    sitemap: {
      exclude: true,
    },
  };
}

function getDocsPagePaths(): string[] {
  return findFiles(docsRoot, (path) => /\.(?:md|mdx)$/u.test(path)).flatMap((path) => {
    const routePath = getDocsRoutePathFromSourcePath(toPosixPath(relative(process.cwd(), path)));

    return routePath === null ? [] : [routePath];
  });
}

function getRegistryPrerenderItems(): RegistryPrerenderItem[] {
  return findFiles(registryItemsRoot, (path) => path.endsWith("/_registry.mdx")).map((path) =>
    getRegistryPrerenderItem(path),
  );
}

function getRegistryPrerenderItem(path: string): RegistryPrerenderItem {
  const source = readFileSync(path, "utf8");
  const item = parseRegistryMdx(toPosixPath(relative(process.cwd(), path)), source).registryItem;

  return {
    name: item.name,
    type: item.type,
    domain: getRegistryDomainFromPath(toPosixPath(relative(process.cwd(), path))),
  };
}

function findFiles(root: string, predicate: (path: string) => boolean): string[] {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => toPosixPath(`${entry.parentPath}/${entry.name}`))
    .filter(predicate)
    .toSorted();
}

function normalizePagePath(path: string): string {
  const trimmedPath = path.replace(/^\/+|\/+$/gu, "");

  return trimmedPath ? `/${trimmedPath}` : "/";
}

function toPosixPath(path: string): string {
  return path.replace(/\\/gu, "/");
}
