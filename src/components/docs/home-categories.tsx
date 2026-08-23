"use client";

import {
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";

import type { RegistryControlDefinition } from "../../lib/registry/controls";
import type { RegistryDomain, RegistryItemType } from "../../lib/registry/item-types";
import { getRegistryTypeLabel } from "../../lib/registry/item-types";
import { getRegistrySectionIdForType } from "../../lib/registry/sections";
import { siteConfig } from "../../lib/site-config";
import { cn } from "../../lib/utils";
import { CopyButton } from "../ui/copy-button";
import { getDomainInstallCommand } from "./install-command";
import { ItemPreviewDialog } from "./item-preview-dialog";

export type HomeCategoryItem = {
  name: string;
  type: RegistryItemType;
  domain: RegistryDomain;
  title: string;
  description: string;
  fontFamily?: string;
  controls?: RegistryControlDefinition[];
  category?: string;
  prompt?: string;
  promptSpec?: string;
  promptKind?: string;
  assetWidth?: number;
  assetHeight?: number;
};

/**
 * `preview`  — large 4:3 tile with the live component centred and scaled to fit.
 * `compact`  — dense grid of small square tiles, for icon-scale artwork.
 * `specimen` — full-bleed tile where the preview supplies its own background,
 *              used for type specimens and media where the setting is the point.
 * `mark`     — container-less squircle: the artwork is the tile, no card chrome.
 * `art`      — soft tinted panel, no border: line illustrations with room to breathe.
 * `card`     — thumbnail panel with the title and description set beneath it, no outer card.
 * `gallery`  — masonry columns at each image's natural aspect ratio, nothing cropped.
 */
type CategoryDensity = "preview" | "compact" | "specimen" | "mark" | "art" | "card" | "gallery";

const PAGE_SIZES: Record<CategoryDensity, number> = {
  compact: 24, // 24 icons per page
  mark: 10, // 10 brand logos per page
  card: 3, // 3 template cards per page
  preview: 6, // 6 component preview cards per page
  art: 4, // 4 illustration cards per page
  specimen: 4, // 4 font/background specimens per page
  gallery: 6, // 6 photography/image tiles per page
};

function PaginationControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-900/90 px-2 py-0.5 text-xs text-neutral-300 shadow-xs dark:bg-neutral-800/90">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentPage <= 1}
        className="flex size-5 cursor-pointer items-center justify-center rounded text-neutral-400 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-25"
        aria-label="Previous page"
      >
        <IconChevronLeft className="size-3.5" />
      </button>
      <span className="min-w-[34px] text-center font-mono text-[11px] font-medium text-white/90 select-none">
        {currentPage} of {Math.max(1, totalPages)}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="flex size-5 cursor-pointer items-center justify-center rounded text-neutral-400 transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-25"
        aria-label="Next page"
      >
        <IconChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

type HomeCategory = {
  id: RegistryDomain;
  label: string;
  purpose: string;
  emptyHint: string;
  density: CategoryDensity;
  /** Splits the section into sub-headed grids by each item's `meta.category`. */
  groupByCategory?: boolean;
};

type HomeCategoriesProps = {
  items: readonly HomeCategoryItem[];
};

type CategoryFilter = "all" | RegistryDomain;

/** Live `Preview` exports, keyed by item name, so tiles show the real component. */
const previewModules = import.meta.glob<React.ComponentType<Record<string, unknown>>>(
  "../../../registry/items/**/_preview.tsx",
  { eager: true, import: "Preview" },
);

/**
 * Image items publish a real asset instead of a `_preview.tsx`. Vite resolves each to a hashed
 * URL, so the gallery and dialog can render the actual file.
 */
const imageAssetModules = import.meta.glob<string>(
  "../../../registry/items/images/**/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default", query: "?url" },
);

export const imageAssetsByItemName = new Map(
  Object.entries(imageAssetModules).flatMap(([path, url]) => {
    const itemName = path.replace(/\\/gu, "/").split("/").at(-2);

    return itemName && url ? ([[itemName, url]] as const) : [];
  }),
);

const previewsByItemName = new Map(
  Object.entries(previewModules).flatMap(([path, Preview]) => {
    const itemName = path.replace(/\\/gu, "/").split("/").at(-2);

    return itemName && Preview ? ([[itemName, Preview]] as const) : [];
  }),
);

