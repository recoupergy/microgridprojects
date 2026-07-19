import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest { return { name: "Microgrid Projects", short_name: "Microgrids", description: "Global microgrid project directory and field guide", start_url: "/", display: "standalone", background_color: "#f3f1e8", theme_color: "#071b1d" }; }
