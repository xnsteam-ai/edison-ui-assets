/**
 * Codec for preview configs.
 *
 * Values are diffed against the schema defaults before encoding, so an untouched preview produces
 * an empty config and share links stay short. Decoding validates every entry against the schema —
 * ids the schema does not declare are dropped, and numbers are clamped to their declared bounds —
 * because the encoded value arrives from a URL and is therefore untrusted input.
 */

import {
  getRegistryControlDefaults,
  type RegistryControlDefinition,
  type RegistryControlValue,
  type RegistryControlValues,
} from "./controls";

export function encodeItemConfig(
  controls: readonly RegistryControlDefinition[],
  values: RegistryControlValues,
): string {
  const defaults = getRegistryControlDefaults(controls);
  const diff: RegistryControlValues = {};

  for (const control of controls) {
    const value = values[control.id];

    if (value === undefined) {
      continue;
    }

    if (JSON.stringify(value) !== JSON.stringify(defaults[control.id])) {
      diff[control.id] = value;
    }
  }

  if (Object.keys(diff).length === 0) {
    return "";
  }

  return toBase64Url(JSON.stringify(diff));
}

export function decodeItemConfig(
  controls: readonly RegistryControlDefinition[],
  encoded: string | null | undefined,
): RegistryControlValues {
  const values = getRegistryControlDefaults(controls);

  if (!encoded) {
    return values;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(fromBase64Url(encoded));
  } catch {
    return values;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return values;
  }

  const incoming = parsed as Record<string, unknown>;

  for (const control of controls) {
    if (!Object.hasOwn(incoming, control.id)) {
      continue;
    }

    const sanitized = sanitizeControlValue(control, incoming[control.id]);

    if (sanitized !== undefined) {
      values[control.id] = sanitized;
    }
  }

  return values;
}

/** Returns `undefined` when the incoming value is not valid for this control. */
function sanitizeControlValue(
  control: RegistryControlDefinition,
  value: unknown,
): RegistryControlValue | undefined {
  switch (control.type) {
    case "text":
    case "textarea":
    case "url":
    case "color":
    case "icon":
      return typeof value === "string" ? value : undefined;

    case "boolean":
      return typeof value === "boolean" ? value : undefined;

    case "slider": {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return undefined;
      }

      const min = control.min ?? Number.NEGATIVE_INFINITY;
      const max = control.max ?? Number.POSITIVE_INFINITY;

      return Math.min(Math.max(value, min), max);
    }

    case "select":
    case "align":
    case "justify":
    case "alignItems": {
      if (typeof value !== "string") {
        return undefined;
      }

      // A `select` restricted by `options` must not accept anything outside them.
      if (control.options && !control.options.some((option) => option.value === value)) {
        return undefined;
      }

      return value;
    }

    case "box":
      return isNumericRecord(value, ["top", "right", "bottom", "left"]) && isRecord(value)
        ? {
            top: Number(value.top),
            right: Number(value.right),
            bottom: Number(value.bottom),
            left: Number(value.left),
          }
        : undefined;

    case "shadow":
      return isRecord(value) &&
        isNumericRecord(value, ["x", "y", "blur", "spread"]) &&
        typeof value.color === "string"
        ? {
            x: Number(value.x),
            y: Number(value.y),
            blur: Number(value.blur),
            spread: Number(value.spread),
            color: value.color,
          }
        : undefined;

    case "gradient":
      return isRecord(value) &&
        (value.type === "linear" || value.type === "radial") &&
        typeof value.angle === "number" &&
        typeof value.from === "string" &&
        typeof value.to === "string"
        ? {
            type: value.type,
            angle: value.angle,
            from: value.from,
            to: value.to,
          }
        : undefined;

    default:
      return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumericRecord(value: unknown, keys: readonly string[]): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return keys.every((key) => typeof value[key] === "number" && Number.isFinite(value[key]));
}

/** Base64url so the config can live in a path segment without escaping. */
function toBase64Url(input: string): string {
  const base64 =
    typeof btoa === "function"
      ? btoa(unescapeUtf8(input))
      : Buffer.from(input, "utf8").toString("base64");

  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function fromBase64Url(input: string): string {
  const base64 = input.replaceAll("-", "+").replaceAll("_", "/");

  if (typeof atob === "function") {
    return escapeUtf8(atob(base64));
  }

  return Buffer.from(base64, "base64").toString("utf8");
}

function unescapeUtf8(input: string): string {
  return String.fromCharCode(...new TextEncoder().encode(input));
}

function escapeUtf8(input: string): string {
  return new TextDecoder().decode(Uint8Array.from(input, (char) => char.charCodeAt(0)));
}
