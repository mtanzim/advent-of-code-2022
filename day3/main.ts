async function parse2(): Promise<string[]> {
  const text = await Deno.readTextFile("./day3/input.txt");
  return text.split("\n");
}
async function parse(): Promise<string[][]> {
  return (await parse2()).map((t) => {
    const len = t.length;
    const mid = len / 2;
    const left = t.slice(0, mid);
    const right = t.slice(mid, len);
    return [left, right];
  });
}

function converAsciiToPrio(val: number): number {
  if (val >= 65 && val <= 90) {
    return val - 65 + 27;
  }
  if (val >= 97 && val <= 122) {
    return val - 97 + 1;
  }

  throw new Error("invalid case");
}

async function part1() {
  const input = await parse();
  console.log(input);
  const commonPairs = input.map(([left, right]) => {
    const leftSet = new Set(left.split(""));
    const commonChar = right.split("").filter((c) => leftSet.has(c));
    return commonChar[0];
  });

  const charCodes = commonPairs.map((s) => s.charCodeAt(0));

  const prios = charCodes.map(converAsciiToPrio);
  const sum = prios.reduce((acc, cur) => acc + cur, 0);

  console.log(commonPairs);
  console.log(charCodes);
  console.log(prios);
  console.log(sum);
}

interface Accum {
  ongoing: string[];
  chunks: string[][];
}

async function part2() {
  const input = await parse2();
  const chunked = input.reduce(
    (acc: Accum, cur, i) => {
      const ongoing = acc.ongoing.concat(cur);
      if ((i + 1) % 3 === 0) {
        return {
          chunks: acc.chunks.concat([ongoing]),
          ongoing: [],
        };
      }
      return { chunks: acc.chunks, ongoing };
    },
    { chunks: [], ongoing: [] },
  ).chunks;

  const commonChar = chunked.map(([a, b, c]) => {
    const aSet = new Set(a.split(""));
    const bSet = new Set(b.split(""));
    const commonChar = c.split("").filter((v) => aSet.has(v) && bSet.has(v));
    return commonChar[0];
  });

  const charCodes = commonChar.map((s) => s.charCodeAt(0));
  const prios = charCodes.map(converAsciiToPrio);
  const sum = prios.reduce((acc, cur) => acc + cur, 0);

  console.log(commonChar);
  console.log(prios);
  console.log(sum);
}

part2();
