function parse(input: string): string[] {
  return input.split("\n");
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

    // ran out of lines, return tree head
    if (nextCmdIndex === -1) {
      return head;
    }
    return buildTree(tail.slice(nextCmdIndex), curNode, head);
  }

  throw new Error("should not happen: catch all branch!");
}

async function main() {
  const text = await Deno.readTextFile("./day7/input.txt");
  const head = buildTree(parse(text), null, null);
  console.log(head);
}

main();
