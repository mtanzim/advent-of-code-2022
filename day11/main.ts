type Monkey = {
  // id is also order
  id: number;
  items: bigint[];
  op: (old: bigint) => bigint;
  test: (v: bigint) => boolean;
  throwIfTrue: Monkey["id"];
  throwIfFalse: Monkey["id"];
  inspections: bigint;
};

function parse(text: string): Monkey[] {
  const monkeyClumps = text.split("\n\n");

  return monkeyClumps.map((clump) => {
    const [idLine, itemsLine, opLine, testLine, trueLine, falseLine] = clump
      .split("\n");
    const id = Number(idLine.split(" ")[1].split(":")[0]);

    const items = itemsLine.split(":")[1].split(",").map(BigInt);

    const getTrueFalseMonkey = (line: string): number =>
      Number(line.split("monkey")[1]);
    const throwIfTrue = getTrueFalseMonkey(trueLine);
    const throwIfFalse = getTrueFalseMonkey(falseLine);

    const op: (n: bigint) => bigint = (() => {
      const opStr = opLine.split("new =")[1].replace("old", "").split(" ")
        .filter((c) => c !== "");

      const [op, v] = opStr;

      // if (v !== "old" && isNaN(BigInt(v))) {
      //   throw new Error("invalid value supplied");
      // }
      switch (op) {
        case "+":
          return v !== "old"
            ? (old: bigint) => old + BigInt(v)
            : (old: bigint) => old + old;
        case "*":
          return v !== "old"
            ? (old: bigint) => old * BigInt(v)
            : (old: bigint) => old * old;
        default:
          throw new Error("invalid operation identified!");
      }
    })();

    const test: (n: bigint) => boolean = (() => {
      const divisor = BigInt(testLine.split("by")[1]);
      // if (isNaN(divisor)) {
      //   throw new Error("failed to parse test divisor");
      // }
      return (n: bigint) => n % divisor === BigInt(0);
    })();

    return {
      id,
      items,
      op,
      test,
      throwIfTrue,
      throwIfFalse,
      inspections: BigInt(0),
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
function runRound(monkeys: Monkey[], worryDivider: bigint): void {
  for (const m of monkeys) {
    // const updatedItems: bigint[] = m.items.map((worryLevel) =>
    //   m.op(worryLevel) / worryDivider
    // );
    for (let i = 0; i < m.items.length; i++) {
      const worryLevel = m.items[i];
      m.items[i] = m.op(worryLevel) / worryDivider;


      const newWorryLevel = m.items[i];
      // m.items.forEach((newWorryLevel) => {
      m.inspections++;
      const throwToMonkey = m.test(newWorryLevel) ? m.throwIfTrue : m.throwIfFalse;
      monkeys[throwToMonkey].items.push(newWorryLevel);
      // m.inspections++;
      // const throwToMonkey = m.test(worryLevel) ? m.throwIfTrue : m.throwIfFalse;
      // monkeys[throwToMonkey].items.push(worryLevel);
    }
    // for (let i = 0; i < m.items.length; i++) {
    //   const worryLevel = m.items[i];
    //   // m.items.forEach((worryLevel) => {
    //   m.inspections++;
    //   const throwToMonkey = m.test(worryLevel) ? m.throwIfTrue : m.throwIfFalse;
    //   monkeys[throwToMonkey].items.push(worryLevel);
    //   // });
    // }
    m.items = [];
  }
}

(async function main() {
  const text = await Deno.readTextFile("./day11/input.txt");

  [
    { worryDivider: BigInt(3), numRounds: 20 },
    // { worryDivider: BigInt(1), numRounds: 10000 },
  ]
    .forEach(
      ({ worryDivider, numRounds }) => {
        const monkeys: Monkey[] = parse(text);
        [...Array(numRounds)].forEach((_, idx) => {
          console.log(`Round: ${idx + 1}`);
          runRound(monkeys, worryDivider);
        });
        console.log(getMonkeyStatus(monkeys));
        const result = monkeys.map((m) => m.inspections).sort((a, b) =>
          (a > b) ? -1 : ((a > b) ? 1 : 0)
        )
          .slice(0, 2)
          .reduce((acc, cur) => acc * cur, BigInt(1));
        console.log(result);
      },
    );
})();
