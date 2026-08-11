import type { Code, Parent, Root, RootContent } from "mdast";
import type { Plugin } from "unified";

export type PackageManager = "bun" | "npm" | "pnpm" | "yarn";

export type PackageManagerOptions = {
  diagnostics?: "error" | "silent" | "warn";
  packageManagers?: PackageManager[];
};

const translateCommand = (command: string, manager: PackageManager): string => {
  if (command.includes("\n")) {
    return command
      .split("\n")
      .map((line) => translateCommand(line, manager))
      .join("\n");
  }
  if (manager === "npm") return command;
  if (command.trim() === "npm ci") {
    return manager === "yarn"
      ? "yarn install --immutable"
      : `${manager} install --frozen-lockfile`;
  }
  const install = command.trim().match(/^npm\s+(?:install|i)\s+(.+)$/);
  if (install) return `${manager} add ${install[1]}`;
  const remove = command.trim().match(/^npm\s+(?:uninstall|remove|rm)\s+(.+)$/);
  if (remove) return `${manager} remove ${remove[1]}`;
  const run = command.trim().match(/^npm\s+run\s+(.+)$/);
  if (run) return `${manager} run ${run[1]}`;
  const executable = command.trim().match(/^npx\s+(.+)$/);
  if (executable) {
    return manager === "bun"
      ? `bunx ${executable[1]}`
      : `${manager} dlx ${executable[1]}`;
  }
  return command;
};

const paragraph = (value: string): RootContent => ({
  type: "paragraph",
  children: [{ type: "text", value }],
});

const transformParent = (
  parent: Parent,
  managers: PackageManager[],
  onUnsupported: (command: string, code: Code) => void,
) => {
  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];
    if (child.type !== "code" || child.meta?.trim() !== "npm2yarn") {
      if ("children" in child) {
        transformParent(child as Parent, managers, onUnsupported);
      }
      continue;
    }

    const code = child as Code;
    for (const line of code.value.split("\n")) {
      const command = line.trim();
      if (
        /^(?:npm|npx)\s/.test(command) &&
        translateCommand(command, "pnpm") === command
      ) {
        onUnsupported(command, code);
      }
    }
    parent.children.splice(
      index,
      1,
      paragraph("::: code-group"),
      ...managers.map<Code>((manager) => ({
        type: "code",
        lang: code.lang,
        meta: `[${manager}]`,
        value: translateCommand(code.value, manager),
      })),
      paragraph(":::"),
    );
    index += managers.length + 1;
  }
};

const remarkPackageManagers: Plugin<[PackageManagerOptions?], Root> = (
  options = {},
) => {
  const managers = options.packageManagers ?? ["npm", "pnpm", "yarn", "bun"];
  const diagnostics = options.diagnostics ?? "warn";
  return (tree, file) =>
    transformParent(tree, managers, (command, code) => {
      if (diagnostics === "silent") return;
      const reason = `Unable to translate npm command: "${command}".`;
      if (diagnostics === "error") {
        file.fail(reason, code.position, "rehype-code-group:package-manager");
      } else {
        file.message(
          reason,
          code.position,
          "rehype-code-group:package-manager",
        );
      }
    });
};

export default remarkPackageManagers;
