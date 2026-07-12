import fs from "fs";
import topojson from "topojson-client";

const topo = JSON.parse(fs.readFileSync(`${process.env.TEMP}/land-110m.json`, "utf8"));
const geo = topojson.feature(topo, topo.objects.land);

const W = 1000;
const H = 500;
const pad = 24;

function project(lon, lat) {
  const x = pad + ((lon + 180) / 360) * (W - 2 * pad);
  const y = pad + ((90 - lat) / 180) * (H - 2 * pad);
  return [x, y];
}

function ringToPath(ring) {
  return (
    ring
      .map((p, i) => {
        const [x, y] = project(p[0], p[1]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join("") + "Z"
  );
}

function geomToPath(g) {
  if (g.type === "Polygon") return g.coordinates.map(ringToPath).join("");
  if (g.type === "MultiPolygon") {
    return g.coordinates.map((poly) => poly.map(ringToPath).join("")).join("");
  }
  return "";
}

let d = "";
const features = geo.type === "FeatureCollection" ? geo.features : [geo];
for (const f of features) {
  d += geomToPath(f.geometry || f);
}

fs.writeFileSync(
  new URL("../src/components/worldMapPath.js", import.meta.url),
  `export const WORLD_LAND_PATH = ${JSON.stringify(d)};\n`,
);

console.log("path length", d.length, "kb", (d.length / 1024).toFixed(1));
