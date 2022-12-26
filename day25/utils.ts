export function decimalToSnafu(n: number): string {
  const findMultipliers = (
    curNum: number,
    cur: number,
    lst: number[],
  ): number[] => {
    if (curNum / cur < 1) {
      return lst;
    }
    return findMultipliers(curNum, cur * 5, lst.concat(cur));
  };

  const convertTo5base = (
    v: number,
    lst: number[],
    mlts: number[],
  ): number[] => {
    if (mlts.length === 0) {
      return lst;
    }
    const [mltHead, ...newMlt] = mlts;
    const newV = Math.floor(v / mltHead);
    const newMod = v % mltHead;
    return convertTo5base(newMod, lst.concat(newV), newMlt);
  };

  const convertToSnafuDigits = (ns: number[]): number[] => {
    const lastBadDigitIdx = ns.findLastIndex((n) => n > 2);
    const lastBadDigit = ns.findLast((n) => n > 2);
    if (lastBadDigitIdx === -1 || lastBadDigit === undefined) {
      return ns;
    }
    const newNS = ns.slice();

    if (lastBadDigit === 4) {
      newNS[lastBadDigitIdx] = -1;
    } else if (lastBadDigit === 3) {
      newNS[lastBadDigitIdx] = -2;
    } else if (lastBadDigit > 4) {
      newNS[lastBadDigitIdx] = lastBadDigit % 5;
    }

    if (lastBadDigitIdx === 0) {
      newNS.unshift(1);
    } else {
      newNS[lastBadDigitIdx - 1]++;
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
      throw new Error(`unclean snafu digits!: ${n}`);
    }
  };

  const multipliers = findMultipliers(n, 1, []).toReversed();
  const base5Dec = convertTo5base(n, [], multipliers);
  const base5WithCorrectDigits = convertToSnafuDigits(base5Dec);

  const snafuChars = base5WithCorrectDigits.map(convertToSnafuChar).join("");

  if (n !== snafuToDecimal(snafuChars)) {
    throw new Error(
      `error converting to snafu, given: ${n}, got: ${
        snafuToDecimal(
          snafuChars,
        )
      }`,
    );
  }
  return snafuChars;
}

export function snafuToDecimal(snafu: string): number {
  const decipherWeirdAssSnafuDigits = (c: string): number => {
    switch (c) {
      case "=":
        return -2;
      case "-":
        return -1;
      default:
        return Number(c);
    }
  };

  const digits = snafu.split("");
  const multipliers = [...Array(digits.length)]
    .map((_, idx) => Math.pow(5, idx))
    .toReversed();
  const decipheredDigits = digits.map(decipherWeirdAssSnafuDigits);
  const values = decipheredDigits.map((v, i) => v * multipliers[i]);
  return values.reduce((acc, cur) => acc + cur, 0);
}
