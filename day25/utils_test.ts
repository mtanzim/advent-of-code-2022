// url_test.ts
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { decimalToSnafu } from "./utils.ts";

type TestCase = Array<[number, string]>;

const testCases: TestCase = [
  [1, "1"],
  [2, "2"],
  [3, "1="],
  [4, "1-"],
  [5, "10"],
  [6, "11"],
  [7, "12"],
  [8, "2="],
  [9, "2-"],
  [10, "20"],
  [15, "1=0"],
  [20, "1-0"],
  [2022, "1=11-2"],
  [12345, "1-0---0"],
  [314159265, "1121-1110-1=0"],
];

testCases
  // .filter((t) => t[0] === 12345)
  .forEach(([n, s]) =>
    Deno.test(`test: ${s}`, () => {
      const res = decimalToSnafu(n);
      assertEquals(res, s);
    })
  );
