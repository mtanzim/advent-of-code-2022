main();

type Node = {
  name: string;
  size: number;
  children: Node[] | null;
  parent: Node | null;
};

type DirList = Array<{ name: string; totalSize: number }>;

const TOTAL_SPACE_NEEDED = 30000000;
const HDD_SIZE = 70000000;

async function main() {
  const text = await Deno.readTextFile("./day7/input.txt");
  const head = buildTree(parse(text), null, null);

  if (!head) {
    throw new Error("could not build tree˝");
  }

  const totalOccupied = buildSizes(head);
  const dirList = listDirs(head);
  // part a
  const res = dirList.filter((d) => d.totalSize <= 100000).map((d) =>
    d.totalSize
  ).reduce(
    (acc, cur) => acc + cur,
    0,
  );
  console.log(res);

  // part b
  const needToDelete = TOTAL_SPACE_NEEDED - (HDD_SIZE - totalOccupied);
  const sortedDirs = dirList.toSorted((a, b) => a.totalSize - b.totalSize);
  console.log(
    sortedDirs.find((dir) => dir.totalSize > needToDelete)?.totalSize,
  );
}

function parse(input: string): string[] {
  return input.split("\n");
}

function buildTree(
  lines: string[],
  curNode: Node | null,
  head: Node | null,
): Node | null {
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
    const childrenLines = nextCmdIndex === -1
      ? tail.slice()
      : tail.slice(0, nextCmdIndex);
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

    // ran out of lines, return tree head
    if (nextCmdIndex === -1) {
      return head;
    }
    return buildTree(tail.slice(nextCmdIndex), curNode, head);
  }

  throw new Error("should not happen: catch all branch!");
}

/**
Mutates!!! Takes the head of the tree
and recursively fills out the sizes
using the children nodes.
*/
function buildSizes(node: Node): number {
  if (!node.children) {
    return node.size;
  }
  node.size = node.children.map(buildSizes).reduce((acc, cur) => acc + cur, 0);
  return node.size;
}

function listDirs(node: Node | null): DirList {
  if (node?.children) {
    return node.children.map((c) => listDirs(c)).flat().concat({
      name: node.name,
      totalSize: node.size,
    });
  }
  return [];
}
