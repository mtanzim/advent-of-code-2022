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
type GridMeta = { offsetX: number; offsetY: number };
function showGrid(grid: Grid): string {
  return grid.map((row) => row.join("")).join("\n");
}

function getActualCoord(arrayCoord: Coord, meta: GridMeta): Coord {
  const { x, y } = arrayCoord;
  const { offsetX, offsetY } = meta;
  return { x: x + offsetX, y: y + offsetY };
}

function getArrayCoord(actualCoord: Coord, meta: GridMeta): Coord {
  const { x, y } = actualCoord;
  const { offsetX, offsetY } = meta;
  return { x: x - offsetX, y: y - offsetY };
}

function initializeGrid(mapping: Mapping): [Grid, GridMeta] {
  console.log(getCoordRange(mapping));
  const { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } } =
    getCoordRange(mapping);

  const offsetX = minX;
  const offsetY = minY;

  const grid: Grid = [];
  const meta = { offsetX, offsetY };

  const sensors = new Set(Object.keys(mapping));
  const beacons = new Set(Object.values(mapping).map(coordToStr));

  (function initiMap() {
    for (let y = 0; y <= maxY - offsetY; y++) {
      grid[y] = [];
      for (let x = 0; x <= maxX - offsetX; x++) {
        const { x: actualX, y: actualY } = getActualCoord({ x, y }, meta);
        if (sensors.has(coordToStr({ x: actualX, y: actualY }))) {
          grid[y][x] = Elements.SENSOR;
        } else if (beacons.has(coordToStr({ x: actualX, y: actualY }))) {
          grid[y][x] = Elements.BEACON;
        } else {
          grid[y][x] = Elements.EMPTY;
        }
      }
    }
  })();
  return [grid, meta];
}

function getManhattanDistance(c1: Coord, c2: Coord): number {
  const { x: x1, y: y1 } = c1;
  const { x: x2, y: y2 } = c2;
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function populateDeadzones(
  sensor: Sensor,
  beacon: Beacon,
  mapping: Mapping,
): Coord[] {
  // const gridClone: Grid = JSON.parse(JSON.stringify(grid));
  // const metaClone: GridMeta = JSON.parse(JSON.stringify(meta));
  const mhDistance = getManhattanDistance(sensor, beacon);
  const deadZoneCoords: Coord[] = [];

  const { sensors, beacons } = getCoordsFromMapping(mapping);
  const sensorSet = new Set(sensors.map(coordToStr));
  const beaconSet = new Set(beacons.map(coordToStr));

  const quadrants: Array<
    { xfn: (n: number) => number; yfn: (n: number) => number }
  > = [
    {
      xfn: (x: number) => x + 1,
      yfn: (y: number) => y + 1,
    },
    {
      xfn: (x: number) => x - 1,
      yfn: (y: number) => y + 1,
    },
    {
      xfn: (x: number) => x + 1,
      yfn: (y: number) => y - 1,
    },
    {
      xfn: (x: number) => x - 1,
      yfn: (y: number) => y - 1,
    },
  ];

  const { x: asx, y: asy } = sensor;
  // TODO: what if array overflows?
  quadrants.forEach((q) => {
    for (let y = asy; Math.abs(y - asy) <= mhDistance; y = q.yfn(y)) {
      for (let x = asx; Math.abs(x - asx) <= mhDistance; x = q.xfn(x)) {
        const curDist = getManhattanDistance({ x, y }, { x: asx, y: asy });
        if (
          !sensorSet.has(coordToStr({ x, y })) &&
          !beaconSet.has(coordToStr({ x, y })) &&
          curDist <= mhDistance
        ) {
          deadZoneCoords.push({ x, y });
        }
      }
    }
  });

  return deadZoneCoords;
}

(async function main() {
  const mapping = parse(await Deno.readTextFile("./day15/input.txt"));
  // const [initGrid, initMeta] = initializeGrid(mapping);

  const allDeadzones = Object.entries(mapping).flatMap(
    ([sensorStr, beacon]) => {
      console.log(`plotting sensor ${sensorStr}`);
      const sensor = strToCoord(sensorStr);
      const deadZoneCoords = populateDeadzones(
        sensor,
        beacon,
        mapping,
      );
      // console.log({ sensor });
      // console.log({ deadZoneCoords });
      // console.log(showGrid(filledGrid));
      // console.log(metaFilled);
      // console.log();
      return deadZoneCoords;
    },
  );
  const filteredDeadzones = allDeadzones.filter((c) => c.y === 10);
  const dedupedFiltered = new Set(filteredDeadzones.map(coordToStr));
  // console.log(dedupedFiltered);
  console.log(dedupedFiltered.size);
})();