const categories = [
  {
    id: "components",
    label: "Components",
    purpose: "Reusable UI components, patterns, and interface building blocks.",
    emptyHint: "Components will appear here as they're published.",
    density: "preview",
  },
  {
    id: "templates",
    label: "Template",
    purpose: "Full-page and section templates composed from Stark components.",
    emptyHint: "Templates will appear here as they're published.",
    density: "card",
  },
  {
    id: "icons",
    label: "Icon",
    purpose: "Stark's official icon set, drawn in a clean, minimal, bold visual language.",
    emptyHint: "Icons will appear here as they're published.",
    density: "compact",
  },
  {
    id: "logos",
    label: "Logo",
    purpose: "Original Stark logos, wordmarks, and brand symbols, grouped by the domain they suit.",
    emptyHint: "Logos and wordmarks will appear here as they're published.",
    density: "mark",
    groupByCategory: true,
  },
  {
    id: "illustrations",
    label: "Illustration",
    purpose: "Stark illustrations and brand graphics.",
    emptyHint: "Illustrations will appear here as they're published.",
    density: "art",
  },
  {
    id: "fonts",
    label: "Font",
    purpose: "Stark font families, weights, styles, and typography resources.",
    emptyHint: "Font families and typography resources will appear here as they're published.",
    density: "specimen",
  },
  {
    id: "images",
    label: "Images",
    purpose: "Photography, textures, and curated visual assets.",
    emptyHint: "Images will appear here as they're published.",
    density: "gallery",
  },
  {
    id: "backgrounds",
    label: "Background",
    purpose: "Pure-CSS background patterns and shaders — every value an editable custom property.",
    emptyHint: "Backgrounds will appear here as they're published.",
    density: "specimen",
    groupByCategory: true,
  },
  {
    id: "videos",
    label: "Video",
    purpose: "Motion and video resources.",
    emptyHint: "Video resources will appear here as they're published.",
    density: "card",
  },
] as const satisfies readonly HomeCategory[];

const filters: readonly { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  ...categories.map(({ id, label }) => ({ id, label })),
];

export function HomeCategories({ items }: HomeCategoriesProps) {
  const [activeFilter, setActiveFilter] = React.useState<CategoryFilter>("all");
  const [query, setQuery] = React.useState("");
  const [preview, setPreview] = React.useState<{
    items: HomeCategoryItem[];
    index: number;
  } | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const matchedItems = React.useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      `${item.title} ${item.description} ${item.name}`.toLowerCase().includes(normalizedQuery),
    );
  }, [items, normalizedQuery]);

  const visibleCategories = categories.filter(
    (category) => activeFilter === "all" || activeFilter === category.id,
  );
  const totalMatches = matchedItems.filter(
    (item) => activeFilter === "all" || item.domain === activeFilter,
  ).length;

  return (
    <section aria-labelledby="all-categories-heading" className="mt-20 w-full sm:mt-24">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
        <div className="flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 id="all-categories-heading" className="text-xl font-semibold tracking-tight">
              All Categories
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Explore Stark&apos;s design resources and copy what you need without leaving the
              homepage.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative">
              <IconSearch
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search resources"
                aria-label="Search resources"
                className="h-9 w-full rounded-lg border bg-transparent pr-3 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-56"
              />
            </div>
            <Link
              to="/$section"
              params={{ section: "components" }}
              className="shrink-0 text-sm font-medium whitespace-nowrap text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((filter) => {
            const isActive = filter.id === activeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "inline-flex cursor-pointer items-center rounded-full px-4 py-1.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "bg-primary font-medium text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {normalizedQuery && totalMatches === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No resources match &ldquo;{query.trim()}&rdquo;.
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {visibleCategories.map((category) => (
              <CategoryGroup
                key={category.id}
                category={category}
                items={matchedItems.filter((item) => item.domain === category.id)}
                isSearching={normalizedQuery.length > 0}
                onOpen={(groupItems, itemIndex) =>
                  setPreview({ items: [...groupItems], index: itemIndex })
                }
              />
            ))}
          </div>
        )}
      </div>

      {preview ? (
        <ItemPreviewDialog
          items={preview.items}
          index={preview.index}
          onIndexChange={(index) => setPreview((state) => (state ? { ...state, index } : state))}
          onClose={() => setPreview(null)}
          iconNames={items.filter((entry) => entry.domain === "icons").map((entry) => entry.name)}
          assetUrl={imageAssetsByItemName.get(preview.items[preview.index]?.name ?? "")}
          renderPreview={(name, previewValues) => {
            const Preview = previewsByItemName.get(name);

            return Preview ? (
              <Preview {...previewValues} />
            ) : (
              <span className="text-sm text-muted-foreground">No preview available.</span>
            );
          }}
        />
      ) : null}
    </section>
  );
}

