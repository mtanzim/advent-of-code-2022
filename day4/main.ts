type ParsedInput = {
  min: number;
  max: number;
};
type ParsedPair = [ParsedInput, ParsedInput];

function parse(text: string): Array<ParsedPair> {
  const input = text.split("\n");
  return input.map((ip) => {
    const pairs = ip.split(",");
    if (pairs.length !== 2) {
      console.error(pairs);
      throw new Error("invalid input found");
    }
    return pairs.map((p) => {
      const [min, max] = p.split("-");
      return { min: Number(min), max: Number(max) };
    });
  }) as Array<ParsedPair>;
}

function fullyOverlap(pairs: ParsedPair[]): number {
  return pairs.reduce((acc, cur) => {
    const [a, b] = cur;
    if (a.min <= b.min && a.max >= b.max) {
      return acc + 1;
    }
    if (b.min <= a.min && b.max >= a.max) {
      return acc + 1;
    }
    return acc;
  }, 0);
}

function anyOverlap(pairs: ParsedPair[]): number {
  const notOverlapping = pairs.reduce((acc, cur) => {
    const [a, b] = cur;
    if (b.min > a.max) {
      return acc + 1;
    }
    if (a.min > b.max) {
      return acc + 1;
    }
    return acc;
  }, 0);
  return pairs.length - notOverlapping;
}

(async function main() {
  const text = await Deno.readTextFile("./day4/input.txt");
  const fullOverlaps = fullyOverlap(parse(text));
  const anyOverlaps = anyOverlap(parse(text));
  console.log({ fullOverlaps, anyOverlaps });
})();
