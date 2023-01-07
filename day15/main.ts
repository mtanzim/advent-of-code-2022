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

function getManhattanDistance(c1: Coord, c2: Coord): number {
  const { x: x1, y: y1 } = c1;
  const { x: x2, y: y2 } = c2;
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

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

function populateDeadzones(
  sensor: Sensor,
  beacon: Beacon,
  mapping: Mapping,
  y: number,
  xMax?: number,
): Coord[] {
  const mhDistance = getManhattanDistance(sensor, beacon);
  const deadZoneCoords: Coord[] = [];

  const { sensors, beacons } = getCoordsFromMapping(mapping);
  const sensorSet = new Set(sensors.map(coordToStr));
  const beaconSet = new Set(beacons.map(coordToStr));

  const { x: asx, y: asy } = sensor;
  // TODO: what if array overflows?
  quadrants.forEach((q) => {
    for (let x = asx; Math.abs(x - asx) <= mhDistance; x = q.xfn(x)) {
      if (xMax && (x > xMax || x < 0)) {
        break;
      }
      const curDist = getManhattanDistance({ x, y }, { x: asx, y: asy });
      if (
        !sensorSet.has(coordToStr({ x, y })) &&
        !beaconSet.has(coordToStr({ x, y })) &&
        curDist <= mhDistance
      ) {
        deadZoneCoords.push({ x, y });
      }
    }
  });

  return deadZoneCoords;
}

(async function main() {
  const mapping = parse(await Deno.readTextFile("./day15/input.txt"));

  function partA() {
    const yInterested = 10;
    const coordSet = new Set();
    Object.entries(mapping).forEach(
      ([sensorStr, beacon]) => {
        console.log(`plotting sensor ${sensorStr}`);
        const sensor = strToCoord(sensorStr);
        const deadZoneCoords = populateDeadzones(
          sensor,
          beacon,
          mapping,
          yInterested,
        );
        deadZoneCoords.forEach((c) => {
          coordSet.add(coordToStr(c));
        });
      },
    );
    console.log(coordSet.size);
  }
  // partA();

  (function partB() {
    const yMax = 20;
    const xMax = 20;
    const xMult = 4000000;

    // console.log(coordSet);

    const ranges = [...Array(yMax)].map((_, y) => {
      const deadZonesInY: Coord[] = Object.entries(mapping).flatMap(
        ([sensorStr, beacon]) => {
          console.log(`plotting sensor ${sensorStr}`);
          const sensor = strToCoord(sensorStr);
          return populateDeadzones(
            sensor,
            beacon,
            mapping,
            y,
            xMax,
          );
        },
      );
      return [...new Set(deadZonesInY.map((c) => c.x))].sort((a, b) => a - b)
        .slice(0, xMax + 1);
    });
    console.log(ranges);
  })();
})();
