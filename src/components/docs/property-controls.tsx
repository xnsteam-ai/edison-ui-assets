"use client";

import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconLayoutAlignBottom,
  IconLayoutAlignMiddle,
  IconLayoutAlignTop,
  IconLink,
} from "@tabler/icons-react";
import * as React from "react";

import type {
  BoxValue,
  GradientValue,
  RegistryControlDefinition,
  RegistryControlGroup,
  RegistryControlValue,
  RegistryControlValues,
  ShadowValue,
} from "../../lib/registry/controls";
import { registryControlGroups } from "../../lib/registry/controls";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

const groupLabels: Record<RegistryControlGroup, string> = {
  content: "Typography & text",
  layout: "Layout & spacing",
  color: "Colors",
  border: "Borders & shape",
  effects: "Effects",
  logic: "Content logic",
};

const alignOptions = [
  { value: "left", label: "Left", Icon: IconAlignLeft },
  { value: "center", label: "Center", Icon: IconAlignCenter },
  { value: "right", label: "Right", Icon: IconAlignRight },
  { value: "justify", label: "Justify", Icon: IconAlignJustified },
] as const;

const justifyOptions = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "between", label: "Between" },
] as const;

const alignItemsOptions = [
  { value: "start", label: "Top", Icon: IconLayoutAlignTop },
  { value: "center", label: "Middle", Icon: IconLayoutAlignMiddle },
  { value: "end", label: "Bottom", Icon: IconLayoutAlignBottom },
] as const;

type PropertyControlsProps = {
  controls: readonly RegistryControlDefinition[];
  values: RegistryControlValues;
  onChange: (id: string, value: RegistryControlValue) => void;
  iconNames: readonly string[];
};

export function PropertyControls({ controls, values, onChange, iconNames }: PropertyControlsProps) {
  return (
    <>
      {registryControlGroups.map((group) => {
        const groupControls = controls.filter((control) => control.group === group);

        if (groupControls.length === 0) {
          return null;
        }

        return (
          <section key={group} className="flex flex-col gap-3">
            <h3 className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {groupLabels[group]}
            </h3>
            {groupControls.map((control) => (
              <ControlField
                key={control.id}
                control={control}
                value={values[control.id]}
                onChange={(next) => onChange(control.id, next)}
                iconNames={iconNames}
              />
            ))}
          </section>
        );
      })}
    </>
  );
}

function ControlField({
  control,
  value,
  onChange,
  iconNames,
}: {
  control: RegistryControlDefinition;
  value: unknown;
  onChange: (value: RegistryControlValue) => void;
  iconNames: readonly string[];
}) {
  // Booleans put the switch inline with the label rather than stacked under it.
  if (control.type === "boolean") {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="text-xs text-foreground">{control.label}</span>
        <Switch checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked)} />
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">{control.label}</span>
        {control.type === "slider" ? (
          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
            {typeof value === "number" ? value : 0}
            {control.unit ?? ""}
          </span>
        ) : null}
      </div>
      <ControlInput control={control} value={value} onChange={onChange} iconNames={iconNames} />
      {control.description ? (
        <p className="text-[11px] text-muted-foreground">{control.description}</p>
      ) : null}
    </div>
  );
}

function ControlInput({
  control,
  value,
  onChange,
  iconNames,
}: {
  control: RegistryControlDefinition;
  value: unknown;
  onChange: (value: RegistryControlValue) => void;
  iconNames: readonly string[];
}) {
  switch (control.type) {
    case "text":
      return (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 text-sm"
          aria-label={control.label}
        />
      );

    case "textarea":
      return (
        <Textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="text-sm"
          aria-label={control.label}
        />
      );

    case "url":
      return (
        <div className="relative">
          <IconLink
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="url"
            inputMode="url"
            placeholder="https://"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className="h-8 pl-8 text-sm"
            aria-label={control.label}
          />
        </div>
      );

    case "slider":
      return (
        <Slider
          value={typeof value === "number" ? value : (control.min ?? 0)}
          min={control.min ?? 0}
          max={control.max ?? 100}
          step={control.step ?? 1}
          onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
          aria-label={control.label}
        />
      );

    case "select":
      return (
        <Select
          value={typeof value === "string" ? value : ""}
          onValueChange={(next: string | null) => onChange(next ?? "")}
        >
          <SelectTrigger aria-label={control.label} className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(control.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "color":
      return <ColorControl label={control.label} value={value} onChange={onChange} />;

    case "align":
      return (
        <IconSegmented
          label={control.label}
          options={alignOptions}
          value={typeof value === "string" ? value : "left"}
          onChange={onChange}
        />
      );

    case "alignItems":
      return (
        <IconSegmented
          label={control.label}
          options={alignItemsOptions}
          value={typeof value === "string" ? value : "start"}
          onChange={onChange}
        />
      );

    case "justify":
      return (
        <TextSegmented
          label={control.label}
          options={justifyOptions}
          value={typeof value === "string" ? value : "start"}
          onChange={onChange}
        />
      );

    case "box":
      return <BoxControl value={value} onChange={onChange} />;

    case "shadow":
      return <ShadowControl value={value} onChange={onChange} />;

    case "gradient":
      return <GradientControl value={value} onChange={onChange} />;

    case "icon":
      return (
        <IconPicker
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          iconNames={iconNames}
        />
      );

    default:
      return null;
  }
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (value: RegistryControlValue) => void;
}) {
  const color = typeof value === "string" && value ? value : "#000000";

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color.startsWith("#") ? color.slice(0, 7) : "#000000"}
        onChange={(event) => onChange(event.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded border bg-transparent"
        aria-label={label}
      />
      <Input
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 font-mono text-xs"
        aria-label={`${label} value`}
      />
    </div>
  );
}

function BoxControl({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: RegistryControlValue) => void;
}) {
  const box = asBox(value);

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <label key={side} className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground capitalize">{side.charAt(0)}</span>
          <Input
            type="number"
            value={box[side]}
            onChange={(event) => onChange(withBoxSide(box, side, Number(event.target.value)))}
            className="h-7 px-1.5 text-center text-xs"
            aria-label={`${side} spacing`}
          />
        </label>
      ))}
    </div>
  );
}

