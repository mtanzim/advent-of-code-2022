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

function traverse(
  acc: Accum,
  dir: Direction,
) {
  const { head, tail } = acc.currentPos;

  acc.tracker.add(coordToString(tail));

  const nextHead: Coord = (() => {
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
  })();

  const nextTail: Coord = (() => {
    const { x: hx, y: hy } = head;
    const { x: tx, y: ty } = tail;
    const dx = hx - tx;
    const dy = hy - ty;

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      const moveX = dx > 0 ? 1 : -1;
      const moveY = dy > 0 ? 1 : -1;
      return { x: tx + moveX, y: ty + moveY };
    }
    return tail;
  })();

  acc.tracker.add(coordToString(nextTail));

  return {
    currentPos: { head: nextHead, tail: nextTail },
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
    tracker: new Set<string>(),
  });
  console.log(tracker.tracker.size);
  // console.log(tracker.size);
})();
