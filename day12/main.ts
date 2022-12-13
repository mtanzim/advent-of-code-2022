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

function findStartOrEnd(val: number, heightGrid: number[][]): Coord {
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
    let curHeightVal = heightGrid[y][x];

    if (curHeightVal === START_VAL) {
      curHeightVal = "a".charCodeAt(0);
    }
    if (curHeightVal === END_VAL) {
      return distTo;
    }

    const { width, height } = getDimensions(heightGrid);
    const neighbors: Array<Coord> = [];
    const left: Coord = { x: x - 1, y };
    const right: Coord = { x: x + 1, y };
    const top: Coord = { x, y: y - 1 };
    const bottom: Coord = { x, y: y + 1 };

    const getNeighborVal = (c: Coord): number => {
      const neighborHeightVal = heightGrid[c.y][c.x];
      if (neighborHeightVal === END_VAL) {
        return "z".charCodeAt(0);
      }
      return neighborHeightVal;
    };

    // gather neighbors
    [left, right, top, bottom].forEach((c) => {
      if (
        c.x >= 0 &&
        c.x < width &&
        c.y >= 0 &&
        c.y < height &&
        !marked.has(coordToStr(c))
      ) {
        if (getNeighborVal(c) - curHeightVal <= 1) {
          neighbors.push({ x: c.x, y: c.y });
        }
      }
    });

    for (const n of neighbors) {
      queue.push(n);
      marked.add(coordToStr(n));
      distTo.set(coordToStr(n), (distTo.get(coordToStr(vertex)) || 0) + 1);
    }
  }

  return distTo;
}

function getDimensions(heightGrid: number[][]): Dimension {
  const width = heightGrid[0].length;
  const height = heightGrid.length;
  return { width, height };
}

async function main() {
  const input = await Deno.readTextFile("./day12/input.txt");
  const heightGrid = parse(input);
  const source: Coord = findStartOrEnd(START_VAL, heightGrid);

  // part a
  bfs(heightGrid, source);
  const sink: Coord = findStartOrEnd(END_VAL, heightGrid);
  const distTo = bfs(heightGrid, source);
  const distance = distTo.get(coordToStr(sink));
  console.log(distance);

  // part b
  const possibleSources = findCoordsOfVal(
    new Set(["S".charCodeAt(0), "a".charCodeAt(0)]),
    heightGrid
  );

  const minDistance = possibleSources.reduce((acc: number, cur) => {
    const distTo = bfs(heightGrid, cur);
    const distance = distTo.get(coordToStr(sink));
    // has no path to sink
    if (!distance) {
      return acc;
    }
    if (distance < acc) {
      return distance;
    }
    return acc;
  }, Number.POSITIVE_INFINITY);
  console.log(minDistance);
}

main();
