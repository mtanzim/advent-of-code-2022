type Move = {
  from: number;
  to: number;
};

type Stack = string[];
type CrateMap = Map<number, Stack>;

function parseMoves(input: string): Move[] {
  const [_, movesInput] = input.split("\n\n");
  const moveLines = movesInput.split("\n");
  return moveLines
    .map((line) =>
      line
        .split(" ")
        .filter((token) => Number.isInteger(Number(token)))
        .map(Number)
    )
    .reduce((acc, cur) => {
      const newMoves = [...Array(cur[0])].map((_) => ({
        from: cur[1],
        to: cur[2],
      }));
      return acc.concat(newMoves);
    }, [] as Move[]);
}

function parseStacks(input: string): CrateMap {
  const [stackInput] = input.split("\n\n");
  const stackLines = stackInput.split("\n");
  const numStacks = stackLines
    .at(-1)
    ?.split(" ")
    .filter((t) => t !== "")
    .map(Number)
    .filter((t) => Number.isInteger(t))
    .at(-1);

  if (!numStacks) {
    throw new Error("error parsing stacks");
  }
  const stacks: Stack[] = [...Array(numStacks)].map((_) => []);
  const startIdx = 1;
  const gap = 4;
  stackLines.slice(0, -1).forEach((line) => {
    const tokens = line.split("");
    let j = 0;
    for (let i = startIdx; i < numStacks * gap + 1; i += gap) {
      const container = tokens[i];
      if (/[A-Z]/.test(container)) {
        stacks[j].push(container);
      }
      j++;
    }
  });

  return new Map(stacks.map((s, idx) => [idx + 1, s]));
}

function parse(input: string): { moves: Move[]; crates: CrateMap } {
  return { moves: parseMoves(input), crates: parseStacks(input) };
}

async function main() {
  const { crates, moves } = parse(await Deno.readTextFile("./day5/input.txt"));
  console.log({ crates, moves });
}

main();
