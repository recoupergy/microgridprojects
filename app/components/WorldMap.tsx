import type { CSSProperties } from "react";
import type { MicrogridProject } from "../data/projects";

export function WorldMap({ points, label = "Map of microgrid project locations" }: { points: readonly MicrogridProject[]; label?: string }) {
  return (
    <div className="world-map" role="img" aria-label={label}>
      <div className="map-grid" aria-hidden="true" />
      <div className="land land-a" aria-hidden="true" /><div className="land land-b" aria-hidden="true" /><div className="land land-c" aria-hidden="true" /><div className="land land-d" aria-hidden="true" /><div className="land land-e" aria-hidden="true" /><div className="land land-f" aria-hidden="true" />
      <div className="map-points" aria-hidden="true">
        {points.map((project, index) => {
          const style = { "--x": `${((project.longitude + 180) / 360) * 100}%`, "--y": `${((90 - project.latitude) / 180) * 100}%`, "--delay": `${(index % 8) * -0.35}s` } as CSSProperties;
          return <span className="map-point" key={project.slug} style={style} title={project.name} />;
        })}
      </div>
      <span className="map-label map-label-west mono" aria-hidden="true">AMERICAS</span><span className="map-label map-label-east mono" aria-hidden="true">EURASIA</span><span className="map-label map-label-south mono" aria-hidden="true">SOUTHERN GRID</span>
    </div>
  );
}
