enum BoardElem {
  AIR = ".",
  ROCK = "#",
  SOURCE = "+",
  SAND = "O",
}

interface Coord {
  x: number;
  y: number;
}

const SOURCE_COORD: Coord = { x: 500, y: 0 };

function parse(input: string): Coord[][] {
  const sandPaths = input.split("\n").map((sp) =>
    sp.split(" -> ").map((c) => {
      const [x, y] = c.split(",").map(Number);
      return { x, y };
    })
  );
  return sandPaths;
}

type GameCoodRange = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function getStartCoord(paths: Coord[][]): GameCoodRange {
  const flatX = paths.flatMap((p) => p.map((c) => c.x)).concat(SOURCE_COORD.x);
  const flatY = paths.flatMap((p) => p.map((c) => c.y)).concat(SOURCE_COORD.y);
  const minX = flatX.reduce(
    (acc, cur) => (acc < cur ? acc : cur),
    Number.POSITIVE_INFINITY
  );
  const maxX = flatX.reduce(
    (acc, cur) => (acc > cur ? acc : cur),
    Number.NEGATIVE_INFINITY
  );
  const minY = flatY.reduce(
    (acc, cur) => (acc < cur ? acc : cur),
    Number.POSITIVE_INFINITY
  );
  const maxY = flatY.reduce(
    (acc, cur) => (acc > cur ? acc : cur),
    Number.NEGATIVE_INFINITY
  );

  return { minX, maxX, minY, maxY };
}

function initGameBoard({
  minX,
  maxX,
  minY,
  maxY,
}: GameCoodRange): BoardElem[][] {
  const startBoard: BoardElem[][] = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!startBoard[y]) {
        startBoard[y] = [];
      }
      if (x === SOURCE_COORD.x && y === SOURCE_COORD.y) {
        startBoard[y].push(BoardElem.SOURCE);
      } else {
        startBoard[y].push(BoardElem.AIR);
      }
    }
  }
  return startBoard;
}

function boardToStr(board: BoardElem[][]): string {
  return board.map((r) => r.join("")).join("\n");
}

async function main() {
  const paths = parse(await Deno.readTextFile("./day14/input.txt"));
  const start = initGameBoard(getStartCoord(paths));
  console.log(boardToStr(start));
}

main();
