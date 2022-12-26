import { decimalToSnafu, snafuToDecimal } from "./utils.ts";

function parse(input: string) {
  return input.split("\n");
}

async function main() {
  const lines = parse(await Deno.readTextFile("./day25/input.txt"));
  snafuToDecimal(lines[0]);
  const snafuValues = lines.map(snafuToDecimal);
  const sum = snafuValues.reduce((acc, cur) => acc + cur, 0);
  console.log(sum);
  console.log(decimalToSnafu(sum));
}

main();
