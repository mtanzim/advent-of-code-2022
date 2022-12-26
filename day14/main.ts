enum BoardElem {
  AIR = ".",
  ROCK = "#",
  SOURCE = "+",
  SAND = "O",
  LEAK = "~",
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
    Number.POSITIVE_INFINITY,
  );
  const maxX = flatX.reduce(
    (acc, cur) => (acc > cur ? acc : cur),
    Number.NEGATIVE_INFINITY,
  );
  const minY = flatY.reduce(
    (acc, cur) => (acc < cur ? acc : cur),
    Number.POSITIVE_INFINITY,
  );
  const maxY = flatY.reduce(
    (acc, cur) => (acc > cur ? acc : cur),
    Number.NEGATIVE_INFINITY,
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

const normalizer = (gameCoordRange: GameCoodRange) => (c: Coord): Coord => {
  return {
    x: c.x - gameCoordRange.minX,
    y: c.y - gameCoordRange.minY,
  };
};

function placeRocks(
  path: SinglePath,
  board: GameBoard,
  gameCoordRange: GameCoodRange,
): GameBoard {
  const coordPairs: Array<[Coord, Coord]> = [];
  for (let i = 1; i < path.length; i++) {
    coordPairs.push([path[i - 1], path[i]]);
  }
  const boardClone: GameBoard = JSON.parse(JSON.stringify(board));
  const normalizeCoord = normalizer(gameCoordRange);

  // yikes, mutations, beware
  const updateWithCoordPair = (from: Coord, to: Coord) => {
    const { x: fx, y: fy } = from;
    const { x: tx, y: ty } = to;
    // vertical line
    if (fx === tx) {
      const yFrom = Math.min(fy, ty);
      const yTo = Math.max(fy, ty);
      for (let y = yFrom; y <= yTo; y++) {
        const { x: curX, y: curY } = normalizeCoord({ x: fx, y });
        boardClone[curY][curX] = BoardElem.ROCK;
      }
      return;
    }
    // horizontal line
    if (fy === ty) {
      const xFrom = Math.min(fx, tx);
      const xTo = Math.max(fx, tx);
      for (let x = xFrom; x <= xTo; x++) {
        const { x: curX, y: curY } = normalizeCoord({ x, y: fy });
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

function traverseSand(
  board: GameBoard,
  curPos: Coord,
  source: Coord,
  hasFloor = true,
): { nextBoard: GameBoard; shouldContinue: boolean; newSource: Coord } {
  const bottom = { x: curPos.x, y: curPos.y + 1 };
  const bottomLeft = { x: curPos.x - 1, y: curPos.y + 1 };
  const bottomRight = { x: curPos.x + 1, y: curPos.y + 1 };

  // try possible paths in order
  if (board?.[bottom.y]?.[bottom.x] === BoardElem.AIR) {
    return traverseSand(board, bottom, source, hasFloor);
  }
  if (board?.[bottomLeft.y]?.[bottomLeft.x] === BoardElem.AIR) {
    return traverseSand(board, bottomLeft, source, hasFloor);
  }
  if (board?.[bottomRight.y]?.[bottomRight.x] === BoardElem.AIR) {
    return traverseSand(board, bottomRight, source, hasFloor);
  }
  // paths blocked, check if going into abyss
  const clonedBoard: GameBoard = JSON.parse(JSON.stringify(board));

  const intoAbyss = [bottom, bottomLeft, bottomRight].some(
    (c) => !board?.[c.y]?.[c.x],
  );

  // eww mutations
  if (hasFloor && intoAbyss) {
    clonedBoard[curPos.y][curPos.x] = BoardElem.SAND;
    clonedBoard.forEach((row) => row.unshift(BoardElem.AIR));
    clonedBoard.forEach((row) => row.push(BoardElem.AIR));
    clonedBoard[clonedBoard.length - 1][0] = BoardElem.ROCK;
    clonedBoard[clonedBoard.length - 1][clonedBoard[0].length - 1] =
      BoardElem.ROCK;
    return {
      nextBoard: clonedBoard,
      shouldContinue: true,
      newSource: { ...source, x: source.x + 1 },
    };
  }

  if (!hasFloor && intoAbyss) {
    clonedBoard[curPos.y][curPos.x] = BoardElem.LEAK;
    return {
      nextBoard: clonedBoard,
      shouldContinue: false,
      newSource: { ...source, x: source.x + 1 },
    };
  }

  clonedBoard[curPos.y][curPos.x] = BoardElem.SAND;
  return {
    shouldContinue: !(curPos.x === source.x && curPos.y === source.y),
    nextBoard: clonedBoard,
    newSource: source,
  };
}

async function main() {
  const paths = parse(await Deno.readTextFile("./day14/input.txt"));
  const gameCoordRange = getStartCoord(paths);
  const source = normalizer(gameCoordRange)(SOURCE_COORD);
  const start = initGameBoard(gameCoordRange);

  const boardWithRocks = paths.reduce(
    (acc, cur) => placeRocks(cur, acc, gameCoordRange),
    start,
  );
  (function partA() {
    let curBoard = boardWithRocks;
    let shouldContinue = true;
    let numSands = 0;
    let curSource = source;
    while (shouldContinue) {
      const res = traverseSand(curBoard, curSource, curSource, false);
      curBoard = res.nextBoard;
      shouldContinue = res.shouldContinue;
      curSource = res.newSource;
      if (shouldContinue) {
        numSands++;
      }
    }
    console.log(boardToStr(curBoard));
    console.log(numSands);
  })();

  const boardWithFloor = JSON.parse(JSON.stringify(boardWithRocks));
  (function partB() {
    boardWithFloor.push(
      [...Array(boardWithFloor[0].length).keys()].map((_) => BoardElem.AIR),
    );
    boardWithFloor.push(
      [...Array(boardWithFloor[0].length).keys()].map((_) => BoardElem.ROCK),
    );

    let curBoard = boardWithFloor;
    let shouldContinue = true;
    let numSands = 0;
    let curSource = source;
    while (shouldContinue) {
      console.log(`Simulating sand ${numSands}`);
      const res = traverseSand(curBoard, curSource, curSource);
      curBoard = res.nextBoard;
      shouldContinue = res.shouldContinue;
      curSource = res.newSource;
      numSands++;
    }
    console.log(boardToStr(curBoard));
    console.log(numSands);
  })();
}

main();
