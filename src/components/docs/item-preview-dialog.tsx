"use client";

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconDownload,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconLink,
  IconX,
} from "@tabler/icons-react";
import * as React from "react";

import type { RegistryDomain } from "../../lib/registry/item-types";
import { getRegistryTypeLabel } from "../../lib/registry/item-types";
import { getRegistrySectionIdForType } from "../../lib/registry/sections";
import {
  getCanonicalDomainRegistryItemPath,
  getCanonicalDomainRegistryItemUrl,
  siteConfig,
} from "../../lib/site-config";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { CopyButton } from "../ui/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getDomainInstallCommand } from "./install-command";

export type PreviewDialogItem = {
  name: string;
  type: string;
  domain: RegistryDomain;
  title: string;
  description: string;
  fontFamily?: string;
};

type ItemPreviewDialogProps = {
  items: readonly PreviewDialogItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  renderPreview: (name: string) => React.ReactNode;
};

type CanvasTheme = "light" | "dark";
type CanvasSurface = "surface" | "canvas" | "grid";
type Viewport = "desktop" | "tablet" | "mobile";

// Token-based so they follow the canvas theme scope rather than the page's theme.
const surfaces: Record<CanvasSurface, string> = {
  surface: "bg-muted/50",
  canvas: "bg-background",
  grid: "bg-muted/50 [background-image:radial-gradient(color-mix(in_oklab,var(--color-foreground)_14%,transparent)_1px,transparent_1px)] [background-size:16px_16px] [background-position:center]",
};

