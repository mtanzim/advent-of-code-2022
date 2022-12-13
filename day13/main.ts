type Pair = Array<number> | number;
type Pairs = [Pair, Pair];

function parse(input: string): Array<Pairs> {
  return input
    .split("\n\n")
    .map((pair) => pair.split("\n").map((c) => JSON.parse(c))) as Array<Pairs>;
}

async function main() {
  const pairs = parse(await Deno.readTextFile("./day13/input.txt"));
  console.log(pairs);
}

main();
