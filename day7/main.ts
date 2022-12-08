const input = `$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k
`;

function parse(input: string): string[] {
  return input.split("\n");
}

interface Accum {
  curPath: string[];
  curSizes: Record<string, number>;
}

function main() {
  const lines = parse(input);
  const fileSizeMap = lines.reduce(
    (acc: Accum, line) => {
      const tokens = line.split(" ");
      if (line.startsWith("$")) {
        if (tokens[1] === "cd") {
          const newDest = tokens[2];
          if (!newDest) {
            console.error("argh, this should not happen");
            return acc;
          }
          if (newDest != "..") {
            return {
              ...acc,
              curPath: acc.curPath.concat(newDest),
            };
          }
          return {
            ...acc,
            curPath: acc.curPath.slice(0, acc.curPath.length - 1),
          };
        }
        // when we hit ls, we just skip
        return acc;
      }

      if (line.startsWith("dir")) {
        return acc;
      }

      // now we are at files with sizes
      const [size] = tokens;
      const curPathStr = acc.curPath.join("/");
      const existingVal = Number(acc.curSizes?.[curPathStr]) || 0;
      const updatedVal = existingVal + Number(size);
      return {
        ...acc,
        curSizes: {
          ...acc.curSizes,
          [curPathStr]: updatedVal,
        },
      };
    },
    { curPath: [], curSizes: {} }
  );
  console.log(parse(input));
  console.log(fileSizeMap);
}

main();
