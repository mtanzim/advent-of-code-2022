type Inst = "addx" | "noop";
type Val = number;

function parse(input: string): any[] {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [inst, val] = line.split(" ");
    if (inst === "addx") {
      return [inst, Number(val)];
    }
    return [inst];
  });
}

async function main() {
  const input = await Deno.readTextFile("./day10/input.txt");
  const rows = parse(input);
  console.log(rows);
}

main();
