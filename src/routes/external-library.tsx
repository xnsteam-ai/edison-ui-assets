import {
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconSearch,
  IconStarFilled,
  IconTicket,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getSeoHead } from "../lib/seo";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/external-library")({
  head: () =>
    getSeoHead({
      title: "External Library",
      description:
        "Curated collection of developer tools, AI platforms, libraries, and exclusive deals.",
      path: "/external-library",
    }),
  component: ExternalLibraryPage,
});

type ToolItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  deal?: string;
  coupon?: string;
  price?: string;
  url: string;
  iconBg?: string;
  icon?: React.ReactNode;
  banner: React.ReactNode;
};

type ToolSection = {
  id: string;
  title: string;
  subtitle: string;
  tools: ToolItem[];
};

const dealsData: ToolItem[] = [
  {
    id: "framer",
    name: "Framer",
    category: "Website & App Builders",
    description: "AI website builder for professional sites fast and free",
    deal: "3 months free",
    coupon: "RECENT25",
    url: "https://www.framer.com",
    iconBg: "bg-black text-white",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
      </svg>
    ),
    banner: (
      <div className="relative size-full overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-3">
        <div className="grid h-full grid-cols-3 content-center gap-2 opacity-90">
          <div className="flex h-14 flex-col justify-between rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-700/40 p-2">
            <span className="font-mono text-[9px] font-bold text-emerald-300">0% AI Data</span>
            <div className="h-1 w-6 rounded-full bg-emerald-400/40" />
          </div>
          <div className="flex h-14 flex-col justify-between rounded-md bg-gradient-to-br from-purple-500/30 to-pink-500/30 p-2">
            <span className="font-mono text-[9px] text-purple-200">wireframe</span>
            <div className="h-1 w-4 rounded-full bg-pink-400/40" />
          </div>
          <div className="flex h-14 flex-col justify-between rounded-md bg-neutral-800/80 p-2">
            <span className="font-mono text-[9px] text-neutral-300">midlife</span>
            <div className="h-1 w-5 rounded-full bg-neutral-600/60" />
          </div>
          <div className="col-span-2 flex h-14 flex-col justify-between rounded-md bg-gradient-to-r from-orange-500/30 via-red-500/20 to-purple-600/30 p-2">
            <span className="font-mono text-[10px] font-bold tracking-tight text-white">
              DEVELOP
            </span>
            <span className="font-mono text-[8px] text-white/60">templates</span>
          </div>
          <div className="flex h-14 items-center justify-center rounded-md bg-neutral-800/90">
            <svg className="size-6 text-white/90" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
            </svg>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "beehiiv",
    name: "beehiiv",
    category: "Content",
    description: "The newsletter platform built to grow and monetize",
    deal: "20% off first 3 months",
    url: "https://www.beehiiv.com",
    iconBg: "bg-gradient-to-br from-purple-600 to-indigo-600 text-white",
    icon: <span className="text-sm leading-none font-bold">🐝</span>,
    banner: (
      <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#12082b] via-[#1a0e3a] to-[#250d4f] px-3 text-center">
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/90 uppercase backdrop-blur-xs">
          <span>beehiiv</span>
        </div>
        <div className="mt-1.5 font-mono text-sm font-extrabold tracking-tight text-white drop-shadow-sm">
          THE ONE PLACE TO BUILD
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1 text-[7px] font-medium tracking-wider text-purple-200/70 uppercase">
          <span className="rounded-sm bg-white/5 px-1 py-0.5">AUTOMATIONS</span>
          <span>•</span>
          <span className="rounded-sm bg-white/5 px-1 py-0.5">NEWSLETTERS</span>
          <span>•</span>
          <span className="rounded-sm bg-white/5 px-1 py-0.5">WEBSITE BUILDER</span>
        </div>
      </div>
    ),
  },
  {
    id: "cal",
    name: "Cal.com",
    category: "Productivity",
    description: "Customizable scheduling software for teams and developers",
    deal: "20% off first year",
    url: "https://cal.com",
    iconBg: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
    icon: <span className="font-mono text-xs font-bold tracking-tight">Cal.</span>,
    banner: (
      <div className="relative flex size-full flex-col justify-between overflow-hidden rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-neutral-800 dark:text-neutral-200">
            The better way to schedule your meetings
          </span>
          <span className="rounded-md bg-neutral-200/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            Cal.com
          </span>
        </div>
        <div className="mt-1.5 rounded-lg border border-neutral-200 bg-white p-2 shadow-2xs dark:border-neutral-800 dark:bg-neutral-950">
          <div className="grid grid-cols-7 gap-1 text-center text-[7px] text-muted-foreground">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[8px] font-medium text-foreground">
            <span className="rounded-md bg-primary/10 text-primary">12</span>
            <span>13</span>
            <span className="rounded-md bg-primary font-bold text-primary-foreground">14</span>
            <span>15</span>
            <span>16</span>
            <span>17</span>
            <span>18</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "superwhisper",
    name: "Superwhisper",
    category: "Productivity",
    description: "AI voice-to-text that works in any app on any platform",
    deal: "40% off first 6 months",
    url: "https://superwhisper.com",
    iconBg: "bg-gradient-to-br from-indigo-950 to-purple-950 text-white",
    icon: (
      <svg
        className="size-4.5 text-purple-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z"
        />
      </svg>
    ),
    banner: (
      <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1e1035] via-[#2f1b54] to-[#4c247c] p-3 text-center">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-xs">
            <svg
              className="size-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2L2 22h20L12 2zm0 6l5 10H7l5-10z"
              />
            </svg>
          </div>
          <span className="font-heading text-sm font-semibold tracking-tight text-white">
            Superwhisper
          </span>
        </div>
        <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
      </div>
    ),
  },
];

const aiToolsData: ToolItem[] = [
  {
    id: "hermes-agent",
    name: "Hermes Agent",
    category: "AI",
    description: "Your Hermes agent live in 60 seconds, on any device",
    price: "From $39/mo",
    url: "https://nousresearch.com",
    iconBg: "bg-neutral-900 text-white",
    icon: <span className="font-serif text-xs font-bold">🏛️</span>,
    banner: (
      <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 via-blue-900 to-indigo-950 p-3 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:8px_8px]" />
        <span className="relative font-serif text-lg font-bold tracking-widest text-white drop-shadow-md">
          HERMES
        </span>
        <span className="relative font-serif text-base font-medium tracking-wider text-blue-200">
          AGENT
        </span>
      </div>
    ),
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "AI",
    description: "Generate lifelike speech and voice agents with AI.",
    deal: "50% off first month",
    url: "https://elevenlabs.io",
    iconBg: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
    icon: <span className="text-xs font-bold tracking-tighter">II</span>,
    banner: (
      <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-xl border-b border-border/40 bg-neutral-100 p-3 text-center dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tighter text-foreground">II</span>
          <span className="font-heading text-base font-bold tracking-tight text-foreground">
            ElevenLabs
          </span>
        </div>
        <div className="mt-2 flex items-center gap-0.5">
          {[4, 12, 8, 16, 22, 14, 8, 18, 24, 10, 6, 14, 20, 8].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-foreground/30"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "reve",
    name: "Reve",
    category: "AI",
    description: "Create, edit, and remix images with natural language",
    price: "Free + paid plans",
    url: "https://reve.art",
    iconBg: "bg-neutral-900 text-white",
    icon: <span className="text-xs">🦋</span>,
    banner: (
      <div className="relative flex size-full flex-col justify-between overflow-hidden rounded-xl bg-neutral-950 p-3">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🦋</span>
            <span className="text-xs font-bold">Reve</span>
          </div>
          <span className="text-[10px] font-medium text-neutral-400">Reimagine reality</span>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-hidden rounded-lg">
          <div className="h-14 w-1/4 rounded-md bg-gradient-to-br from-amber-500 to-red-600" />
          <div className="h-14 w-1/4 rounded-md bg-gradient-to-br from-emerald-500 to-teal-700" />
          <div className="h-14 w-1/4 rounded-md bg-gradient-to-br from-indigo-600 to-violet-900" />
          <div className="h-14 w-1/4 rounded-md bg-gradient-to-br from-sky-400 to-blue-600" />
        </div>
      </div>
    ),
  },
  {
    id: "krea",
    name: "Krea",
    category: "AI",
    description: "AI creative suite for images, video, and 3D assets",
    price: "Free + paid plans",
    url: "https://www.krea.ai",
    iconBg: "bg-black text-white",
    icon: <span className="text-sm font-bold">K</span>,
    banner: (
      <div className="relative size-full overflow-hidden rounded-xl bg-neutral-950 p-2">
        <div className="grid h-full grid-cols-3 gap-1.5">
          <div className="rounded-md bg-gradient-to-tr from-pink-600 to-rose-400" />
          <div className="flex items-center justify-center rounded-md bg-neutral-900">
            <span className="text-base font-bold text-white">K</span>
          </div>
          <div className="rounded-md bg-gradient-to-bl from-purple-700 to-blue-600" />
          <div className="rounded-md bg-gradient-to-r from-emerald-600 to-cyan-500" />
          <div className="rounded-md bg-gradient-to-br from-amber-500 to-orange-600" />
          <div className="rounded-md bg-gradient-to-tr from-indigo-500 to-pink-500" />
        </div>
      </div>
    ),
  },
];

const sections: ToolSection[] = [
  {
    id: "deals",
    title: "Deals",
    subtitle: "Offers available through Recent",
    tools: dealsData,
  },
  {
    id: "ai",
    title: "AI",
    subtitle: "5 tools",
    tools: aiToolsData,
  },
];

const sidebarNav = [
  {
    group: "Browse",
    items: [
      { id: "design", label: "Design" },
      { id: "websites", label: "Websites" },
      { id: "og-images", label: "OG Images" },
      { id: "app-screenshots", label: "App Screenshots" },
      { id: "app-icons", label: "App Icons" },
    ],
  },
  {
    group: "Resources",
    items: [
      { id: "tools", label: "Tools" },
      { id: "skills", label: "Skills" },
    ],
  },
];

function ExternalLibraryPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [activeSidebarItem, setActiveSidebarItem] = React.useState<string>("tools");

  const categoriesList = [
    { id: "all", label: "All Items" },
    { id: "deals", label: "Deals" },
    { id: "ai", label: "AI Tools" },
    { id: "productivity", label: "Productivity" },
    { id: "builders", label: "Builders" },
  ];

  const filteredSections = React.useMemo(() => {
    return sections
      .map((section) => {
        const filteredTools = section.tools.filter((tool) => {
          const matchesSearch =
            searchQuery.trim() === "" ||
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesCategory =
            selectedCategory === "all" ||
            (selectedCategory === "deals" && !!tool.deal) ||
            (selectedCategory === "ai" && tool.category.toLowerCase().includes("ai")) ||
            (selectedCategory === "productivity" &&
              tool.category.toLowerCase().includes("productivity")) ||
            (selectedCategory === "builders" && tool.category.toLowerCase().includes("builder"));

          const matchesSidebar =
            activeSidebarItem === "tools" ||
            (activeSidebarItem === "design" &&
              (tool.category.toLowerCase().includes("builder") ||
                tool.name === "Krea" ||
                tool.name === "Reve")) ||
            (activeSidebarItem === "websites" &&
              (tool.name === "Framer" || tool.name === "beehiiv")) ||
            (activeSidebarItem === "og-images" && (tool.name === "Reve" || tool.name === "Krea")) ||
            (activeSidebarItem === "app-screenshots" &&
              (tool.name === "Cal.com" || tool.name === "Framer")) ||
            (activeSidebarItem === "app-icons" &&
              (tool.name === "Superwhisper" || tool.name === "Krea")) ||
            (activeSidebarItem === "skills" &&
              (tool.name === "Hermes Agent" || tool.name === "ElevenLabs"));

          return matchesSearch && matchesCategory && matchesSidebar;
        });

        return {
          ...section,
          tools: filteredTools,
        };
      })
      .filter((section) => section.tools.length > 0);
  }, [searchQuery, selectedCategory, activeSidebarItem]);

  return (
    <div className="mx-auto flex w-full max-w-screen-2xl gap-8 px-4 sm:px-6 lg:px-8">
      {/* Classic Clean Sidebar */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-44 shrink-0 flex-col gap-6 overflow-y-auto py-8 pr-4 lg:flex">
        {sidebarNav.map((group) => (
          <div key={group.group} className="flex flex-col gap-1.5">
            <h3 className="px-2 text-[13px] font-normal text-muted-foreground/70">{group.group}</h3>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = activeSidebarItem === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSidebarItem(item.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-left text-[13px] transition-colors",
                        isActive
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>{item.label}</span>
                      {isActive ? (
                        <span className="size-2 shrink-0 rounded-full bg-foreground" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col gap-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                External Library
              </h1>
              <Badge variant="secondary" className="font-mono text-xs">
                Curated
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover community tools, AI platforms, integrations, and exclusive creator deals.
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search external tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categoriesList.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full text-xs font-medium"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Sections List */}
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-foreground">No tools found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try selecting "Tools" or adjusting your search/filter.
            </p>
          </div>
        ) : (
          filteredSections.map((section) => <ToolSectionView key={section.id} section={section} />)
        )}
      </main>
    </div>
  );
}

function ToolSectionView({ section }: { section: ToolSection }) {
  const scrollRef = React.useRef<HTMLUListElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <section className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            {section.title}
          </h2>
          <span className="text-xs text-muted-foreground">{section.subtitle}</span>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={scrollLeft}
            className="size-7 rounded-full border border-border/80 bg-background text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground"
            aria-label={`Scroll ${section.title} left`}
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={scrollRight}
            className="size-7 rounded-full border border-border/80 bg-background text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground"
            aria-label={`Scroll ${section.title} right`}
          >
            <IconChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Grid / Carousel List with exact requested specifications */}
      <ul
        ref={scrollRef}
        className="relative no-scrollbar grid grid-cols-1 gap-3 overflow-x-auto transition-all sm:grid-cols-2 lg:grid-cols-4"
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
        }}
      >
        {section.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </ul>
    </section>
  );
}

function ToolCard({ tool }: { tool: ToolItem }) {
  return (
    <li className="group relative flex h-[325px] flex-col overflow-hidden rounded-xl border border-border bg-card p-2 text-card-foreground shadow-xs transition-all duration-200 hover:border-foreground/25 hover:shadow-md">
      {/* Top Banner / Graphic Preview */}
      <div className="relative h-[190px] w-full shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/40">
        {tool.banner}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between px-1 pt-1">
        {/* Top Info: Logo, Title & Description */}
        <div className="flex flex-col gap-1">
          {/* Logo and Title Row */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-6.5 shrink-0 items-center justify-center rounded-md text-xs font-semibold shadow-2xs",
                tool.iconBg ?? "bg-muted text-foreground",
              )}
            >
              {tool.icon}
            </div>
            <div className="flex min-w-0 flex-col">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs leading-none font-semibold text-foreground hover:underline focus-visible:underline"
              >
                {tool.name}
              </a>
              <span className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
                {tool.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="line-clamp-1 text-[11px] leading-snug text-muted-foreground">
            {tool.description}
          </p>
        </div>

        {/* Footer info (Deal / Pricing / Coupon) */}
        <div className="flex items-center justify-between gap-1 border-t border-border/40 pt-1 text-[11px]">
          {tool.deal ? (
            <div className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
              <IconStarFilled className="size-2.5 shrink-0" />
              <span className="truncate text-[11px]">{tool.deal}</span>
            </div>
          ) : tool.price ? (
            <span className="text-[11px] font-medium text-muted-foreground">{tool.price}</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">Available now</span>
          )}

          {tool.coupon ? (
            <div className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground">
              <IconTicket className="size-2.5" />
              <span>{tool.coupon}</span>
            </div>
          ) : (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
              aria-label={`Visit ${tool.name}`}
            >
              <IconExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
