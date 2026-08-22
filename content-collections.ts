import { defineCollection, defineConfig, defineParser } from "@content-collections/core";
import { z } from "zod/v4";

import { parseDocsPageMetadataSource, parseDocsPageSource } from "./src/lib/docs/catalog-core.ts";
import { getDefaultRegistryTitle } from "./src/lib/registry/item-title.ts";
import {
  parseRegistryMdxDocument,
  parseRegistryMdxMetadataDocument,
  type ParsedRegistryMdx,
} from "./src/lib/registry/mdx.ts";
import { getRegistryDomainFromPath } from "./src/lib/registry/paths.ts";

type SourceDocument = {
  _meta: {
    filePath: string;
  };
};

const sourceParser = defineParser((source) => ({ source }));
const sourceSchema = z.object({
  source: z.string(),
});
const registryMdxSchema = z
  .object({
    content: z.string(),
  })
  .catchall(z.unknown());

const authoredDocs = defineCollection({
  name: "authoredDocs",
  directory: "registry/docs",
  include: "**/*.{md,mdx}",
  parser: sourceParser,
  schema: sourceSchema,
  transform: (document, context) => {
    const page = parseDocsPageSource(getSourcePath("registry/docs", document), document.source);

    return page ?? context.skip("Draft docs page.");
  },
});

const docsNavigationItems = defineCollection({
  name: "docsNavigationItems",
  directory: "registry/docs",
  include: "**/*.{md,mdx}",
  parser: sourceParser,
  schema: sourceSchema,
  transform: (document, context) => {
    const page = parseDocsPageMetadataSource(
      getSourcePath("registry/docs", document),
      document.source,
    );

    return page ?? context.skip("Draft docs page.");
  },
});

const registryMdxItems = defineCollection({
  name: "registryMdxItems",
  directory: "registry/items",
  include: "**/_registry.mdx",
  schema: registryMdxSchema,
  transform: (document): ParsedRegistryMdx & { path: string } => {
    const path = getSourcePath("registry/items", document);
    const { content, _meta: _ignoredMeta, ...metadata } = document;

    return {
      path,
      ...parseRegistryMdxDocument(path, metadata, content),
    };
  },
});

const registryNavigationItems = defineCollection({
  name: "registryNavigationItems",
  directory: "registry/items",
  include: "**/_registry.mdx",
  schema: registryMdxSchema,
  transform: (document) => {
    const path = getSourcePath("registry/items", document);
    const { content: _content, _meta: _ignoredMeta, ...metadata } = document;
    const item = parseRegistryMdxMetadataDocument(path, metadata);

    return {
      name: item.name,
      type: item.type,
      domain: getRegistryDomainFromPath(path),
      title: item.title ?? getDefaultRegistryTitle(item.name),
      description: item.description ?? "",
      // Lets the preview dialog render a live specimen for font items.
      fontFamily: item.font?.family ?? "",
      // Schema for the preview properties panel.
      controls: item.controls ?? [],
      // Image items carry their prompt and category in `meta`. Flattened to primitives because
      // this collection's type has to stay serializable.
      category: readMetaString(item.meta, "category"),
      prompt: readMetaString(item.meta, "prompt"),
      promptKind: readMetaString(item.meta, "promptKind"),
      // Intrinsic size lets the masonry reserve the right box before a lazy image loads.
      assetWidth: readMetaNumber(item.meta, "width"),
      assetHeight: readMetaNumber(item.meta, "height"),
    };
  },
});

const registryPreviews = defineCollection({
  name: "registryPreviews",
  directory: "registry/items",
  include: "**/_preview.tsx",
  parser: sourceParser,
  schema: sourceSchema,
  transform: (document) => ({
    path: getSourcePath("registry/items", document),
    source: document.source,
  }),
});

export default defineConfig({
  content: [
    authoredDocs,
    docsNavigationItems,
    registryMdxItems,
    registryNavigationItems,
    registryPreviews,
  ],
});

function getSourcePath(root: string, document: SourceDocument): string {
  return `${root}/${document._meta.filePath}`.replace(/\\/gu, "/");
}

/** Reads one string field out of an item's freeform `meta` map. */
function readMetaString(meta: unknown, field: string): string {
  if (typeof meta !== "object" || meta === null || Array.isArray(meta)) {
    return "";
  }

  const value = (meta as Record<string, unknown>)[field];

  return typeof value === "string" ? value : "";
}

/** Reads one numeric field out of an item's freeform `meta` map. */
function readMetaNumber(meta: unknown, field: string): number {
  if (typeof meta !== "object" || meta === null || Array.isArray(meta)) {
    return 0;
  }

  const value = (meta as Record<string, unknown>)[field];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
