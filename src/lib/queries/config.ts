import { useQuery } from "@tanstack/react-query";

export type SiteConfig = {
  name: string;
  copyright: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
};

// Using a simple mock since we don't have a real API yet
const siteConfig: SiteConfig = {
  copyright: "© 2025 AIWin. All rights reserved.",
  name: "WinEdge",
  theme: {
    primaryColor: "blue",
    secondaryColor: "indigo",
  },
};

export function useSiteConfig() {
  return useQuery({
    queryFn: () => Promise.resolve(siteConfig),
    queryKey: ["siteConfig"],
    staleTime: Infinity,
  });
}
