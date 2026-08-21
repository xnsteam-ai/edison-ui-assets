import { IconBlocks, IconBrandGithub } from "@tabler/icons-react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RegistryDomain } from "../lib/registry/item-types";
import { getSeoHead } from "../lib/seo";
import { siteConfig } from "../lib/site-config";

/** Short editorial labels for the four sub-registries, plus the default "All" overview. */
const homeCategories = [
  { id: "all", label: "All" },
  { id: "components", label: "Components" },
  { id: "icons", label: "Icon + Logo + Illustration" },
  { id: "fonts", label: "Font" },
  { id: "media", label: "Images & Video" },
] as const satisfies readonly { id: "all" | RegistryDomain; label: string }[];

export const Route = createFileRoute("/")({
  head: () =>
    getSeoHead({
      title: siteConfig.name,
      description: siteConfig.description,
      path: "/",
    }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="font-mono text-2xl font-bold tracking-tighter sm:text-3xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-lg text-base text-muted-foreground">{siteConfig.description}</p>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link to="/$section" params={{ section: "components" }} />}
          >
            <IconBlocks data-icon="inline-start" />
            Browse
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<a href={siteConfig.repositoryUrl} target="_blank" rel="noopener noreferrer" />}
          >
            <IconBrandGithub data-icon="inline-start" />
            GitHub
          </Button>
        </div>
      </div>
      <CategoryNav />
    </div>
  );
}

function CategoryNav() {
  return (
    <div className="mt-14 w-full sm:mt-16">
      <h2 className="sr-only">Categories</h2>
      <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
        {homeCategories.map((category) => {
          const isActive = category.id === "all";

          return (
            <li key={category.id}>
              <span
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-1.5 text-sm whitespace-nowrap",
                  isActive
                    ? "bg-primary font-medium text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {category.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
