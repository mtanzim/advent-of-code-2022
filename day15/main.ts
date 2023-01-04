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

function getCoordRange(mapping: Mapping): { min: Coord; max: Coord } {
  const coords = Object.keys(mapping).map(strToCoord).concat(
    Object.values(mapping),
  );

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

(async function main() {
  const mapping = parse(await Deno.readTextFile("./day15/input.txt"));
  const coordRange = getCoordRange(mapping);
  console.log({ mapping, coordRange });
})();
