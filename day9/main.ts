type Direction = "L" | "R" | "U" | "D";
type Move = [Direction, number];

function parse(input: string): Array<Move> {
  const lines = input.split("\n");
  return lines.map((l) => l.split(" ").filter((_, idx) => idx < 2)).map((
    [dir, steps],
  ) => [dir as Direction, Number(steps)]) as Array<
    Move
  >;
}

function flattenDir(moves: Move[]): Direction[] {
  return moves.flatMap(([dir, steps]) => [...Array(steps)].map((_) => dir));
}

type Coord = {
  x: number;
  y: number;
};

type Position = {
  head: Coord;
  tail: Coord;
};

type Tracker = Set<string>;

function coordToString({ x, y }: Coord): string {
  return `${x}|${y}`;
}

interface Accum {
  currentPos: Position;
  tracker: Tracker;
}

function getMove(v: number) {
  switch (true) {
    case v === 0:
      return 0;
    case v > 0:
      return 1;
    case v < 0:
      return -1;
    default:
      throw new Error("invalid input to getMove");
  }
}

function nextHead(head: Coord, dir: Direction): Coord {
  const { x, y } = head;
  switch (dir) {
    case "D":
      return { x, y: y - 1 };
    case "U":
      return { x, y: y + 1 };
    case "L":
      return { x: x - 1, y };
    case "R":
      return { x: x + 1, y };
    default:
      throw new Error("invalid direction");
  }
}

function nextTail(head: Coord, tail: Coord) {
  const { x: hx, y: hy } = head;
  const { x: tx, y: ty } = tail;
  const dx = hx - tx;
  const dy = hy - ty;

  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
    return { x: tx + getMove(dx), y: ty + getMove(dy) };
  }
  return tail;
}

function traverse(
  acc: Accum,
  dir: Direction,
) {
  const { head, tail } = acc.currentPos;
  const nextHeadPos = nextHead(head, dir);
  const nextTailPos = nextTail(nextHeadPos, tail);
  acc.tracker.add(coordToString(nextTailPos));

  return {
    currentPos: { head: nextHeadPos, tail: nextTailPos },
    tracker: acc.tracker,
  };
}

(async function main() {
  const text = await Deno.readTextFile("./day9/input.txt");
  const moves = flattenDir(parse(text));
  const startingPos: Coord = { x: 0, y: 0 };
  const tracker = moves.reduce(traverse, {
    currentPos: {
      head: startingPos,
      tail: startingPos,
    },
    tracker: new Set<string>([coordToString(startingPos)]),
  });
  console.log(tracker.tracker.size);
  // console.log(tracker.size);
})();
