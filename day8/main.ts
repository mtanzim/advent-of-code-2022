const input = `30373
25512
65332
33549
35390`;

function parse(input: string): number[][] {
  const lines = input.split("\n");
  return lines.map((l) => l.split("").map(Number));
}

interface Coord {
  x: number;
  y: number;
}

function dfs(
  grid: number[][],
  marked: Map<Coord, boolean>,
  current: Coord
): boolean {
  const width = grid[0].length;
  const height = grid.length;
  const { x, y } = current;

  // reached an edge, return true
  if (x === width - 1 || y === height - 1 || x === 0 || y === 0) {
    return true;
  }

  marked.set(current, true);

  const left: Coord = { x: x - 1, y };
  const right: Coord = { x: x + 1, y };
  const top: Coord = { x, y: y - 1 };
  const bottom: Coord = { x, y: y + 1 };

  const neighbors: Coord[] = [];
  // get valid neighbors
  for (const c of [left, right]) {
    if (c.x >= 0 && c.x < width && !marked.get(c)) {
      neighbors.push(c);
    }
  }
  for (const c of [top, bottom]) {
    if (c.y >= 0 && c.y < height && !marked.get(c)) {
      neighbors.push(c);
    }
  }
  const curValue = grid[current.y][current.x];
  // filter neighbors to ensure they are lower
  const lowerNeighbors = neighbors.filter((c) => curValue > grid[c.y][c.x]);
  // console.log({ curValue, neighbors, lowerNeighbors });
  return lowerNeighbors.some((n) => dfs(grid, marked, n));
  // let foundEdge = false;
  // for (const n of lowerNeighbors) {
  //   foundEdge = foundEdge || dfs(grid, marked, n);
  // }
  // marked.set(current, false);
  // return foundEdge;
}

async function main() {
  // const input = await Deno.readTextFile("./day8/input.txt");
  const grid = parse(input);
  // console.log(grid);

  const width = grid[0].length;
  const height = grid.length;
  let visibleTrees = 2 * width + 2 * height - 4;

  // iterate over inner grid
  for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[0].length - 1; x++) {
      const marked = new Map();
      const hasEdge = dfs(grid, marked, { x, y });
      if (hasEdge) {
        visibleTrees++;
      }
    }
  }
  console.log(visibleTrees);
}

main();
