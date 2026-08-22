import { describe, expect, it } from "vitest";

import type { RegistryControlDefinition } from "./controls";
import { applyCssDefaults, applyDefaults } from "./customize.server";

const controls: RegistryControlDefinition[] = [
  {
    id: "dotSize",
    label: "Dot size",
    group: "layout",
    type: "slider",
    cssProp: "--dot-size",
    unit: "px",
    default: 2,
  },
  {
    id: "dotColor",
    label: "Dot colour",
    group: "color",
    type: "color",
    cssProp: "--dot-color",
    default: "#3f3f46",
  },
  {
    id: "dotOpacity",
    label: "Dot opacity",
    group: "color",
    type: "slider",
    cssProp: "--dot-opacity",
    unit: "",
    default: 1,
  },
  {
    id: "drift",
    label: "Animate drift",
    group: "logic",
    type: "boolean",
    default: false,
  },
];

const css = `/* stark:defaults */
.stark-bg-dot-grid {
  --dot-color: #3f3f46;
  --dot-size: 2px;
  --dot-opacity: 1;
}
/* stark:end */

.stark-bg-dot-grid::before {
  --dot-size: 999px;
  background-size: var(--dot-size);
}
`;

describe("applyCssDefaults", () => {
  it("rewrites only the declarations named by a control's cssProp", () => {
    const result = applyCssDefaults(css, controls, { dotSize: 6, dotColor: "#ff0066" });

    expect(result).toContain("--dot-color: #ff0066;");
    expect(result).toContain("--dot-size: 6px;");
    // Untouched control keeps its authored value.
    expect(result).toContain("--dot-opacity: 1;");
  });

  it("never reaches declarations outside the stark:defaults block", () => {
    const result = applyCssDefaults(css, controls, { dotSize: 6 });

    // The same property below the marker is part of the effect, not the config surface.
    expect(result).toContain("--dot-size: 999px;");
    expect(result.match(/--dot-size: 6px;/gu)).toHaveLength(1);
  });

  it("appends the control's unit to numbers, and honours an empty unit", () => {
    const result = applyCssDefaults(css, controls, { dotSize: 6, dotOpacity: 0.4 });

    expect(result).toContain("--dot-size: 6px;");
    expect(result).toContain("--dot-opacity: 0.4;");
  });

  it("ignores values with no matching control", () => {
    const result = applyCssDefaults(css, controls, { somethingElse: "injected" });

    expect(result).toBe(css);
    expect(result).not.toContain("injected");
  });

  it("returns the content untouched when the markers are absent", () => {
    const unmarked = ".stark-bg-dot-grid { --dot-size: 2px; }";

    expect(applyCssDefaults(unmarked, controls, { dotSize: 6 })).toBe(unmarked);
  });

  it("leaves a stylesheet alone when the values object is empty", () => {
    expect(applyCssDefaults(css, controls, {})).toBe(css);
  });
});

describe("applyDefaults", () => {
  it("still rewrites a component's defaults literal", () => {
    const source = `const defaults = {\n  title: "Old",\n  radius: 10,\n};\n`;

    expect(applyDefaults(source, { title: "New", radius: 24 })).toContain('title: "New"');
    expect(applyDefaults(source, { title: "New", radius: 24 })).toContain("radius: 24");
  });
});
