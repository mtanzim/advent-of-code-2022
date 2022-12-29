type Monkey = {
  // id is also order
  id: number;
  items: number[];
  op: (old: number) => number;
  test: (v: number) => boolean;
  throwIfTrue: Monkey["id"];
  throwIfFalse: Monkey["id"];
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

    const test: (n: number) => boolean = (() => {
      const divisor = Number(testLine.split("by")[1]);
      if (isNaN(divisor)) {
        throw new Error("failed to parse test divisor");
      }
      return (n: number) => n % divisor === 0;
    })();

    return {
      id,
      items,
      op,
      test,
      throwIfTrue,
      throwIfFalse,
    };
  });
}

function getMonkeyStatus(monkeys: Monkey[]): string {
  return monkeys.map((m) => `Monkey ${m.id}: ${m.items.join(", ")}`).join("\n");
}

/**
mutates!
 */
function runRound(monkeys: Monkey[]): void {
  for (const m of monkeys) {
    const updatedItems = m.items.map((worryLevel) =>
      Math.floor(m.op(worryLevel) / 3)
    );
    updatedItems.forEach((worryLevel) => {
      const throwToMonkey = m.test(worryLevel) ? m.throwIfTrue : m.throwIfFalse;
      monkeys[throwToMonkey].items.push(worryLevel);
    });
    m.items = [];
  }
}

(async function main() {
  const text = await Deno.readTextFile("./day11/input.txt");
  const monkeys: Monkey[] = parse(text);
  // console.log(getMonkeyStatus(monkeys));

  [...Array(20)].forEach((_) => runRound(monkeys));
  console.log(getMonkeyStatus(monkeys));
})();
