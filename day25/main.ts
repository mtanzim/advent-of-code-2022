function parse(input: string) {
  return input.split("\n");
}

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
  console.log(multipliers);
  const decipheredDigits = digits.map(decipherWeirdAssSnafuDigits);
  const values = decipheredDigits.map((v, i) => v * multipliers[i]);
  return values.reduce((acc, cur) => acc + cur, 0);
}

function decimalToSnafu(n: number): number {
  const findMultipliers = (cur: number, lst: number[]): number[] => {
    if (n / cur < 1) {
      return lst;
    }
    return findMultipliers(cur * 5, lst.concat(cur));
  };

  const convertTo5base = (
    v: number,
    lst: number[],
    mlts: number[]
  ): number[] => {
    if (v === 0) {
      return lst;
    }
    const [mltHead, ...newMlt] = mlts;
    const newV = Math.floor(v / mltHead);
    const newMod = v % mltHead;
    return convertTo5base(newMod, lst.concat(newV), newMlt);
  };

  const convertToSnafuDigits = (ns: number[]): string => {
    const allClean = ns.every((n) => n >= -2 && n <= 2);
    if (allClean) {
      return ns;
    }
    const lastBadDigitIdx = ns.findLastIndex((n) => n === 3 || n === 4);
    const lastBadDigitIdxPrev = lastBadDigitIdx - 1;
    const lastBadDigit = ns.findLast((n) => n === 3 || n === 4);
    const newNS = ns.slice();
    newNS[lastBadDigitIdx] = lastBadDigit === 4 ? -1 : -2;
    if (lastBadDigitIdxPrev < 0) {
      newNS.unshift(1);
    } else {
      newNS[lastBadDigitIdxPrev]++;
    }
    return convertToSnafuDigits(newNS);
  };

  const convertToSnafuChar = (n: number): string => {
    if (n >= 0 && n <= 2) {
      return String(n);
    } else if (n === -2) {
      return "=";
    } else if (n === -1) {
      return "-";
    } else {
      throw new Error("unclean snafu digits!");
    }
  };

  const multipliers = findMultipliers(1, []).toReversed();
  const base5Dec = convertTo5base(n, [], multipliers);
  const base5WithCorrectDigits = convertToSnafuDigits(base5Dec);
  const snafuChars = base5WithCorrectDigits.map(convertToSnafuChar).join("");
  if (n !== snafuToDecimal(snafuChars)) {
    throw new Error("error converting to snafu");
  }
  return snafuChars;
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
