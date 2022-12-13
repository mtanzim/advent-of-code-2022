type Entry = Array<number> | number | Array<Entry>;
type Pair = [Entry, Entry];

function parse(input: string): Array<Pair> {
  return input
    .split("\n\n")
    .map((pair) => pair.split("\n").map((c) => JSON.parse(c))) as Array<Pair>;
}

function isArray(v: unknown): boolean {
  return Array.isArray(v);
}

interface Result {
  // is in order?
  result: boolean;
  shouldContinue: boolean;
}

function checkPair(left: Entry, right: Entry): Result {
  if (!isArray(left) && !isArray(right)) {
    if (left === right) {
      return { result: false, shouldContinue: true };
    }
    return { result: left < right, shouldContinue: false };
  }
  if (isArray(left) && isArray(right)) {
    if (
      (left as Array<number>).length === 0 &&
      (right as Array<number>).length === 0
    ) {
      return { result: false, shouldContinue: true };
    }
    if ((left as Array<number>).length === 0) {
      return { result: true, shouldContinue: false };
    }
    if ((right as Array<number>).length === 0) {
      return { result: false, shouldContinue: false };
    }
    const [headLeft, ...tailLeft] = left as Array<number>;
    const [headRight, ...tailRight] = right as Array<number>;
    const { shouldContinue, result } = checkPair(headLeft, headRight);
    if (shouldContinue) {
      return checkPair(tailLeft, tailRight);
    }
    return { result, shouldContinue: false };
  }
  if (!isArray(left) && isArray(right)) {
    return checkPair([left as number], right);
  }
  if (isArray(left) && !isArray(right)) {
    return checkPair(left, [right as number]);
  }
  console.log({ left, right });
  throw new Error("missed a branch!");
}
async function main() {
  const pairs = parse(await Deno.readTextFile("./day13/input.txt"));
  const orderedIdxSum = pairs
    .reduce(
      (acc, p, i) => (checkPair(p[0], p[1]).result ? acc.concat(i + 1) : acc),
      [] as number[]
    )
    .reduce((acc, cur) => acc + cur, 0);
  console.log(orderedIdxSum);

  // part b
  const decoder1: Entry = [[2]];
  const decoder2: Entry = [[6]];
  const decoderKey = pairs
    .flat()
    .concat([decoder1, decoder2])
    .toSorted((a, b) => (checkPair(a, b).result ? -1 : 1))
    .reduce((acc: number[], packet, idx) => {
      if (
        JSON.stringify(packet) === JSON.stringify(decoder1) ||
        JSON.stringify(packet) === JSON.stringify(decoder2)
      ) {
        return acc.concat(idx + 1);
      }
      return acc;
    }, [] as number[])
    .reduce((acc, cur) => acc * cur, 1);
  console.log(decoderKey);
}

main();
