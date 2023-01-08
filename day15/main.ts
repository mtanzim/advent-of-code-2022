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

function populateDeadzones(
  sensor: Sensor,
  beacon: Beacon,
  xMax: number,
  yMax: number,
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const mhDistance = getManhattanDistance(sensor, beacon);
  const { x: asx, y: asy } = sensor;
  const minX = Math.max(0, asx - mhDistance);
  const maxX = Math.min(xMax, asx + mhDistance);
  const minY = Math.max(0, asy - mhDistance);
  const maxY = Math.min(yMax, asy + mhDistance);
  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

type Range = [number, number];
function foldRanges(r: Range[]): Range {
  console.log(r);
}

(async function main() {
  const mapping = parse(await Deno.readTextFile("./day15/input.txt"));

  (function partB() {
    const yMax = 20;
    const xMax = 20;
    const xMult = 4000000;

    (function findStressSignal() {
      const deadZoneRanges = Object.entries(mapping).flatMap(
        ([sensorStr, beacon]) => {
          const sensor = strToCoord(sensorStr);
          return populateDeadzones(
            sensor,
            beacon,
            xMax,
            yMax,
          );
        },
      );
      console.log({ deadZoneRanges });
      foldRanges(deadZoneRanges.map((dz) => [dz.minX, dz.maxX]));
    })();
  })();
})();
