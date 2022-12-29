type Monkey = {
  // id is also order
  id: number;
  items: number[];
  op: (old: number) => number;
  test: (v: number) => boolean;
  throwIfTrue: Monkey["id"];
  throwIfFalse: Monkey["id"];
  inspections: number;
  divisor: number;
};

function parse(text: string): Monkey[] {
  const monkeyClumps = text.split("\n\n");

  return monkeyClumps.map((clump) => {
    const [idLine, itemsLine, opLine, testLine, trueLine, falseLine] = clump
      .split("\n");
    const id = Number(idLine.split(" ")[1].split(":")[0]);

    const items = itemsLine.split(":")[1].split(",").map(Number);

    const getTrueFalseMonkey = (line: string): number =>
      Number(line.split("monkey")[1]);
    const throwIfTrue = getTrueFalseMonkey(trueLine);
    const throwIfFalse = getTrueFalseMonkey(falseLine);

    const op: (n: number) => number = (() => {
      const opStr = opLine.split("new =")[1].replace("old", "").split(" ")
        .filter((c) => c !== "");

      const [op, v] = opStr;

      if (v !== "old" && isNaN(Number(v))) {
        throw new Error("invalid value supplied");
      }
      switch (op) {
        case "+":
          return v !== "old"
            ? (old: number) => old + Number(v)
            : (old: number) => old + old;
        case "*":
          return v !== "old"
            ? (old: number) => old * Number(v)
            : (old: number) => old * old;
        default:
          throw new Error("invalid operation identified!");
      }
    })();

    const divisor = Number(testLine.split("by")[1]);
    const test: (n: number) => boolean = (() => {
      if (isNaN(divisor)) {
        throw new Error("failed to parse test divisor");
      }
      return (n: number) => n % divisor === Number(0);
    })();

    return {
      id,
      items,
      op,
      test,
      throwIfTrue,
      throwIfFalse,
      inspections: 0,
      divisor,
    };
  });
}

function getMonkeyStatus(monkeys: Monkey[]): string {
  const itemStatus = monkeys.map((m) => `Monkey ${m.id}: ${m.items.join(", ")}`)
    .join("\n");
  const countStatus = monkeys.map((m) =>
    `Monkey ${m.id} inspected items ${m.inspections} times`
  ).join("\n");

  return itemStatus + "\n\n" + countStatus + "\n";
}

/**
mutates!
 */
type NextWorryCalc = (worry: number) => number;
function runRound(monkeys: Monkey[], nextWorryFn: NextWorryCalc): void {
  for (const m of monkeys) {
    for (let i = 0; i < m.items.length; i++) {
      const worryLevel = m.items[i];
      const nextWorryLevel = nextWorryFn(m.op(worryLevel));
      m.items[i] = nextWorryLevel;
      m.inspections++;
      const throwToMonkey = m.test(nextWorryLevel)
        ? m.throwIfTrue
        : m.throwIfFalse;
      monkeys[throwToMonkey].items.push(nextWorryLevel);
    }
    m.items = [];
  }
}

(async function main() {
  const text = await Deno.readTextFile("./day11/input.txt");

  [
    { worryDivider: 3, numRounds: 20 },
    { numRounds: 10000 },
  ]
    .forEach(
      ({ worryDivider, numRounds }) => {
        const monkeys: Monkey[] = parse(text);

        const commonDivider: number = monkeys.reduce(
          (acc, m) => m.divisor * acc,
          1,
        );

        const nextWorryFn = worryDivider
          ? (n: number) => Math.floor(n / worryDivider)
          : (n: number) => n % commonDivider;

        [...Array(numRounds)].forEach(() => {
          runRound(monkeys, nextWorryFn);
        });
        const [max, secondMax] = monkeys.sort((a, b) =>
          b.inspections - a.inspections
        ).slice(0, 2).map((m) => m.inspections);
        console.log(getMonkeyStatus(monkeys));
        console.log({ max, secondMax });
        console.log(max * secondMax);
        console.log();
      },
    );
})();
