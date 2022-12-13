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

// is in order?
function checkPair(left: Entry, right: Entry): boolean {
  if (!isArray(left) && !isArray(right)) {
    return left < right;
  }
  if (isArray(left) && isArray(right)) {
    if ((left as Array<number>).length === 0) {
      return true;
    }
    if ((right as Array<number>).length === 0) {
      return false;
    }
    const [headLeft, ...tailLeft] = left as Array<number>;
    const [headRight, ...tailRight] = right as Array<number>;
    return checkPair(headLeft, headRight) && checkPair(tailLeft, tailRight);
  }
  return false;
}
async function main() {
  const pairs = parse(await Deno.readTextFile("./day13/input.txt"));
  console.log(pairs);
}

main();
