import { IconBrightness, IconMoon, IconSun } from "@tabler/icons-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useTheme } from "./theme-provider";

const themeOrder = ["system", "light", "dark"] as const;

const themeDetails = {
  system: {
    label: "System",
    icon: IconBrightness,
  },
  light: {
    label: "Light",
    icon: IconSun,
  },
  dark: {
    label: "Dark",
    icon: IconMoon,
  },
} as const;

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const current = themeDetails[theme] ?? themeDetails.system;
  const Icon = current.icon;

  const handleCycleTheme = React.useCallback(() => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  }, [theme, setTheme]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("transition-none duration-0", className)}
            onClick={handleCycleTheme}
            aria-label={`Current theme: ${current.label}. Click to switch theme.`}
          />
        }
      >
        <Icon className="size-4.5 transition-none duration-0" />
        <span className="sr-only">Toggle theme ({current.label})</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="animate-none transition-none duration-0">
        <span>Theme: {current.label}</span>
      </TooltipContent>
    </Tooltip>
  );
}
