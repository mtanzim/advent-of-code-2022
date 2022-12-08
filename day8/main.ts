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

function dfs(grid: number[][], marked: Map<Coord, boolean>, current: Coord) {
  const { x, y } = current;
  console.log(grid[y][x]);
}

const grid = parse(input);
console.log(grid);

const initMap = new Map();
// iterate over inner grid
for (let y = 1; y < grid.length - 1; y++) {
  for (let x = 1; x < grid[0].length - 1; x++) {
    dfs(grid, initMap, { x, y });
  }
}
