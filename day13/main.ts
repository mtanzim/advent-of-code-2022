type Entry = Array<number> | number;
type Pair = [Entry, Entry];

function parse(input: string): Array<Pair> {
  return input
    .split("\n\n")
    .map((pair) => pair.split("\n").map((c) => JSON.parse(c))) as Array<Pair>;
}

function isArray(v: any): boolean {
  return Array.isArray(v);
}

interface Result {
  result: boolean;
  shouldContinue: boolean;
}

// is in order?
function checkPair(left: Entry, right: Entry): Result {
  console.log({ left, right });

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
  console.log(pairs);
  const isOrdered = pairs
    // .slice(1, 2)
    .reduce(
      (acc, p, i) => (checkPair(p[0], p[1]).result ? acc.concat(i + 1) : acc),
      [] as number[]
    ).reduce((acc, cur) => acc + cur, 0)
  console.log(isOrdered);
}

main();
