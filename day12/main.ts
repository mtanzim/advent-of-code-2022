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

function strToCoord(s: string): Coord {
  const [x, y] = s.split("|");
  return {
    x: Number(x),
    y: Number(y),
  };
}

type Dimension = {
  width: number;
  height: number;
};

const START = "S".charCodeAt(0);
const END = "E".charCodeAt(0);

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

function bfs(heightGrid: number[][], start: Coord) {
  let queue: Coord[] = [start];
  const marked: Set<string> = new Set([coordToStr(start)]);
  // key: to, value: from
  const edgeTo: Map<string, string> = new Map();
  const distTo: Map<string, number> = new Map([[coordToStr(start), 0]]);
  while (queue.length > 0) {
    const vertex = queue.shift();

    if (!vertex) {
      throw new Error("weird");
    }
    const { x, y } = vertex;
    let curHeightVal = heightGrid[y][x];

    if (curHeightVal === START) {
      curHeightVal = "a".charCodeAt(0);
    }
    if (curHeightVal === END) {
      return distTo;
    }

    const { width, height } = getDimensions(heightGrid);
    const neighbors: Array<Coord> = [];
    const left: Coord = { x: x - 1, y };
    const right: Coord = { x: x + 1, y };
    const top: Coord = { x, y: y - 1 };
    const bottom: Coord = { x, y: y + 1 };

    // gather neighbors
    [left, right].forEach((c) => {
      if (c.x >= 0 && c.x < width && !marked.has(coordToStr(c))) {
        let neighborHeightVal = heightGrid[c.y][c.x];
        if (neighborHeightVal === END) {
          neighborHeightVal = "z".charCodeAt(0);
        }
        if (neighborHeightVal - curHeightVal <= 1) {
          neighbors.push({ x: c.x, y: c.y });
        }
      }
    });

    [top, bottom].forEach((c) => {
      if (c.y >= 0 && c.y < height && !marked.has(coordToStr(c))) {
        let neighborHeightVal = heightGrid[c.y][c.x];
        if (neighborHeightVal === END) {
          neighborHeightVal = "z".charCodeAt(0);
        }
        if (neighborHeightVal - curHeightVal <= 1) {
          neighbors.push({ x: c.x, y: c.y });
        }
      }
    });

    for (const n of neighbors) {
      // console.log({
      //   currentPos: { x, y },
      //   neighborPos: { x: n.x, y: n.y },
      //   curChar: String.fromCharCode(curHeightVal),
      //   neighborChar: String.fromCharCode(heightGrid[n.y][n.x]),
      // });

      queue.push(n);
      marked.add(coordToStr(n));
      edgeTo.set(coordToStr(n), coordToStr(vertex));
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
  const source: Coord = findStartOrEnd(START, heightGrid);
  bfs(heightGrid, source);
  const sink: Coord = findStartOrEnd(END, heightGrid);
  const distTo = bfs(heightGrid, source);
  const distance = distTo.get(coordToStr(sink));

  // part 1
  // console.log(input);
  // console.log(heightGrid);
  // console.log(source);
  // console.log(sink);
  // console.log(distTo);
  console.log(distance);

  // let numSteps = 0;
  // let curCoord = sink;
  // while (coordToStr(curCoord) !== coordToStr(source)) {
  //   numSteps++;
  //   const next = edgeTo.get(coordToStr(curCoord));
  //   if (!next) {
  //     throw new Error("done goofed up!");
  //   }
  //   curCoord = strToCoord(next);
  // }
  // console.log(numSteps);
}

main();
