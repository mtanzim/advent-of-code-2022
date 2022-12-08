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

function getFileSizeMap(lines: string[]): Record<string, number> {
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

      // when we hit dir, we just skip
      if (line.startsWith("dir")) {
        return acc;
      }

      // now we are at files with sizes
      const [size] = tokens;
      const curPathStr = acc.curPath.join("/").replace("//", "/");
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

  return fileSizeMap.curSizes;
}

function main() {
  const fileSizes = getFileSizeMap(parse(input));
  const rootSizes = Object.entries(fileSizes).reduce(
    (acc: Record<string, number | undefined>, [path, size]) => {
      // skip if root dir
      if (path === "/") {
        return {
          ...acc,
          [path]: undefined,
        };
      }
      const tokens = path.split("/");
      // at a 1st level dir, skip
      if (tokens.length === 2) {
        return acc;
      }
      // at a lower level dir, add size to the root level dir
      const [_, layer1] = tokens;
      const layer1Path = `/${layer1}`;
      const layer1Size = fileSizes?.[layer1Path] || 0;
      const updatedLayer1Size = layer1Size + size;
      return {
        ...acc,
        [layer1Path]: updatedLayer1Size,
        [path]: undefined,
      };
    },
    fileSizes
  );
  const cleanedRootSizes = Object.fromEntries(
    Object.entries(rootSizes).filter(([_, val]) => !!val)
  );
  console.log(fileSizes);
  console.log(cleanedRootSizes);
}

main();
