import { createFileRoute } from "@tanstack/react-router";

import { StarkExternalPage, type ExternalEntry } from "@/components/docs/stark-external-page";

import { registryNavigationItems } from "../lib/registry/catalog-navigation";
import { getSeoHead } from "../lib/seo";
import { siteConfig } from "../lib/site-config";

export const Route = createFileRoute("/external")({
  head: () =>
    getSeoHead({
      title: "Stark External",
      description: siteConfig.subRegistries.external.description,
      path: "/external",
    }),
  component: StarkExternalRoute,
});

function StarkExternalRoute() {
  const entries: ExternalEntry[] = registryNavigationItems
    .filter((item) => item.domain === "external")
    .map((item) => ({
      name: item.name,
      title: item.title,
      description: item.description,
      // Mirrored items are the ones we host; they carry no `sourceKind` from a link spec.
      sourceKind: item.sourceKind || "mirrored",
      project: item.project,
      author: item.author,
      license: item.license,
      sourceUrl: item.sourceUrl,
      homepage: item.externalHomepage || item.sourceUrl,
      tags: item.tags,
      command: item.command,
      note: item.note,
    }))
    .toSorted((a, b) => {
      // Mirrored first — those are the ones installable through our own namespace.
      const rank = (kind: string) =>
        ["mirrored", "registry", "package", "link"].indexOf(kind) + 1 || 99;

      return rank(a.sourceKind) - rank(b.sourceKind) || a.title.localeCompare(b.title);
    });

  return <StarkExternalPage entries={entries} />;
}
