/**
 * Authoring schema for the preview properties panel.
 *
 * A registry item declares `controls:` in its `_registry.mdx` frontmatter. The panel renders one
 * control per entry, and the resulting values object is passed straight into the item's `Preview`
 * component, so the config object is the single source of truth for what is on screen.
 */

export const registryControlGroups = [
  "content",
  "layout",
  "color",
  "border",
  "effects",
  "logic",
] as const;

export type RegistryControlGroup = (typeof registryControlGroups)[number];

export const registryControlTypes = [
  "text",
  "textarea",
  "url",
  "select",
  "slider",
  "boolean",
  "color",
  "align",
  "justify",
  "alignItems",
  "box",
  "shadow",
  "gradient",
  "icon",
] as const;

export type RegistryControlType = (typeof registryControlTypes)[number];

export type RegistryControlOption = {
  value: string;
  label: string;
};

export type BoxValue = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ShadowValue = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
};

export type GradientValue = {
  type: "linear" | "radial";
  angle: number;
  from: string;
  to: string;
};

/**
 * Concrete union rather than `unknown`: these values cross a TanStack server-function boundary,
 * whose return type must be provably serializable.
 */
export type RegistryControlValue =
  | string
  | number
  | boolean
  | BoxValue
  | ShadowValue
  | GradientValue;

export type RegistryControlDefinition = {
  id: string;
  label: string;
  group: RegistryControlGroup;
  type: RegistryControlType;
  default?: RegistryControlValue;
  /** `slider` bounds. */
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** `select` choices. */
  options?: RegistryControlOption[];
  /** Maps this control onto a CSS custom property on the preview canvas. */
  cssVar?: string;
  description?: string;
};

/** Values keyed by control id, as rendered and as encoded into share links. */
export type RegistryControlValues = Record<string, RegistryControlValue>;

export function isRegistryControlGroup(value: unknown): value is RegistryControlGroup {
  return typeof value === "string" && registryControlGroups.some((group) => group === value);
}

export function isRegistryControlType(value: unknown): value is RegistryControlType {
  return typeof value === "string" && registryControlTypes.some((type) => type === value);
}

/** Structural check used by both the MDX parser and the customised-JSON route. */
export function isRegistryControlDefinition(value: unknown): value is RegistryControlDefinition {
  if (!isRecord(value)) {
    return false;
  }

  const control = value;

  if (typeof control.id !== "string" || control.id.length === 0) {
    return false;
  }

  if (typeof control.label !== "string" || control.label.length === 0) {
    return false;
  }

  if (!isRegistryControlGroup(control.group) || !isRegistryControlType(control.type)) {
    return false;
  }

  for (const field of ["min", "max", "step"] as const) {
    if (control[field] !== undefined && typeof control[field] !== "number") {
      return false;
    }
  }

  for (const field of ["unit", "cssVar", "description"] as const) {
    if (control[field] !== undefined && typeof control[field] !== "string") {
      return false;
    }
  }

  if (control.options !== undefined && !isControlOptionList(control.options)) {
    return false;
  }

  return true;
}

/** Default values for a schema, used as the baseline that share links are diffed against. */
export function getRegistryControlDefaults(
  controls: readonly RegistryControlDefinition[],
): RegistryControlValues {
  const values: RegistryControlValues = {};

  for (const control of controls) {
    if (control.default !== undefined) {
      values[control.id] = control.default;
    }
  }

  return values;
}

function isControlOptionList(value: unknown): value is RegistryControlOption[] {
  return Array.isArray(value) && value.every(isControlOption);
}

function isControlOption(value: unknown): value is RegistryControlOption {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.value === "string" && typeof value.label === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
