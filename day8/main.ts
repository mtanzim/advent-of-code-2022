function parse(input: string): number[][] {
  const lines = input.split("\n");
  return lines.map((l) => l.split("").map(Number));
}

interface Coord {
  x: number;
  y: number;
}

/*
function dfs(
  grid: number[][],
  marked: Record<string, boolean>,
  current: Coord
): boolean {
  const width = grid[0].length;
  const height = grid.length;
  const { x, y } = current;

  // reached an edge, return true
  if (x === width - 1 || y === height - 1 || x === 0 || y === 0) {
    return true;
  }
  const getCoordKey = (c: Coord) => `${c.x}|${c.y}`;

  marked[getCoordKey(current)] = true;

  const left: Coord = { x: x - 1, y };
  const right: Coord = { x: x + 1, y };
  const top: Coord = { x, y: y - 1 };
  const bottom: Coord = { x, y: y + 1 };

  const neighbors: Coord[] = [];
  // get valid neighbors
  for (const c of [left, right]) {
    if (c.x >= 0 && c.x < width) {
      neighbors.push(c);
    }
  }
  for (const c of [top, bottom]) {
    if (c.y >= 0 && c.y < height) {
      neighbors.push(c);
    }
  }
  const curValue = grid[current.y][current.x];
  // filter neighbors to ensure they are lower
  const lowerNeighbors = neighbors.filter((c) => curValue > grid[c.y][c.x]);
  const unmarkedNeighbors = lowerNeighbors.filter(
    (c) => !marked[getCoordKey(c)]
  );

  return unmarkedNeighbors.some((n) => dfs(grid, marked, n));
}
*/

function traverseX(grid: number[][], { x, y }: Coord, v: number): boolean {
  // go left
  const left = grid[y].slice(0, x);
  const right = grid[y].slice(x + 1, grid[0].length);

  const visible =
    left.every((curVal) => curVal < v) || right.every((curVal) => curVal < v);
  console.log({ x, y, left, v, right, visible });
  return visible;
}

function traverseY(grid: number[][], { x, y }: Coord, v: number): boolean {
  // go left
  const col = grid.map((col) => col[x]);
  const top = col.slice(0, y);
  const bottom = col.slice(y + 1, col.length);

  const visible =
    top.every((curVal) => curVal < v) || bottom.every((curVal) => curVal < v);
  console.log({ x, y, top, v, bottom, visible });

  return visible;
}

async function main() {
  const testInput = `30373
25512
65332
33549
35390`;
  const input = await Deno.readTextFile("./day8/input.txt");
  const grid = parse(input);
  console.log(grid);

  const width = grid[0].length;
  const height = grid.length;
  let visibleTrees = 2 * width + 2 * height - 4;

  // iterate over inner grid
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const val = grid[y][x];
      const hasEdge =
        traverseY(grid, { x, y }, val) || traverseX(grid, { x, y }, val);

      if (hasEdge) {
        console.log({ x, y, val, hasEdge });
        console.log();
        visibleTrees++;
      }
    }
  }
  console.log(visibleTrees);
}

main();
