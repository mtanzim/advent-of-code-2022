// TODO: this doesn't work yet
// range conditions are incorrect

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

(async function main() {
  const text = await Deno.readTextFile("./day4/input.txt");
  const parsedInputs = parse(text);
  const result = parsedInputs.reduce((acc, cur) => {
    const [a, b] = cur;
    if (a.min <= b.min && a.max >= b.max) {
      console.log("a contains b");
      console.log({ a, b });
      return acc + 1;
    }
    if (b.min <= a.min && b.max >= a.max) {
      console.log("b contains a");
      console.log({ a, b });
      return acc + 1;
    }
    return acc;
  }, 0);
  console.log(result);
})();
