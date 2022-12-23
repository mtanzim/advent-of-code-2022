type Move = {
  from: number;
  to: number;
};

type Stack = string[];

function parse(input: string): { moves: Move[]; crates: Stack[] } {
  const [cratesInput, movesInput] = input.split("\n\n");
  const moveLines = movesInput.split("\n");
  const moves = moveLines
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

  console.log(input);
}

async function main() {
  const { crates, moves } = parse(await Deno.readTextFile("./day5/input.txt"));
}

main();