function CategoryGroup({
  category,
  items,
  isSearching,
  onOpen,
}: {
  category: HomeCategory;
  items: readonly HomeCategoryItem[];
  isSearching: boolean;
  onOpen: (items: readonly HomeCategoryItem[], index: number) => void;
}) {
  const [page, setPage] = React.useState(1);
  const pageSize = PAGE_SIZES[category.density] ?? 6;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const displayedItems = React.useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  React.useEffect(() => {
    setPage(1);
  }, [items.length]);

  if (isSearching && items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{category.label}</h3>
          <p className="text-sm text-muted-foreground">{category.purpose}</p>
        </div>
        {!category.groupByCategory && items.length > 0 && (
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        )}
      </div>

      {items.length > 0 && category.groupByCategory ? (
        getItemCategoryGroups(items).map((group) => (
          <PaginatedCategorySubGroup
            key={group.label}
            group={group}
            density={category.density}
            onOpen={onOpen}
          />
        ))
      ) : items.length > 0 ? (
        <ItemGrid
          density={category.density}
          items={displayedItems}
          onOpen={(itemIndex) => onOpen(items, (page - 1) * pageSize + itemIndex)}
        />
      ) : (
        // Sized like one tile of this category's grid, so an empty category reads at the same
        // scale as a populated one instead of stretching to the full row.
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
          <p className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {category.emptyHint}
          </p>
        </div>
      )}
    </div>
  );
}

function PaginatedCategorySubGroup({
  group,
  density,
  onOpen,
}: {
  group: { label: string; items: HomeCategoryItem[] };
  density: CategoryDensity;
  onOpen: (items: readonly HomeCategoryItem[], index: number) => void;
}) {
  const [page, setPage] = React.useState(1);
  const pageSize = PAGE_SIZES[density] ?? 10;
  const totalPages = Math.max(1, Math.ceil(group.items.length / pageSize));
  const displayedItems = React.useMemo(
    () => group.items.slice((page - 1) * pageSize, page * pageSize),
    [group.items, page, pageSize],
  );

  React.useEffect(() => {
    setPage(1);
  }, [group.items.length]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {group.label}
        </h4>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
      <ItemGrid
        density={density}
        items={displayedItems}
        onOpen={(itemIndex) => onOpen(group.items, (page - 1) * pageSize + itemIndex)}
      />
    </div>
  );
}

/**
 * Splits a domain's items by their `meta.category`, preserving first-seen order so the grouping
 * follows the order items are authored in rather than an alphabetical shuffle.
 */
function getItemCategoryGroups(
  items: readonly HomeCategoryItem[],
): { label: string; items: HomeCategoryItem[] }[] {
  const groups = new Map<string, HomeCategoryItem[]>();

  for (const item of items) {
    const label = item.category?.trim() || "Uncategorised";
    const group = groups.get(label);

    if (group) {
      group.push(item);
    } else {
      groups.set(label, [item]);
    }
  }

  return [...groups].map(([label, groupItems]) => ({ label, items: groupItems }));
}

function ItemGrid({
  density,
  items,
  onOpen,
}: {
  density: CategoryDensity;
  items: readonly HomeCategoryItem[];
  onOpen: (index: number) => void;
}) {
  return (
    <ul
      className={cn(
        // Every grid is sized by a minimum tile width rather than a fixed column count, so the
        // number of tiles per row follows the available width — five or more on a wide screen —
        // and no tile is ever squeezed below the width its content needs.
        "grid",
        density === "compact" &&
          "grid-cols-[repeat(auto-fill,minmax(min(100%,96px),1fr))] gap-0 border-t border-l",
        density === "mark" &&
          "grid-cols-[repeat(auto-fill,minmax(min(100%,120px),1fr))] gap-x-6 gap-y-8",
        density === "art" &&
          // Two-up on a phone, then range-based — illustrations read fine at half a small
          // screen but need real width once there is room for it.
          "grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]",
        density === "gallery" &&
          "block columns-[340px] gap-4 [&>li]:mb-4 [&>li]:break-inside-avoid",
        density === "card" &&
          // 20px horizontal gap so hover elevation on one card never reads as touching its
          // neighbour.
          "grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-x-5 gap-y-10",
        density === "preview" && "grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3",
        // Type specimens and background surfaces need more room than a component tile.
        density === "specimen" && "grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-3",
      )}
    >
      {items.map((item, itemIndex) => (
        <li key={`${item.domain}/${item.name}`}>
          <ResourceTile item={item} density={density} onOpen={() => onOpen(itemIndex)} />
        </li>
      ))}
    </ul>
  );
}

