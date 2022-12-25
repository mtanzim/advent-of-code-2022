function parse(input: string) {
  return input.split("\n");
}

type MultiplierAcuum = {
  last: number;
  multipliers: number[];
};

function decipherWeirdAssSnafuDigits(c: string): number {
  switch (c) {
    case "=":
      return -2;
    case "-":
      return -1;
    default:
      return Number(c);
  }
}

function snafuToDecimal(snafu: string): number {
  const digits = snafu.split("");
  const multipliers = [...Array(digits.length)]
    .map((_, idx) => Math.pow(5, idx))
    .toReversed();
  const decipheredDigits = digits.map(decipherWeirdAssSnafuDigits);
  const values = decipheredDigits.map((v, i) => v * multipliers[i]);
  const value = values.reduce((acc, cur) => acc + cur, 0);
  console.log({ multipliers, digits, decipheredDigits, values, value });
}

async function main() {
  const lines = parse(await Deno.readTextFile("./day25/input.txt"));
  // console.log(lines);
  snafuToDecimal(lines[0]);
}

main();
