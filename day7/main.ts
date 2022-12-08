// TODO: come back to this, it's a tree height algo
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
    { curPath: [], curSizes: {} },
  );

  return fileSizeMap.curSizes;
}

async function main() {
  const text = await Deno.readTextFile("./day7/input.txt");

  // const fileSizes = getFileSizeMap(parse(input));
  const fileSizes = getFileSizeMap(parse(text));

  const allKeys = Object.keys(fileSizes);
  const pathGroups = Object.entries(fileSizes).map(([path, size]) => {
    const subPaths = allKeys
      .filter((key) => key.startsWith(path))
      .sort((a, b) => a.split("/").length - b.split("/").length);
    return { path, subPaths };
  });

  console.log(pathGroups);

  // TODO: this is wrong, it's not fully recursing all subpaths and summing their sizes correctly
  const totalSizes = Object.entries(fileSizes).map(([path, size]) => {
    const subPaths = allKeys.filter((key) => key.startsWith(path));
    console.log({ path, subPaths });
    const totalSize = subPaths.reduce((acc, cur) => acc + fileSizes[cur], 0);
    return [path, totalSize];
  });

  const filteredDirectories = totalSizes.filter(([_, size]) => size <= 100000);
  const sum = filteredDirectories.reduce(
    (acc, [_, size]) => acc + Number(size),
    0,
  );

  console.log(fileSizes);
  console.log(totalSizes);
  console.log(filteredDirectories);
  console.log(sum);
}

main();
