"use client";

import { IconExternalLink, IconSearch } from "@tabler/icons-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";

import { cn } from "../../lib/utils";

/**
 * One catalog entry. `sourceKind` is the load-bearing field: it decides which command the copy
 * button hands over, and whether that command resolves through our namespace or the project's own.
 */
export type ExternalEntry = {
  name: string;
  title: string;
  description: string;
  sourceKind: string;
  project: string;
  author: string;
  license: string;
  sourceUrl: string;
  homepage: string;
  tags: string;
  command: string;
  note: string;
};

type Props = {
  entries: readonly ExternalEntry[];
};

const kindLabels: Record<string, { label: string; hint: string }> = {
  mirrored: {
    label: "Mirrored",
    hint: "Source is hosted here, installs through @stark-external",
  },
  registry: {
    label: "Registry",
    hint: "Installs straight from the project's own shadcn registry",
  },
  package: { label: "Package", hint: "Installs from npm" },
  link: { label: "Browse", hint: "Copy components from the project's site" },
};

const filters = [
  { id: "all", label: "All" },
  { id: "mirrored", label: "Mirrored" },
  { id: "registry", label: "Registry" },
  { id: "package", label: "Package" },
  { id: "link", label: "Browse" },
] as const;

export function StarkExternalPage({ entries }: Props) {
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState<string>("all");

  const normalizedQuery = query.trim().toLowerCase();

  const visible = React.useMemo(
    () =>
      entries.filter((entry) => {
        const matchesKind = kind === "all" || entry.sourceKind === kind;
        const matchesQuery =
          !normalizedQuery ||
          `${entry.title} ${entry.description} ${entry.project} ${entry.tags} ${entry.author}`
            .toLowerCase()
            .includes(normalizedQuery);

        return matchesKind && matchesQuery;
      }),
    [entries, kind, normalizedQuery],
  );

  const mirroredCount = entries.filter((entry) => entry.sourceKind === "mirrored").length;

  // Counts follow the search query but not the active kind filter — a chip shows how many of that
  // kind match what's typed, so switching between chips stays meaningful while searching.
  const countsByKind = React.useMemo(() => {
    const searched = normalizedQuery
      ? entries.filter((entry) =>
          `${entry.title} ${entry.description} ${entry.project} ${entry.tags} ${entry.author}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : entries;

    return {
      all: searched.length,
      mirrored: searched.filter((entry) => entry.sourceKind === "mirrored").length,
      registry: searched.filter((entry) => entry.sourceKind === "registry").length,
      package: searched.filter((entry) => entry.sourceKind === "package").length,
      link: searched.filter((entry) => entry.sourceKind === "link").length,
    };
  }, [entries, normalizedQuery]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Stark External
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              @stark-external
            </Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {entries.length} external libraries and components built on shadcn/ui, in one index.
            Find what you need here and copy the command that installs it — {mirroredCount} are
            mirrored into this registry, the rest install straight from their own source.
          </p>
        </div>

        <div className="relative w-full shrink-0 sm:w-72">
          <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search external libraries"
            aria-label="Search external libraries"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-8"
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={kind === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setKind(filter.id)}
            className="rounded-full text-xs font-medium"
          >
            {filter.label}
            <span
              className={cn(
                "ml-1.5 tabular-nums before:content-['('] after:content-[')']",
                kind === filter.id ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {countsByKind[filter.id]}
            </span>
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nothing matches that search.
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-5">
          {visible.map((entry) => (
            <li key={entry.name}>
              <ExternalCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExternalCard({ entry }: { entry: ExternalEntry }) {
  const kind = kindLabels[entry.sourceKind] ?? kindLabels.link;
  const isMirrored = entry.sourceKind === "mirrored";
  const command = isMirrored
    ? `npx shadcn@latest add @stark-external/${entry.name}`
    : entry.command;

  return (
    <article className="group flex h-full flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="truncate text-sm font-semibold">{entry.title}</h2>
          <span className="truncate text-xs text-muted-foreground">
            {entry.author} · {entry.license}
          </span>
        </div>
        <Badge
          variant={isMirrored ? "default" : "secondary"}
          className="shrink-0 text-[10px]"
          title={kind.hint}
        >
          {kind.label}
        </Badge>
      </div>

      <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
        {entry.description}
      </p>

      {entry.tags ? (
        <div className="flex flex-wrap gap-1">
          {entry.tags.split(",").map((tag) => (
            <span
              key={tag.trim()}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      ) : null}

      {/* Why an entry is not mirrored is part of the record, not a footnote to hide. */}
      {entry.note && !isMirrored ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">{entry.note}</p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 pt-1">
        {command ? (
          <>
            <code className="block truncate rounded-md bg-muted px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
              {command}
            </code>
            <div className="flex items-center gap-2">
              <CopyButton
                value={command}
                copyLabel={`Copy install command for ${entry.title}`}
                copiedLabel="Copied"
                resetDelay={2000}
                variant="outline"
                size="sm"
                showLabel
                className="flex-1"
              />
              <SourceLink entry={entry} />
            </div>
          </>
        ) : (
          <SourceLink entry={entry} full />
        )}
      </div>
    </article>
  );
}

function SourceLink({ entry, full = false }: { entry: ExternalEntry; full?: boolean }) {
  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      className={cn(full && "w-full")}
      render={<a href={entry.homepage} target="_blank" rel="noopener noreferrer" />}
    >
      <IconExternalLink data-icon />
      {full ? "Open project" : <span className="sr-only">Open {entry.title}</span>}
    </Button>
  );
}
