function parse(input: string): number[][] {
  return input
    .split("\n")
    .map((line) => line.split("").map((c) => c.charCodeAt(0)));
}

type Coord = {
  x: number;
  y: number;
};

function coordToStr(c: Coord): string {
  return `${c.x}|${c.y}`;
}

type Dimension = {
  width: number;
  height: number;
};

const START_VAL = "S".charCodeAt(0);
const END_VAL = "E".charCodeAt(0);

function findCoordOfVal(val: number, heightGrid: number[][]): Coord {
  const { height, width } = getDimensions(heightGrid);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (heightGrid[y][x] === val) {
        return { x, y };
      }
    }
  }
  // invalid case
  return { x: -1, y: -1 };
}

function findCoordsOfVal(vals: Set<number>, heightGrid: number[][]): Coord[] {
  const { height, width } = getDimensions(heightGrid);
  const coords: Coord[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (vals.has(heightGrid[y][x])) {
        coords.push({ x, y });
      }
    }
  }
  return coords;
}

function bfs(heightGrid: number[][], start: Coord) {
  const queue: Coord[] = [start];
  const marked: Set<string> = new Set([coordToStr(start)]);
  const distTo: Map<string, number> = new Map([[coordToStr(start), 0]]);
  while (queue.length > 0) {
    const vertex = queue.shift();
    if (!vertex) {
      throw new Error("bruh I just checked your length");
    }

    const { x, y } = vertex;
    const curHeightVal =
      heightGrid[y][x] === START_VAL ? "a".charCodeAt(0) : heightGrid[y][x];

    if (curHeightVal === END_VAL) {
      return distTo;
    }

    const getNeighborVal = (c: Coord): number => {
      const neighborHeightVal = heightGrid[c.y][c.x];
      if (neighborHeightVal === END_VAL) {
        return "z".charCodeAt(0);
      }
      return neighborHeightVal;
    };

    const { width, height } = getDimensions(heightGrid);
    const left: Coord = { x: x - 1, y };
    const right: Coord = { x: x + 1, y };
    const top: Coord = { x, y: y - 1 };
    const bottom: Coord = { x, y: y + 1 };
    // traverse neighbors
    [left, right, top, bottom]
      .filter(
        (c) =>
          c.x >= 0 &&
          c.x < width &&
          c.y >= 0 &&
          c.y < height &&
          !marked.has(coordToStr(c)) &&
          getNeighborVal(c) - curHeightVal <= 1
      )
      .forEach((n) => {
        queue.push(n);
        marked.add(coordToStr(n));
        distTo.set(coordToStr(n), (distTo.get(coordToStr(vertex)) || 0) + 1);
      });
  }

  return distTo;
}

function getDimensions(heightGrid: number[][]): Dimension {
  const width = heightGrid[0].length;
  const height = heightGrid.length;
  return { width, height };
}

async function main() {
  const heightGrid = parse(await Deno.readTextFile("./day12/input.txt"));
  const source: Coord = findCoordOfVal(START_VAL, heightGrid);

  // part a
  const distTo = bfs(heightGrid, source);
  const sink: Coord = findCoordOfVal(END_VAL, heightGrid);
  const distance = distTo.get(coordToStr(sink));

  // part b
  const minDistance = findCoordsOfVal(
    new Set(["S".charCodeAt(0), "a".charCodeAt(0)]),
    heightGrid
  ).reduce((acc: number, cur) => {
    const distTo = bfs(heightGrid, cur);
    const distance = distTo.get(coordToStr(sink));
    if (!distance || distance > acc) {
      return acc;
    }
    return distance;
  }, Number.POSITIVE_INFINITY);

  // results
  console.log({ minDistance, distance });
}

main();
