type Coord = {
  x: number;
  y: number;
};

type Sensor = Coord;
type Beacon = Coord;

// key: sensor
type Mapping = Record<string, Beacon>;

function coordToStr(c: Coord): string {
  return `${c.x},${c.y}`;
}
function strToCoord(s: string): Coord {
  const [x, y] = s.split(",").map(Number);
  return { x, y };
}

function parse(input: string): Mapping {
  const lines = input.split("\n");
  return lines.map((l) => {
    const [sensorTxt, beaconTxt] = l.split(":");

    const [, relevantSensorTxt] = sensorTxt.split("at ");
    const [, relevantBeaconTxt] = beaconTxt.split("at ");
    const [sxt, syt] = relevantSensorTxt.split(", ");
    const [bxt, byt] = relevantBeaconTxt.split(", ");
    const [, sx] = sxt.split("=");
    const [, sy] = syt.split("=");
    const [, bx] = bxt.split("=");
    const [, by] = byt.split("=");
    return {
      sensor: { x: Number(sx), y: Number(sy) },
      beacon: { x: Number(bx), y: Number(by) },
    };
  }).reduce((acc, cur) => {
    return {
      ...acc,
      [coordToStr(cur.sensor)]: cur.beacon,
    };
  }, {});
}

function getCoordsFromMapping(
  mapping: Mapping,
): { sensors: Coord[]; beacons: Coord[] } {
  return {
    sensors: Object.keys(mapping).map(strToCoord),
    beacons: Object.values(mapping),
  };
}

function getCoordRange(mapping: Mapping): { min: Coord; max: Coord } {
  const { sensors, beacons } = getCoordsFromMapping(mapping);
  const coords = sensors.concat(beacons);

  const minX = coords.reduce(
    (acc, cur) => cur.x < acc ? cur.x : acc,
    Number.POSITIVE_INFINITY,
  );
  const minY = coords.reduce(
    (acc, cur) => cur.y < acc ? cur.y : acc,
    Number.POSITIVE_INFINITY,
  );

  const maxX = coords.reduce(
    (acc, cur) => cur.x > acc ? cur.x : acc,
    Number.NEGATIVE_INFINITY,
  );
  const maxY = coords.reduce(
    (acc, cur) => cur.y > acc ? cur.y : acc,
    Number.NEGATIVE_INFINITY,
  );

  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

enum Elements {
  SENSOR = "S",
  BEACON = "B",
  EMPTY = ".",
  NO_BEACON = "#",
}

type Grid = Array<Array<Elements>>;
function showGrid(grid: Grid): string {
  return grid.map((row) => row.join("")).join("\n");
}

function drawGrid(mapping: Mapping): void {
  const { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } } =
    getCoordRange(mapping);

  const offsetX = minX;
  const offsetY = minY;

  const grid: Grid = [];

  (function initiMap() {
    for (let y = 0; y <= maxY - offsetY; y++) {
      grid[y] = [];
      for (let x = 0; x <= maxX - offsetX; x++) {
        grid[y][x] = Elements.EMPTY;
      }
    }
  })();

  console.log(showGrid(grid));
}

(async function main() {
  const mapping = parse(await Deno.readTextFile("./day15/input.txt"));
  drawGrid(mapping);
})();
