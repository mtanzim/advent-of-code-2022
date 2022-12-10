type Inst = "addx" | "noop";
type Val = number;

type Add = [Inst, number];
type NoOp = ["noop"];
type Row = Add | NoOp;

interface Accum {
  curIdx: number;
  curVal: number;
  signals: Signal[];
}

type Signal = {
  idx: number;
  val: number;
};

function parse(input: string): Array<Row> {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [inst, val] = line.split(" ");
    if (inst === "addx") {
      return [inst, Number(val)] as Add;
    }
    return [inst] as NoOp;
  });
}

function gatherSignals(rows: Array<Row>): Signal[] {
  return rows.reduce(
    (acc: Accum, row: Row) => {
      if (row[0] === "addx") {
        const [_, val] = row;
        return {
          curIdx: acc.curIdx + 2,
          curVal: acc.curVal + val,
          signals: acc.signals.concat([
            { idx: acc.curIdx + 1, val: acc.curVal },
            { idx: acc.curIdx + 2, val: acc.curVal + val },
          ]),
        };
      }

      return {
        curIdx: acc.curIdx + 1,
        curVal: acc.curVal,
        signals: acc.signals.concat([{ idx: acc.curIdx + 1, val: acc.curVal }]),
      };
    },
    // initializer
    {
      curIdx: 1,
      curVal: 1,
      signals: [
        {
          idx: 1,
          val: 1,
        },
      ],
    }
  ).signals;
}

async function main() {
  const input = await Deno.readTextFile("./day10/input.txt");
  const signals = gatherSignals(parse(input));
  const wantCycles = new Set([20, 60, 100, 140, 180, 220]);
  const signalVals = signals
    .filter((s) => wantCycles.has(s.idx))
    .reduce((acc, cur) => acc + cur.idx * cur.val, 0);

  console.log(signalVals);
}

main();
