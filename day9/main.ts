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

function traverse(
  directions: Direction[],
  currentPos: Position,
  tracker: Tracker,
): Tracker {
  if (directions.length === 0) {
    return tracker;
  }
  const { head, tail } = currentPos;
  const [dir, ...rest] = directions;

  const newTracker = new Set(tracker);
  if (!newTracker.has(coordToString(tail))) {
    // console.log(`tail going to ${coordToString(tail)}`);
    newTracker.add(coordToString(tail));
  }

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
    // touching cases: do not move tail
    if (Math.abs(hx - tx) <= 1 && Math.abs(hy - ty) <= 1) {
      return tail;
    }
    // same column: move vertically
    if (hx === tx && hy - ty === 2) {
      return { x: tx, y: ty + 1 };
    }
    if (hx === tx && hy - ty === -2) {
      return { x: tx, y: ty - 1 };
    }
    // same row: move horizontally
    if (hy === ty && hx - tx === 2) {
      return { x: tx + 1, y: ty };
    }
    if (hy === ty && hx - tx === -2) {
      return { x: tx - 1, y: ty };
    }

    // diagonal movements
    if (hy - ty === 2 && hx - tx === 1) {
      return { x: tx + 1, y: ty + 1 };
    }

    if (hy - ty === 1 && hx - tx === 2) {
      return { x: tx + 1, y: ty + 1 };
    }

    if (hy - ty === 2 && hx - tx === -1) {
      return { x: tx - 1, y: ty + 1 };
    }

    if (hy - ty === 1 && hx - tx === -2) {
      return { x: tx - 1, y: ty + 1 };
    }

    if (hy - ty === 1 && hx - tx === 2) {
      return { x: tx + 1, y: ty + 1 };
    }

    if (hy - ty === -2 && hx - tx === 1) {
      return { x: tx + 1, y: ty - 1 };
    }

    if (hy - ty === -1 && hx - tx === 2) {
      return { x: tx + 1, y: ty - 1 };
    }

    if (hy - ty === -1 && hx - tx === -2) {
      return { x: tx - 1, y: ty - 1 };
    }

    if (hy - ty === 1 && hx - tx === 2) {
      return { x: tx + 1, y: ty + 1 };
    }

    if (hy - ty === -2 && hx - tx === -1) {
      return { x: tx - 1, y: ty - 1 };
    }

    console.error(currentPos);
    throw new Error("missed a branch");
  })();

  console.log(dir);
  console.log(`head at ${coordToString(head)}`);
  console.log(`tail going to ${coordToString(nextTail)}`);
  console.log();

  return traverse(rest, { head: nextHead, tail: nextTail }, newTracker);
}

(async function main() {
  const text = await Deno.readTextFile("./day9/input.txt");
  const moves = flattenDir(parse(text));
  const startingPos: Coord = { x: 0, y: 0 };
  const tracker = traverse(
    moves,
    { head: startingPos, tail: startingPos },
    new Set(),
  );
  console.log(tracker);
  console.log(tracker.size);
})();
