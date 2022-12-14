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

type SinglePath = Coord[];
type GameBoard = BoardElem[][];

const SOURCE_COORD: Coord = { x: 500, y: 0 };

function parse(input: string): SinglePath[] {
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

function getStartCoord(paths: SinglePath[]): GameCoodRange {
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

function initGameBoard({ minX, maxX, minY, maxY }: GameCoodRange): GameBoard {
  const startBoard: GameBoard = [];
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

function updateWithSandPath(
  path: SinglePath,
  board: GameBoard,
  gameCoordRange: GameCoodRange
): GameBoard {
  const coordPairs: Array<[Coord, Coord]> = [];
  for (let i = 1; i < path.length; i++) {
    coordPairs.push([path[i - 1], path[i]]);
  }
  const boardClone: GameBoard = JSON.parse(JSON.stringify(board));

  // yikes, mutations, beware
  const updateWithCoordPair = (from: Coord, to: Coord) => {
    const { x: fx, y: fy } = from;
    const { x: tx, y: ty } = to;
    // vertical line
    if (fx === tx) {
      const yFrom = Math.min(fy, ty);
      const yTo = Math.max(fy, ty);
      for (let y = yFrom; y <= yTo; y++) {
        const curY = y - gameCoordRange.minY;
        const curX = fx - gameCoordRange.minX;
        boardClone[curY][curX] = BoardElem.ROCK;
      }
      return;
    }
    // horizontal line
    if (fy === ty) {
      const xFrom = Math.min(fx, tx);
      const xTo = Math.max(fx, tx);
      for (let x = xFrom; x <= xTo; x++) {
        const curY = fy - gameCoordRange.minY;
        const curX = x - gameCoordRange.minX;
        boardClone[curY][curX] = BoardElem.ROCK;
      }
      return;
    }
  };

  coordPairs.forEach(([from, to]) => updateWithCoordPair(from, to));
  return boardClone;
}

function boardToStr(board: BoardElem[][]): string {
  return board.map((r) => r.join("")).join("\n");
}

async function main() {
  const paths = parse(await Deno.readTextFile("./day14/input.txt"));
  const gameCoordRange = getStartCoord(paths);
  const start = initGameBoard(gameCoordRange);
  console.log(boardToStr(start));
  console.log(gameCoordRange);

  const boardWithRocks = paths.reduce(
    (acc, cur) => updateWithSandPath(cur, acc, gameCoordRange),
    start
  );

  console.log(boardToStr(boardWithRocks));
}

main();
