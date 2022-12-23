type Move = {
  from: number;
  to: number;
};

type MoveB = {
  from: number;
  to: number;
  amount: number;
};
type Stack = string[];
type CrateMap = Map<number, Stack>;

function parseMoves(input: string): {
  partAMoves: Move[];
  partBMoves: MoveB[];
} {
  const [_, movesInput] = input.split("\n\n");
  const moveLines = movesInput.split("\n");
  const unprocessedMoves = moveLines.map((line) =>
    line
      .split(" ")
      .filter((token) => Number.isInteger(Number(token)))
      .map(Number)
  );

  return {
    partAMoves: unprocessedMoves.reduce((acc, [amount, from, to]) => {
      const newMoves = [...Array(amount)].map((_) => ({
        from,
        to,
      }));
      return acc.concat(newMoves);
    }, [] as Move[]),
    partBMoves: unprocessedMoves.map(([amount, from, to]) => ({
      amount,
      from,
      to,
    })),
  };
}

function parseStacks(input: string): { crates: CrateMap; numStacks: number } {
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

  return {
    crates: new Map(stacks.map((s, idx) => [idx + 1, s.toReversed()])),
    numStacks,
  };
}

function parse(input: string) {
  return { ...parseMoves(input), ...parseStacks(input) };
}

function deepCopyCrates(crates: CrateMap): CrateMap {
  const arr = [...crates.entries()];
  return new Map(arr.map(([k, v]) => [k, v.slice()]));
}

function runMoves({
  crates,
  moves,
}: {
  moves: Move[];
  crates: CrateMap;
}): CrateMap {
  const runningCrateMap = deepCopyCrates(crates);
  moves.forEach(({ from, to }) => {
    const movingCrate = runningCrateMap.get(from)?.pop();
    if (!movingCrate) {
      throw new Error("unable to get crate");
    }
    runningCrateMap.get(to)?.push(movingCrate);
  });
  return deepCopyCrates(runningCrateMap);
}

function runMovesB({
  crates,
  moves,
}: {
  moves: MoveB[];
  crates: CrateMap;
}): CrateMap {
  const runningCrateMap = deepCopyCrates(crates);
  moves.forEach(({ from, to, amount }) => {
    const curLen = runningCrateMap.get(from)?.length;
    if (curLen === undefined) {
      throw new Error("unable to run move");
    }
    const movingCrates = runningCrateMap
      .get(from)
      ?.splice(curLen - amount, amount);
    runningCrateMap.get(to)?.push(...(movingCrates || []));
  });
  return deepCopyCrates(runningCrateMap);
}

function getResult(crates: CrateMap, numStacks: number) {
  return [...Array(numStacks)]
    .map((_, idx) => idx + 1)
    .map((i) => crates.get(i)?.at(-1))
    .join("");
}

async function main() {
  const { crates, partAMoves, partBMoves, numStacks } = parse(
    await Deno.readTextFile("./day5/input.txt")
  );
  const finalCrates = runMoves({ crates, moves: partAMoves });
  const finalCratesB = runMovesB({ crates, moves: partBMoves });
  console.log(finalCrates);
  console.log(getResult(finalCrates, numStacks));
  console.log();
  console.log(finalCratesB);
  console.log(getResult(finalCratesB, numStacks));
}

main();