function ShadowControl({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: RegistryControlValue) => void;
}) {
  const shadow = asShadow(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-1.5">
        {(["x", "y", "blur", "spread"] as const).map((key) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase">{key}</span>
            <Input
              type="number"
              value={shadow[key]}
              onChange={(event) => onChange(withShadowKey(shadow, key, Number(event.target.value)))}
              className="h-7 px-1.5 text-center text-xs"
              aria-label={`Shadow ${key}`}
            />
          </label>
        ))}
      </div>
      <ColorControl
        label="Shadow color"
        value={shadow.color}
        onChange={(next) =>
          onChange({ ...shadow, color: typeof next === "string" ? next : shadow.color })
        }
      />
    </div>
  );
}

function GradientControl({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: RegistryControlValue) => void;
}) {
  const gradient = asGradient(value);

  return (
    <div className="flex flex-col gap-2">
      <TextSegmented
        label="Gradient type"
        options={[
          { value: "linear", label: "Linear" },
          { value: "radial", label: "Radial" },
        ]}
        value={gradient.type}
        onChange={(next) =>
          onChange({ ...gradient, type: next === "radial" ? "radial" : "linear" })
        }
      />
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-[10px] text-muted-foreground">Angle</span>
        <Slider
          value={gradient.angle}
          min={0}
          max={360}
          step={1}
          onValueChange={(next) =>
            onChange({ ...gradient, angle: Array.isArray(next) ? next[0] : next })
          }
          aria-label="Gradient angle"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorControl
          label="From"
          value={gradient.from}
          onChange={(next) =>
            onChange({ ...gradient, from: typeof next === "string" ? next : gradient.from })
          }
        />
        <ColorControl
          label="To"
          value={gradient.to}
          onChange={(next) =>
            onChange({ ...gradient, to: typeof next === "string" ? next : gradient.to })
          }
        />
      </div>
    </div>
  );
}

function IconPicker({
  value,
  onChange,
  iconNames,
}: {
  value: string;
  onChange: (value: RegistryControlValue) => void;
  iconNames: readonly string[];
}) {
  const [query, setQuery] = React.useState("");
  const normalized = query.trim().toLowerCase();
  const matches = normalized ? iconNames.filter((name) => name.includes(normalized)) : iconNames;

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search icons"
        className="h-8 text-sm"
        aria-label="Search icons"
      />
      <div className="grid max-h-40 grid-cols-6 gap-1 overflow-y-auto rounded-lg border p-1">
        {matches.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-pressed={value === name}
            onClick={() => onChange(name)}
            className={cn(
              "grid aspect-square cursor-pointer place-items-center rounded-md text-[9px] break-all transition-colors",
              value === name ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            {name.replace(/^icon-/u, "").slice(0, 4)}
          </button>
        ))}
        {matches.length === 0 ? (
          <p className="col-span-6 px-1 py-2 text-center text-[11px] text-muted-foreground">
            No icons match.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function IconSegmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly {
    value: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[];
  value: string;
  onChange: (value: RegistryControlValue) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-lg bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "grid flex-1 cursor-pointer place-items-center rounded-md py-1 transition-colors",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <option.Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

function TextSegmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: RegistryControlValue) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-lg bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex-1 cursor-pointer rounded-md px-1.5 py-1 text-[11px] transition-colors",
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

/** Reads a composite value field-by-field so a malformed config falls back per key. */
function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function asBox(value: unknown): BoxValue {
  const record = asRecord(value);

  return {
    top: num(record.top, 0),
    right: num(record.right, 0),
    bottom: num(record.bottom, 0),
    left: num(record.left, 0),
  };
}

function asShadow(value: unknown): ShadowValue {
  const record = asRecord(value);

  return {
    x: num(record.x, 0),
    y: num(record.y, 2),
    blur: num(record.blur, 8),
    spread: num(record.spread, 0),
    color: str(record.color, "#00000026"),
  };
}

function asGradient(value: unknown): GradientValue {
  const record = asRecord(value);

  return {
    type: record.type === "radial" ? "radial" : "linear",
    angle: num(record.angle, 135),
    from: str(record.from, "#7c5cff"),
    to: str(record.to, "#2fd3c6"),
  };
}

function withBoxSide(box: BoxValue, side: keyof BoxValue, value: number): BoxValue {
  return {
    top: side === "top" ? value : box.top,
    right: side === "right" ? value : box.right,
    bottom: side === "bottom" ? value : box.bottom,
    left: side === "left" ? value : box.left,
  };
}

function withShadowKey(
  shadow: ShadowValue,
  key: "x" | "y" | "blur" | "spread",
  value: number,
): ShadowValue {
  return {
    x: key === "x" ? value : shadow.x,
    y: key === "y" ? value : shadow.y,
    blur: key === "blur" ? value : shadow.blur,
    spread: key === "spread" ? value : shadow.spread,
    color: shadow.color,
  };
}
