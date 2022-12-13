function parse(input: string): any {
  return input.split("\n\n").map((pair) => pair.split("\n").map(JSON.parse));
}

async function main() {
  const pairs = parse(await Deno.readTextFile("./day13/input.txt"));
  console.log(pairs);
}

main();
