function parse(input: string): number[][] {
  const lines = input.split("\n");
  return lines.map((l) => l.split("").map(Number));
}

interface Coord {
  x: number;
  y: number;
}

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
