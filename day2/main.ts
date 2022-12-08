type Options = "rock" | "paper" | "scissors";
type Outcomes = "W" | "D" | "L";

const col1: Record<string, Options> = {
  A: "rock",
  B: "paper",
  C: "scissors",
};

const col2: Record<string, Options> = {
  X: "rock",
  Y: "paper",
  Z: "scissors",
};

const col2Outcomes: Record<string, Outcomes> = {
  X: "L",
  Y: "D",
  Z: "W",
};

const shapeScores: Record<Options, number> = {
  rock: 1,
  paper: 2,
  scissors: 3,
};

const outcomeScores: Record<Outcomes, number> = {
  W: 6,
  D: 3,
  L: 0,
};

// argh this is hacky
function getOutcome(opp: Options, mine: Options): Outcomes {
  if (opp === mine) {
    return "D";
  }
  switch (JSON.stringify([opp, mine])) {
    case '["rock","paper"]':
      return "W";
    case '["scissors","paper"]':
      return "L";
    case '["rock","scissors"]':
      return "L";
    case '["paper","scissors"]':
      return "W";
    case '["paper","rock"]':
      return "L";
    case '["scissors","rock"]':
      return "W";
    default:
      console.log({ opp, mine });
      console.log(JSON.stringify([opp, mine]));
      throw new Error(
        "this should not happen, if JS only had real pattern matching :/",
      );
  }
}

function getOption(opp: Options, outcome: Outcomes): Options {
  if (outcome === "D") {
    return opp;
  }
  switch (JSON.stringify([opp, outcome])) {
    case '["rock","W"]':
      return "paper";
    case '["rock","L"]':
      return "scissors";
    case '["scissors","W"]':
      return "rock";
    case '["scissors","L"]':
      return "paper";
    case '["paper","W"]':
      return "scissors";
    case '["paper","L"]':
      return "rock";
    default:
      console.log({ opp, outcome });
      console.log(JSON.stringify([opp, outcome]));
      throw new Error(
        "this should not happen, if JS only had real pattern matching :/",
      );
  }
}

async function parse(): Promise<Array<[string, string]>> {
  const text = await Deno.readTextFile("./day2/input.txt");
  const inputs = text.split("\n").map((t) => t.split(" ")) as Array<
    [string, string]
  >;
  return inputs;
}

async function partA() {
  const inputs = await parse();
  // part A
  const scores = inputs
    .map(([opp, mine]) => [col1[opp], col2[mine]])
    .map(([opp, mine]) => {
      const shapeScore = shapeScores[mine];
      const gameScore = outcomeScores[getOutcome(opp, mine)];
      return shapeScore + gameScore;
    });
  const totalScore = scores.reduce((acc, cur) => cur + acc, 0);
  console.log(inputs);
  console.log(scores);
  console.log(totalScore);
}

async function partB() {
  const inputs = await parse();

  // part B
  const scores = inputs
    .map(([opp, outcome]) => [col1[opp], col2Outcomes[outcome]])
    .map(([opp, outcome]) => {
      const mine = getOption(opp as Options, outcome as Outcomes);
      const shapeScore = shapeScores[mine];
      const gameScore = outcomeScores[getOutcome(opp as Options, mine)];
      return shapeScore + gameScore;
    });
  const totalScore = scores.reduce((acc, cur) => cur + acc, 0);
  console.log(inputs);
  console.log(scores);
  console.log(totalScore);
}
partA();
partB();
