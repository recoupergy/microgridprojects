export const marketProfiles = [
  { slug: "north-america", title: "North America", href: "/projects?region=North%20America", short: "Resilience, critical infrastructure, campuses, and defense installations drive a diverse market." },
  { slug: "africa", title: "Africa & Middle East", href: "/projects?region=Africa%20%26%20Middle%20East", short: "Energy access, remote industry, and the economics of avoided fuel shape deployment." },
  { slug: "asia", title: "Asia", href: "/projects?region=Asia", short: "Island systems, industrial campuses, and dense urban test beds accelerate technical variety." },
  { slug: "islands", title: "Islands & remote places", href: "/projects?sector=Island%20%26%20remote%20community", short: "High imported-fuel costs make renewables, storage, and local control especially valuable." },
  { slug: "europe", title: "Europe", href: "/projects?region=Europe", short: "Island pilots, research platforms, and community energy markets test new operating models." },
  { slug: "latin-america", title: "Latin America & Caribbean", href: "/projects?region=Latin%20America%20%26%20Caribbean", short: "Remote access, storm resilience, mining, and island economics create distinct project needs." },
] as const;

export const microgridTypes = [
  { slug: "campus", name: "Campus microgrids", summary: "Coordinate generation, thermal systems, storage, and flexible loads across universities, hospitals, corporate sites, or military campuses." },
  { slug: "community", name: "Community microgrids", summary: "Serve multiple homes, businesses, and public facilities with shared local generation and resilience goals." },
  { slug: "island", name: "Island microgrids", summary: "Balance isolated grids where imported fuel is expensive and wind, solar, storage, and dispatchable power must work together." },
  { slug: "remote", name: "Remote microgrids", summary: "Deliver reliable power beyond the reach of a strong utility grid, often reducing diesel use with renewables and batteries." },
  { slug: "military", name: "Military microgrids", summary: "Prioritize mission assurance, secure islanding, fuel resilience, and continuity for critical defense loads." },
  { slug: "industrial", name: "Industrial microgrids", summary: "Protect process loads and manage energy cost at mines, manufacturing sites, data centers, and commercial facilities." },
  { slug: "dc", name: "DC microgrids", summary: "Connect inherently direct-current resources and loads—solar, batteries, EVs, LEDs, and electronics—with fewer conversion steps." },
  { slug: "utility", name: "Utility microgrids", summary: "Use distribution-grid assets and local controls to improve reliability for a defined feeder, district, or community." },
] as const;
