function parse(input: string): number[][] {
  const lines = input.split("\n");
  return lines.map((l) => l.split("").map(Number));
}

interface Coord {
  x: number;
  y: number;
}

function isVisibleX(grid: number[][], { x, y }: Coord, v: number): boolean {
  const { left, right } = getLeftRight(grid, { y, x });

  const visible =
    left.every((curVal) => curVal < v) || right.every((curVal) => curVal < v);
  return visible;
}

function isVisibleY(grid: number[][], { x, y }: Coord, v: number): boolean {
  const { top, bottom } = getTopBottom(grid, { x, y });

  const visible =
    top.every((curVal) => curVal < v) || bottom.every((curVal) => curVal < v);

  return visible;
}

function getTopBottom(grid: number[][], { x, y }: Coord) {
  const col = grid.map((col) => col[x]);

  const top = col.slice(0, y).toReversed();
  const bottom = col.slice(y + 1, col.length);
  return { top, bottom };
}

function findScenicScoreX(grid: number[][], { x, y }: Coord, v: number) {
  const { left, right } = getLeftRight(grid, { y, x });
  let leftScore = 0;
  for (const xVal of left) {
    leftScore++;
    if (xVal >= v) {
      break;
    }
  }
  let rightScore = 0;

  for (const xVal of right) {
    rightScore++;
    if (xVal >= v) {
      break;
    }
  }
  return { leftScore, rightScore };
}

function getLeftRight(grid: number[][], { x, y }: Coord) {
  const left = grid[y].slice(0, x).toReversed();
  const right = grid[y].slice(x + 1, grid[0].length);
  return { left, right };
}

function findScenicScoreY(grid: number[][], { x, y }: Coord, v: number) {
  const { top, bottom } = getTopBottom(grid, { x, y });
  let topScore = 0;

  for (const yVal of top) {
    topScore++;
    if (yVal >= v) {
      break;
    }
  }

  let bottomScore = 0;
  for (const yVal of bottom) {
    bottomScore++;
    if (yVal >= v) {
      break;
    }
  }
  return { topScore, bottomScore };
}

const _testInput = `30373
25512
65332
33549
35390`;

async function main() {
  const input = await Deno.readTextFile("./day8/input.txt");
  const grid = parse(input);

  const width = grid[0].length;
  const height = grid.length;
  let visibleTrees = 2 * width + 2 * height - 4;

  // iterate over inner grid
  // part a
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const val = grid[y][x];
      const isVisible =
        isVisibleY(grid, { x, y }, val) || isVisibleX(grid, { x, y }, val);

      if (isVisible) {
        visibleTrees++;
      }
    }
  }
  console.log(visibleTrees);

  // part b
  let maxScenicScore = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const val = grid[y][x];
      const { leftScore, rightScore } = findScenicScoreX(grid, { x, y }, val);
      const { topScore, bottomScore } = findScenicScoreY(grid, { x, y }, val);
      const curScore = [topScore, bottomScore, leftScore, rightScore].reduce(
        (acc, cur) => acc * cur,
        1
      );

      if (curScore > maxScenicScore) {
        maxScenicScore = curScore;
      }
    }
  }
  console.log(maxScenicScore);
}

main();
