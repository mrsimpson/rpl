/**
 * ToolInputNormalizer — Strategy pattern for normalizing format-specific tool
 * inputs into a canonical `args` shape that renderers can rely on.
 *
 * Each normalizer handles one tool name. The parser calls `normalizeToolInput()`
 * once per tool-use entry; renderers only ever read the canonical `args.*` fields.
 *
 * Adding support for a new built-in tool = add one entry to `normalizers` below.
 */

export interface ToolNormalizer {
  /** Returns true if this normalizer applies to the given tool name. */
  accepts(toolName: string): boolean
  /** Maps raw format-specific input → canonical args shape. */
  normalize(input: Record<string, any>): Record<string, any>
}

/**
 * Kiro built-in `read` tool.
 * Input shape: { operations: [{ mode, path, ... }] }
 * Canonical:   { path: string (first op), operations: [...] }
 */
const KiroReadNormalizer: ToolNormalizer = {
  accepts: (name) => name === 'read',
  normalize: (input) => {
    const ops: any[] = input.operations ?? []
    const firstPath: string | undefined = ops[0]?.path
    return {
      path: firstPath,
      operations: ops
    }
  }
}

/**
 * Kiro built-in `write` tool.
 * Input shape: { command, path, content?, oldStr?, newStr? }
 * Canonical:   { path, command: 'create'|'str_replace'|..., content?, old_str?, new_str? }
 */
const KiroWriteNormalizer: ToolNormalizer = {
  accepts: (name) => name === 'write',
  normalize: (input) => {
    // Map Kiro camelCase command names to the canonical snake_case names
    // used by Q-Developer (and expected by FsWriteRenderer).
    const commandMap: Record<string, string> = {
      strReplace: 'str_replace',
      create: 'create',
      insert: 'insert'
    }
    return {
      path: input.path,
      command: commandMap[input.command] ?? input.command,
      content: input.content,
      old_str: input.oldStr,
      new_str: input.newStr
    }
  }
}

/**
 * Kiro built-in `shell` tool.
 * Input shape: { command: string, working_dir?: string }
 * Canonical:   same — shell renderer reads `args.command` directly.
 */
const KiroShellNormalizer: ToolNormalizer = {
  accepts: (name) => name === 'shell',
  normalize: (input) => ({
    command: input.command,
    working_dir: input.working_dir
  })
}

/** All registered normalizers. Evaluated in order; first match wins. */
const normalizers: ToolNormalizer[] = [
  KiroReadNormalizer,
  KiroWriteNormalizer,
  KiroShellNormalizer
]

/**
 * Normalizes a raw tool input into the canonical args shape.
 * Falls back to the raw input unchanged if no normalizer matches
 * (e.g. MCP tools whose input is already fine as-is).
 */
export function normalizeToolInput(
  toolName: string,
  rawInput: Record<string, any>
): Record<string, any> {
  const normalizer = normalizers.find((n) => n.accepts(toolName))
  return normalizer ? normalizer.normalize(rawInput) : rawInput
}
