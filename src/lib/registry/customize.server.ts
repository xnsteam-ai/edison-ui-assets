/**
 * Builds a customised registry item JSON from an encoded preview config.
 *
 * Two mechanisms, deliberately kept separate:
 *  - **Prop values** are baked into the source by rewriting the single `defaults` object literal
 *    each schema-driven component declares. One anchor, one deterministic replacement — no
 *    regex surgery spread across the file.
 *  - **Design tokens** (any control that declares a `cssVar`) are emitted as real shadcn
 *    `cssVars`, which the CLI already knows how to install.
 *
 * CSS-only items (the Backgrounds registry) have no `defaults` literal. They instead declare every
 * value as a custom property inside a `stark:defaults` block, which `applyCssDefaults` rewrites the
 * same way — one anchor, one deterministic replacement.
 */

import { getRegistryItem } from "./catalog";
import type {
  RegistryControlDefinition,
  RegistryControlValue,
  RegistryControlValues,
} from "./controls";
import { decodeItemConfig } from "./item-config";
import type { RegistryDomain } from "./item-types";
import { getDomainRegistryItemJson } from "./json.server";

const registryJsonResponseHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export function getCustomizedRegistryItemJsonResponse(
  domain: RegistryDomain,
  name: string,
  encodedConfig: string,
): Response {
  const base = getDomainRegistryItemJson(domain, name);

  if (!base) {
    return Response.json(
      { error: "Registry item not found." },
      { headers: registryJsonResponseHeaders, status: 404 },
    );
  }

  const controls = getRegistryItem(name)?.controls ?? [];

  if (controls.length === 0) {
    return Response.json(base, { headers: registryJsonResponseHeaders });
  }

  const values = decodeItemConfig(controls, encodedConfig);
  const cssVars = buildCssVars(controls, values);

  const customized = {
    ...base,
    ...(base.files
      ? {
          files: base.files.map((file) => ({
            ...file,
            content: file.path.endsWith(".css")
              ? applyCssDefaults(file.content, controls, values)
              : applyDefaults(file.content, values),
          })),
        }
      : {}),
    ...(Object.keys(cssVars).length > 0 ? { cssVars: mergeCssVars(base.cssVars, cssVars) } : {}),
  };

  return Response.json(customized, { headers: registryJsonResponseHeaders });
}

/**
 * Replaces the body of the component's `const defaults = { … };` literal.
 *
 * Only keys already present in the literal are written, so a config cannot inject arbitrary
 * properties into published source. Returns the content untouched when there is no anchor.
 */
export function applyDefaults(content: string, values: RegistryControlValues): string {
  const anchor = "const defaults = {";
  const start = content.indexOf(anchor);

  if (start === -1) {
    return content;
  }

  const bodyStart = start + anchor.length;
  const bodyEnd = findMatchingBrace(content, start + anchor.length - 1);

  if (bodyEnd === -1) {
    return content;
  }

  const body = content.slice(bodyStart, bodyEnd);
  const updated = body.replaceAll(
    /^(\s*)([A-Za-z_$][\w$]*)(\s*:\s*)(.*?)(,?)$/gmu,
    (line, indent: string, key: string, separator: string, _current: string, comma: string) => {
      if (!Object.hasOwn(values, key)) {
        return line;
      }

      return `${indent}${key}${separator}${JSON.stringify(values[key])}${comma}`;
    },
  );

  return content.slice(0, bodyStart) + updated + content.slice(bodyEnd);
}

/**
 * Rewrites the custom-property declarations inside a stylesheet's `stark:defaults` block.
 *
 * Only properties named by a control's `cssProp` are written, and only inside the marked block, so
 * a config can neither invent new declarations nor reach the effect rules below the block. Returns
 * the content untouched when the markers are absent.
 */
export function applyCssDefaults(
  content: string,
  controls: readonly RegistryControlDefinition[],
  values: RegistryControlValues,
): string {
  const openMarker = "/* stark:defaults */";
  const closeMarker = "/* stark:end */";
  const start = content.indexOf(openMarker);
  const end = content.indexOf(closeMarker, start + openMarker.length);

  if (start === -1 || end === -1) {
    return content;
  }

  const controlsByProp = new Map(
    controls.flatMap((control) =>
      control.cssProp ? ([[normalizeCssProp(control.cssProp), control]] as const) : [],
    ),
  );

  const bodyStart = start + openMarker.length;
  const body = content.slice(bodyStart, end);
  const updated = body.replaceAll(
    /^(\s*)(--[\w-]+)(\s*:\s*)([^;]*)(;)/gmu,
    (line, indent: string, property: string, separator: string, _current: string, semi: string) => {
      const control = controlsByProp.get(normalizeCssProp(property));

      if (!control || !Object.hasOwn(values, control.id)) {
        return line;
      }

      const formatted = formatControlValue(control, values[control.id]);

      return formatted === null ? line : `${indent}${property}${separator}${formatted}${semi}`;
    },
  );

  return content.slice(0, bodyStart) + updated + content.slice(end);
}

function normalizeCssProp(property: string): string {
  return property.trim().replace(/^--/u, "");
}

/** Shared by the CSS baker and the theme-token emitter so both format a value identically. */
function formatControlValue(
  control: RegistryControlDefinition,
  value: RegistryControlValue | undefined,
): string | null {
  if (typeof value === "string") {
    return value === "" ? null : value;
  }

  if (typeof value === "number") {
    return `${value}${control.unit ?? "px"}`;
  }

  if (typeof value === "boolean") {
    // A boolean drives a CSS toggle: 1/0 multiplies cleanly inside calc() and works with
    // `opacity` or `--enabled` style switches.
    return value ? "1" : "0";
  }

  return null;
}

function buildCssVars(
  controls: readonly RegistryControlDefinition[],
  values: RegistryControlValues,
): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const control of controls) {
    if (!control.cssVar) {
      continue;
    }

    const formatted = formatControlValue(control, values[control.id]);

    if (formatted !== null) {
      vars[normalizeCssProp(control.cssVar)] = formatted;
    }
  }

  return vars;
}

function mergeCssVars(existing: unknown, theme: Record<string, string>): unknown {
  if (typeof existing === "object" && existing !== null && !Array.isArray(existing)) {
    const record = existing as Record<string, unknown>;
    const existingTheme =
      typeof record.theme === "object" && record.theme !== null ? record.theme : {};

    return { ...record, theme: { ...existingTheme, ...theme } };
  }

  return { theme };
}

/** Index of the `}` matching the `{` at `openIndex`, ignoring braces inside strings. */
function findMatchingBrace(content: string, openIndex: number): number {
  let depth = 0;
  let quote: string | null = null;

  for (let index = openIndex; index < content.length; index += 1) {
    const char = content[index];

    if (quote) {
      if (char === "\\") {
        index += 1;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}