const viewportWidths: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function ItemPreviewDialog({
  items,
  index,
  onIndexChange,
  onClose,
  renderPreview,
}: ItemPreviewDialogProps) {
  const item = items[index];

  const [panelOpen, setPanelOpen] = React.useState(true);
  const [theme, setTheme] = React.useState<CanvasTheme>("light");
  const [surface, setSurface] = React.useState<CanvasSurface>("surface");
  const [zoom, setZoom] = React.useState(100);
  const [viewport, setViewport] = React.useState<Viewport>("desktop");

  // Icon-specific, applied as real CSS on the rendered svg.
  const [iconSize, setIconSize] = React.useState(24);
  const [iconStroke, setIconStroke] = React.useState(1.75);
  const [iconColor, setIconColor] = React.useState("");

  // Font-specific, driving a live specimen.
  const [fontWeight, setFontWeight] = React.useState(400);
  const [fontSize, setFontSize] = React.useState(64);
  const [sampleText, setSampleText] = React.useState("Lavish");

  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [linkCopied, setLinkCopied] = React.useState(false);

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && index < items.length - 1) onIndexChange(index + 1);
      if (event.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndexChange]);

  if (!item) {
    return null;
  }

  const isIcon = item.domain === "icons";
  const isFont = item.domain === "fonts" && Boolean(item.fontFamily);
  const isTemplate = item.domain === "templates";
  const itemPath = `/${getRegistrySectionIdForType(item.type as never)}/${item.name}`;
  const namespaced = `${siteConfig.subRegistries[item.domain].namespace}/${item.name}`;

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}${itemPath}`);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2000);
  }

  async function exportSource() {
    setExporting(true);
    setExportError(null);

    try {
      const response = await fetch(getCanonicalDomainRegistryItemPath(item.domain, item.name));

      if (!response.ok) {
        throw new Error(`Registry responded ${response.status}`);
      }

      const payload: { files?: { path: string; content: string }[] } = await response.json();
      const files = payload.files ?? [];

      if (files.length === 0) {
        throw new Error("This item publishes no source files.");
      }

      for (const file of files) {
        const url = URL.createObjectURL(new Blob([file.content], { type: "text/plain" }));
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = file.path.split("/").at(-1) ?? file.path;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${item.title} preview`}
        className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col p-4 sm:p-8"
      >
        <div className="flex justify-end pb-3">
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close preview">
            <IconX />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl bg-background ring-1 ring-foreground/10">
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b px-4 py-2.5">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="truncate text-sm font-medium">{item.title}</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {getRegistryTypeLabel(item.type as never)}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <CopyButton
                  value={() => getDomainInstallCommand(item.domain, item.name, "npm")}
                  copyLabel="Copy install command"
                  copiedLabel="Copied"
                  resetDelay={2000}
                  variant="ghost"
                  size="sm"
                  showLabel
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void exportSource()}
                  disabled={exporting}
                >
                  <IconDownload data-icon="inline-start" />
                  {exporting ? "Exporting…" : "Export"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void copyLink()}>
                  {linkCopied ? (
                    <IconCheck data-icon="inline-start" />
                  ) : (
                    <IconLink data-icon="inline-start" />
                  )}
                  {linkCopied ? "Copied" : "Copy link"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" aria-label="More options" />}
                  >
                    <IconDotsVertical />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() => {
                          window.location.href = itemPath;
                        }}
                      >
                        Open full page
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() => {
                          void navigator.clipboard.writeText(namespaced);
                        }}
                      >
                        Copy namespaced id
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            getCanonicalDomainRegistryItemUrl(item.domain, item.name),
                          );
                        }}
                      >
                        Copy registry JSON URL
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() => {
                          window.open(siteConfig.repositoryUrl, "_blank", "noopener,noreferrer");
                        }}
                      >
                        View repository
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={panelOpen ? "Hide properties" : "Show properties"}
                  aria-expanded={panelOpen}
                  onClick={() => setPanelOpen((open) => !open)}
                >
                  {panelOpen ? (
                    <IconLayoutSidebarRightCollapse />
                  ) : (
                    <IconLayoutSidebarRightExpand />
                  )}
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div
              data-theme={theme}
              className={cn(
                "relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-8 text-foreground",
                theme === "dark" ? "stark-canvas-dark" : "stark-canvas-light",
                surfaces[surface],
              )}
            >
              <div
                className="flex items-center justify-center transition-[width]"
                style={{
                  width: isTemplate ? viewportWidths[viewport] : undefined,
                  maxWidth: "100%",
                }}
              >
                <div
                  className={cn(
                    "origin-center text-foreground",
                    isIcon && "[&_svg]:h-[var(--icon-size)] [&_svg]:w-[var(--icon-size)]",
                    isIcon && "[&_svg]:[stroke-width:var(--icon-stroke)]",
                  )}
                  style={{
                    transform: `scale(${zoom / 100})`,
                    ...(isIcon
                      ? ({
                          "--icon-size": `${iconSize}px`,
                          "--icon-stroke": iconStroke,
                          ...(iconColor ? { color: iconColor } : {}),
                        } as React.CSSProperties)
                      : {}),
                  }}
                >
                  {isFont ? (
                    <span
                      style={{
                        fontFamily: item.fontFamily,
                        fontWeight,
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.1,
                      }}
                    >
                      {sampleText || "Type something"}
                    </span>
                  ) : (
                    renderPreview(item.name)
                  )}
                </div>
              </div>
            </div>

            {/* Pager */}
            <div className="flex items-center justify-center gap-4 border-t px-4 py-2.5">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous item"
                disabled={index === 0}
                onClick={() => onIndexChange(index - 1)}
              >
                <IconChevronLeft />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {index + 1} of {items.length}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next item"
                disabled={index === items.length - 1}
                onClick={() => onIndexChange(index + 1)}
              >
                <IconChevronRight />
              </Button>
            </div>
          </div>

          {/* Properties panel */}
          {panelOpen ? (
            <aside
              aria-label="Properties"
              className="hidden w-72 shrink-0 flex-col gap-5 overflow-y-auto border-l p-4 md:flex"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-medium">Properties</h2>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>

              <Field label="Theme">
                <Segmented
                  value={theme}
                  onChange={setTheme}
                  options={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                />
              </Field>

              <Field label="Surface">
                <Segmented
                  value={surface}
                  onChange={setSurface}
                  options={[
                    { value: "surface", label: "Surface" },
                    { value: "canvas", label: "Canvas" },
                    { value: "grid", label: "Grid" },
                  ]}
                />
              </Field>

              <Field label={`Zoom — ${zoom}%`}>
                <input
                  type="range"
                  min={50}
                  max={200}
                  step={10}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full accent-foreground"
                  aria-label="Zoom"
                />
              </Field>

              {isTemplate ? (
                <Field label="Viewport">
                  <Segmented
                    value={viewport}
                    onChange={setViewport}
                    options={[
                      { value: "desktop", label: "Desktop" },
                      { value: "tablet", label: "Tablet" },
                      { value: "mobile", label: "Mobile" },
                    ]}
                  />
                </Field>
              ) : null}

              {isIcon ? (
                <>
                  <Field label={`Size — ${iconSize}px`}>
                    <input
                      type="range"
                      min={16}
                      max={96}
                      step={2}
                      value={iconSize}
                      onChange={(event) => setIconSize(Number(event.target.value))}
                      className="w-full accent-foreground"
                      aria-label="Icon size"
                    />
                  </Field>
                  <Field label={`Stroke — ${iconStroke}`}>
                    <input
                      type="range"
                      min={0.5}
                      max={3}
                      step={0.25}
                      value={iconStroke}
                      onChange={(event) => setIconStroke(Number(event.target.value))}
                      className="w-full accent-foreground"
                      aria-label="Icon stroke width"
                    />
                  </Field>
                  <Field label="Color">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={iconColor || "#000000"}
                        onChange={(event) => setIconColor(event.target.value)}
                        className="size-8 cursor-pointer rounded border bg-transparent"
                        aria-label="Icon color"
                      />
                      <Button variant="outline" size="sm" onClick={() => setIconColor("")}>
                        Inherit
                      </Button>
                    </div>
                  </Field>
                </>
              ) : null}

              {isFont ? (
                <>
                  <Field label="Sample text">
                    <input
                      type="text"
                      value={sampleText}
                      onChange={(event) => setSampleText(event.target.value)}
                      className="h-9 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      aria-label="Sample text"
                    />
                  </Field>
                  <Field label={`Weight — ${fontWeight}`}>
                    <Segmented
                      value={String(fontWeight)}
                      onChange={(value) => setFontWeight(Number(value))}
                      options={[
                        { value: "400", label: "400" },
                        { value: "500", label: "500" },
                        { value: "700", label: "700" },
                      ]}
                    />
                  </Field>
                  <Field label={`Size — ${fontSize}px`}>
                    <input
                      type="range"
                      min={16}
                      max={140}
                      step={4}
                      value={fontSize}
                      onChange={(event) => setFontSize(Number(event.target.value))}
                      className="w-full accent-foreground"
                      aria-label="Font size"
                    />
                  </Field>
                </>
              ) : null}

              <div className="mt-auto flex flex-col gap-2 border-t pt-4">
                <code className="truncate rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
                  {namespaced}
                </code>
                {exportError ? (
                  <p className="text-xs text-destructive">{exportError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Export downloads this item&apos;s published source files.
                  </p>
                )}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div className="flex rounded-lg bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 cursor-pointer rounded-md px-2 py-1 text-xs transition-colors",
            value === option.value
              ? "bg-background font-medium text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
