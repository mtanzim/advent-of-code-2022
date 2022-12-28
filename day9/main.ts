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

(async function main() {
  const text = await Deno.readTextFile("./day9/input.txt");
  const moves = flattenDir(parse(text));
  console.log(moves);
})();
