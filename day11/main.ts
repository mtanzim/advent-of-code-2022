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
  const monkeys = monkeyClumps.map((clump) => {
    const [idLine, itemsLine, opLine, testLine, trueLine, falseLine] = clump
      .split("\n");
    const id = Number(idLine.split(" ")[1].split(":")[0]);
    const items = itemsLine.split(":")[1].split(",").map(Number);

    const getTrueFalseMonkey = (line: string): number =>
      Number(line.split("monkey")[1]);
    const ifTrue = getTrueFalseMonkey(trueLine);
    const ifFalse = getTrueFalseMonkey(falseLine);

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

    console.log(id);
  });
  console.log(monkeyClumps);
}

(async function main() {
  const text = await Deno.readTextFile("./day11/input.txt");
  parse(text);
})();
