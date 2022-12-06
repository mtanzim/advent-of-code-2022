// TODO: this doesn't work yet
// range conditions are incorrect
const text = await Deno.readTextFile("./day4/input.txt");
const inputs = text.split("\n");
const parsedInputs = inputs.map((ip) => {
  const pairs = ip.split(",");
  const pairsMinMax = pairs.map((p) => {
    const [min, max] = p.split("-");
    return { min, max };
  });
  return pairsMinMax;
});

const result = parsedInputs.reduce((acc, cur) => {
  const [a, b] = cur;
  if (a.min <= b.min && a.max >= b.max) {
    console.log("a contrains b");
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
