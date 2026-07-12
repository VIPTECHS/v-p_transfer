const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;
const MAP_PAD = 24;

export function projectLonLat(lon, lat) {
  const x = MAP_PAD + ((lon + 180) / 360) * (MAP_WIDTH - 2 * MAP_PAD);
  const y = MAP_PAD + ((90 - lat) / 180) * (MAP_HEIGHT - 2 * MAP_PAD);
  return {
    x: (x / MAP_WIDTH) * 100,
    y: (y / MAP_HEIGHT) * 100,
  };
}
