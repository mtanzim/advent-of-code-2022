function parse(input: string): string[] {
  return input.split("\n");
}

interface Accum {
  curPath: string[];
  curSizes: Record<string, number>;
}

type Node = {
  name: string;
  size: number;
  children: Node[] | null;
  parent: Node | null;
};

function buildTree(lines: string[], curNode: Node | null, head: Node): Node {
  if (lines.length === 0) {
    return head;
  }
  const [line, ...tail] = lines;
  const tokens = line.split(" ");
  if (line.startsWith("$") && tokens[1] === "cd") {
    // starting from root
    if (!curNode) {
      const head = {
        name: tokens[2],
        size: 0,
        children: [],
        parent: null,
      };
      return buildTree(tail, head, head);
    }
    const dirName = tokens?.[2];

    // going in a child directory
    if (dirName !== "..") {
      const childDir = curNode?.children?.find((c) => c.name === dirName);
      if (!childDir) {
        console.error(line);
        throw new Error("should not happen: could not find child dir!");
      }
      return buildTree(tail, childDir, head);
    }

    // going up to a parent!
    return buildTree(tail, curNode?.parent || null, head);
  }

  if (line.startsWith("$") && tokens[1] === "ls") {
    const nextCmdIndex = tail.findIndex((l) => l.startsWith("$"));
    const childrenLines =
      nextCmdIndex === -1 ? tail.slice() : tail.slice(0, nextCmdIndex);
    if (!curNode) {
      throw new Error("should not happen!");
    }
    curNode.children = childrenLines.map((c) => {
      const tokens = c.split(" ");
      if (tokens?.[0] === "dir") {
        return {
          name: tokens?.[1],

          size: 0,
          parent: curNode,
          children: [],
        };
      }

      return {
        name: tokens?.[1],
        size: Number(tokens?.[0]),
        parent: curNode,
        children: null,
      };
    });
    if (nextCmdIndex === -1) {
      return head;
    }
    return buildTree(tail.slice(nextCmdIndex), curNode, head);
  }
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

async function main() {
  const text = await Deno.readTextFile("./day7/input.txt");
  const head = buildTree(parse(text), null, null);
  console.log(head);

  //   // const fileSizes = getFileSizeMap(parse(input));
  //   const fileSizes = getFileSizeMap(parse(text));

  //   const allKeys = Object.keys(fileSizes);
  //   const pathGroups = Object.entries(fileSizes).map(([path, _size]) => {
  //     const subPaths = allKeys
  //       .filter((key) => key.startsWith(path))
  //       .sort((a, b) => a.split("/").length - b.split("/").length);
  //     return { path, subPaths };
  //   });

  //   console.log(pathGroups);

  //   // TODO: this is wrong, it's not fully recursing all subpaths and summing their sizes correctly
  //   const totalSizes = Object.entries(fileSizes).map(([path, _size]) => {
  //     const subPaths = allKeys.filter((key) => key.startsWith(path));
  //     console.log({ path, subPaths });
  //     const totalSize = subPaths.reduce((acc, cur) => acc + fileSizes[cur], 0);
  //     return [path, totalSize];
  //   });

  //   const filteredDirectories = totalSizes.filter(([_, size]) => size <= 100000);
  //   const sum = filteredDirectories.reduce(
  //     (acc, [_, size]) => acc + Number(size),
  //     0
  //   );

  //   console.log(fileSizes);
  //   console.log(totalSizes);
  //   console.log(filteredDirectories);
  //   console.log(sum);
}

main();
