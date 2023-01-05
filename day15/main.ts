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
  grid: Grid,
  meta: GridMeta,
): [Grid, GridMeta] {
  const mhDistance = getManhattanDistance(sensor, beacon);
  let { x: asx, y: asy } = getArrayCoord(sensor, meta);
  const gridClone: Grid = JSON.parse(JSON.stringify(grid));
  const metaClone: GridMeta = JSON.parse(JSON.stringify(meta));

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
  // TODO: what if array overflows?
  quadrants.forEach((q) => {
    for (let y = asy; Math.abs(y - asy) <= mhDistance; y = q.yfn(y)) {
      // add row to bottom
      if (y === gridClone.length) {
        gridClone.push(
          [...Array(gridClone[0].length)].map((_) => Elements.EMPTY),
        );
        y--;
        asy--;
        metaClone.offsetY++;
      }
      // add row to top
      if (y === -1) {
        gridClone.push(
          [...Array(gridClone[0].length)].map((_) => Elements.EMPTY),
        );
        y++;
        asy++;
        metaClone.offsetY--;
      }
      for (let x = asx; Math.abs(x - asx) <= mhDistance; x = q.xfn(x)) {
        // add column to left
        if (x === -1) {
          gridClone.forEach((row) => row.unshift(Elements.EMPTY));
          x++;
          asx++;
          metaClone.offsetX++;
        }
        if (x === gridClone[0].length) {
          gridClone.forEach((row) => row.push(Elements.EMPTY));
          x--;
          asx--;
          metaClone.offsetX++;
        }

        const curDist = getManhattanDistance({ x, y }, { x: asx, y: asy });
        if (
          gridClone[y][x] === Elements.EMPTY &&
          curDist <= mhDistance
        ) {
          gridClone[y][x] = Elements.NO_BEACON;
        }
      }
    }
  });

  return [gridClone, metaClone];
}

(async function main() {
  const mapping = parse(await Deno.readTextFile("./day15/input.txt"));
  const [initGrid, initMeta] = initializeGrid(mapping);
  // console.log(showGrid(initGrid));
  // console.log(initMeta);

  const sensor = { x: 8, y: 7 };
  const beacon = mapping?.[coordToStr(sensor)];
  const [filledGrid, metaFilled] = populateDeadzones(
    sensor,
    beacon,
    initGrid,
    initMeta,
  );
  console.log(showGrid(filledGrid));
  console.log(metaFilled);
})();