function ResourceTile({
  item,
  density,
  onOpen,
}: {
  item: HomeCategoryItem;
  density: CategoryDensity;
  onOpen: () => void;
}) {
  const Preview = previewsByItemName.get(item.name);
  const assetUrl = imageAssetsByItemName.get(item.name);
  const itemHref = {
    to: "/$section/$name" as const,
    params: { section: getRegistrySectionIdForType(item.type), name: item.name },
    // Plain clicks open the in-page preview; modified clicks keep normal link behaviour.
    onClick: (event: React.MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      event.preventDefault();
      onOpen();
    },
  };

  // Masonry cell: the image keeps its own aspect ratio, so the column flow does the layout.
  if (density === "gallery") {
    return (
      <div className="group relative overflow-hidden rounded-xl bg-muted/30">
        {assetUrl ? (
          <img
            src={assetUrl}
            alt={item.description || item.title}
            loading="lazy"
            width={item.assetWidth || undefined}
            height={item.assetHeight || undefined}
            className="pointer-events-none block h-auto w-full select-none"
          />
        ) : (
          <div className="grid aspect-[4/3] place-items-center text-xs text-muted-foreground">
            No preview
          </div>
        )}

        <Link
          {...itemHref}
          className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="sr-only">{`Open ${item.title}`}</span>
        </Link>

        {/* Caption and actions stay hidden until hover so the wall reads as pure imagery. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-white">{item.title}</span>
            {item.category ? (
              <span className="truncate text-[10px] text-white/70">{item.category}</span>
            ) : null}
          </div>
          <CopyButton
            value={() => getDomainInstallCommand(item.domain, item.name, "npm")}
            copyLabel={`Copy install command for ${item.title}`}
            copiedLabel="Copied"
            resetDelay={2000}
            variant="ghost"
            size="icon-sm"
            className="pointer-events-auto rounded-full bg-background/85 backdrop-blur-sm hover:bg-background"
          />
        </div>
      </div>
    );
  }

  if (density === "card") {
    return (
      <div className="group relative isolate flex flex-col gap-3">
        {/*
         * Hover panel wrapping thumbnail and caption together. It is inset-negative and
         * behind the content (-z-10 inside `isolate`), so it tints the card without
         * adding padding that would shift the grid.
         */}
        <div className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-muted opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100" />

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-foreground/8">
          {Preview ? (
            <div className="pointer-events-none absolute inset-0 select-none [&>*]:h-full [&>*]:w-full">
              <Preview />
            </div>
          ) : (
            <div className="grid size-full place-items-center text-xs text-muted-foreground">
              No preview
            </div>
          )}

          <span className="pointer-events-none absolute right-2 bottom-2 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
            {getRegistryTypeLabel(item.type)}
          </span>

          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <CopyButton
              value={() => getDomainInstallCommand(item.domain, item.name, "npm")}
              copyLabel={`Copy install command for ${item.title}`}
              copiedLabel="Copied"
              resetDelay={2000}
              variant="ghost"
              size="icon-sm"
              className="pointer-events-auto rounded-full bg-background/85 backdrop-blur-sm hover:bg-background"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Link
            {...itemHref}
            className="text-sm font-medium outline-none hover:underline focus-visible:underline"
          >
            <span className="absolute inset-0" aria-hidden="true" />
            {item.title}
          </Link>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      </div>
    );
  }

  if (density === "art") {
    return (
      <div className="group relative">
        {/* Soft canvas, no border: the drawing carries the tile. */}
        <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-muted/50 px-8 py-6 transition-colors group-hover:bg-muted">
          {Preview ? (
            <div className="pointer-events-none w-full max-w-[180px] text-foreground select-none">
              <Preview />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{item.title}</span>
          )}
        </div>

        <Link
          {...itemHref}
          className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="sr-only">{`Open ${item.title}`}</span>
        </Link>

        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <CopyButton
            value={() => getDomainInstallCommand(item.domain, item.name, "npm")}
            copyLabel={`Copy install command for ${item.title}`}
            copiedLabel="Copied"
            resetDelay={2000}
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-background/85 backdrop-blur-sm hover:bg-background"
          />
        </div>
      </div>
    );
  }

  if (density === "mark") {
    return (
      <div className="group relative">
        {/* No card chrome: the mark itself is the tile. */}
        <div className="aspect-square overflow-hidden rounded-[22%] shadow-sm ring-1 ring-black/5 transition-transform group-hover:-translate-y-0.5 dark:ring-white/10">
          {Preview ? (
            <div className="pointer-events-none size-full select-none [&>*]:size-full">
              <Preview />
            </div>
          ) : (
            <div className="grid size-full place-items-center bg-muted text-[10px] text-muted-foreground">
              {item.title}
            </div>
          )}
        </div>

        <Link
          {...itemHref}
          className="absolute inset-0 rounded-[22%] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="sr-only">{`Open ${item.title}`}</span>
        </Link>

        <div className="absolute -top-1.5 -right-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <CopyButton
            value={() => getDomainInstallCommand(item.domain, item.name, "npm")}
            copyLabel={`Copy install command for ${item.title}`}
            copiedLabel="Copied"
            resetDelay={2000}
            variant="ghost"
            size="icon-sm"
            className="rounded-full bg-background shadow-sm ring-1 ring-black/5 hover:bg-background dark:ring-white/10"
          />
        </div>
      </div>
    );
  }

  // Seamless hairline grid: cells share borders, no per-tile card.
  if (density === "compact") {
    return (
      <div className="group relative aspect-square border-r border-b transition-colors hover:bg-muted/60">
        <div className="absolute inset-0 grid place-items-center overflow-hidden p-3">
          {Preview ? (
            <div className="pointer-events-none text-foreground/80 transition-colors select-none group-hover:text-foreground">
              <Preview />
            </div>
          ) : (
            <span className="px-1 text-center text-[10px] leading-tight text-muted-foreground">
              {item.title}
            </span>
          )}
        </div>

        <Link
          {...itemHref}
          className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset"
        >
          <span className="sr-only">{`Open ${item.title}`}</span>
        </Link>

        <span className="pointer-events-none absolute top-1 left-1.5 z-20 max-w-[calc(100%-0.75rem)] truncate text-[10px] text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          {item.title}
        </span>

        <div className="absolute right-0.5 bottom-0.5 z-20 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <CopyButton
            value={() => getDomainInstallCommand(item.domain, item.name, "npm")}
            copyLabel={`Copy install command for ${item.title}`}
            copiedLabel="Copied"
            resetDelay={2000}
            variant="ghost"
            size="icon-sm"
            className="size-6 rounded-md hover:bg-background"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="group @container relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted/30 transition-colors hover:border-foreground/20">
      <div
        className={cn(
          "absolute inset-0 overflow-hidden",
          density === "specimen" ? "[&>*]:h-full [&>*]:w-full" : "grid place-items-center",
        )}
      >
        {assetUrl ? (
          <img
            src={assetUrl}
            alt={item.title}
            loading="lazy"
            className="pointer-events-none size-full object-cover select-none"
          />
        ) : Preview ? (
          density === "specimen" ? (
            // The preview supplies its own backdrop, so let it bleed to the tile edges.
            <div className="pointer-events-none h-full w-full select-none [&>*]:h-full [&>*]:rounded-none">
              <Preview />
            </div>
          ) : (
            // Fixed design width keeps previews from reflowing; the container-relative scale then
            // stretches them across the tile at every breakpoint instead of leaving them small and
            // centred with dead margin around them.
            <div className="pointer-events-none w-[400px] shrink-0 scale-[calc(94cqw/400px)] select-none">
              <Preview />
            </div>
          )
        ) : (
          <span className="text-xs text-muted-foreground">No preview</span>
        )}
      </div>

      {/* Full-tile navigation target, kept under the action buttons. */}
      <Link
        {...itemHref}
        className="absolute inset-0 z-10 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="sr-only">{`Open ${item.title}`}</span>
      </Link>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
        <span className="max-w-[65%] truncate rounded-md bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {item.title}
        </span>
        <CopyButton
          value={() => getDomainInstallCommand(item.domain, item.name, "npm")}
          copyLabel={`Copy install command for ${item.title}`}
          copiedLabel="Copied"
          resetDelay={2000}
          variant="ghost"
          size="icon-sm"
          className="pointer-events-auto rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2 p-3">
        <code className="max-w-[70%] truncate rounded-md bg-background/80 px-2 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
          {`${siteConfig.subRegistries[item.domain].namespace}/${item.name}`}
        </code>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-transform group-hover:-translate-y-0.5"
        >
          <IconArrowUpRight className="size-4" />
        </span>
      </div>
    </div>
  );
}
