import { tool } from "@opencode-ai/plugin"

// Resolve how to invoke the Python that has tainie installed. Default is
// `uv run python`, which resolves the uv workspace's venv (tainie is a
// workspace member) with no reliance on a bare `python` being on PATH.
// Override with TAINIE_PYTHON=/abs/path/to/python for a non-uv / explicit
// interpreter (e.g. the eval harnesses, which run under an already-active venv).
const PY_CMD = process.env.TAINIE_PYTHON ? [process.env.TAINIE_PYTHON] : ["uv", "run", "python"]

// Pure, testable: shape a parsed DemoResult into {output, metadata}. The
// benign/failure split is computed in Python (skip_is_benign, single source of
// truth) and arrives as counts; TS only passes them through. A MISSING
// failure_skipped is treated conservatively as all skips being failure-class
// (fall back to the total) — absence must over-escalate, never silently absorb.
export function summarizeTainie(parsed: any): { output: string; metadata: any } {
  if ("findings" in parsed && !("applied" in parsed)) {
    const findings = parsed.findings ?? []
    return {
      output:
        `tainie · component_contract check · applicable ${parsed.applicable} · ` +
        `${findings.length} finding(s) · symbol ${parsed.symbol}`,
      metadata: {
        applicable: parsed.applicable,
        findings,
      },
    }
  }
  const skipped = parsed.skipped ?? 0
  const benign = parsed.benign_skipped ?? 0
  const failure = parsed.failure_skipped ?? skipped // 0 preserved by ??; undefined → conservative total
  const hint = parsed.hint ?? null
  return {
    output:
      `tainie · applied ${parsed.applied}, skipped ${skipped} (${failure} failure) · ` +
      `unresolvable ${parsed.unresolvable} · symbol ${parsed.symbol}` +
      (parsed.refusal_reason ? ` · refused: ${parsed.refusal_reason}` : "") +
      (hint ? ` · hint: ${hint}` : ""),
    metadata: {
      applied: parsed.applied,
      skipped,
      benign_skipped: benign,
      failure_skipped: failure,
      unresolvable: parsed.unresolvable,
      changed_files: parsed.changed_files ?? [],
      refusal_reason: parsed.refusal_reason ?? null,
      diagnostics: parsed.diagnostics ?? [],
      hint,
      escalated: parsed.escalated ?? false,
    },
  }
}

export default tool({
  description:
    "Deterministic, type-gated refactoring of a named Python symbol: RENAME a " +
    "parameter/field/function/class, MOVE a symbol to a new module (file split), " +
    "EXTRACT a tdom component into its own module, ADD a keyword argument to all " +
    "callers, CONVERT a function to a dataclass component, or CHECK a component-prop " +
    "contract. Use this INSTEAD OF hand-editing with edit/replaceAll for any of " +
    "these — even with only one or two call sites — because tainie's edits are " +
    "span-precise (a text replaceAll of a renamed identifier can corrupt unrelated " +
    "same-named strings, e.g. an HTML tag) and are blocked unless the result " +
    "type-checks. The workspace is the current session project; commit or be ready " +
    "to `git diff` — edits are applied in place.",
  args: {
    symbol: tool.schema
      .string()
      .describe("Fully-qualified name of the target symbol, e.g. pkg.module.render_report"),
    instruction: tool.schema
      .string()
      .describe('Natural-language edit, e.g. "add verbose=True to all call sites"'),
    new_name: tool.schema
      .string()
      .optional()
      .describe(
        "For a rename/retarget: the new bare identifier (e.g. author). Its " +
        "presence routes to the deterministic, type-gated rename tier. Omit " +
        "for non-rename edits.",
      ),
    new_module: tool.schema
      .string()
      .optional()
      .describe(
        "For a file_split: the destination dotted module path (e.g. app.reporting). " +
        "Its presence routes to the deterministic, type-gated file_split tier. " +
        "Mutually exclusive with new_name.",
      ),
    new_class: tool.schema
      .string()
      .optional()
      .describe(
        "For function→dataclass conversion: the new class name (usually " +
        "the same as the function's own name). Its presence routes to the " +
        "deterministic, type-gated function_to_dataclass_component tier. " +
        "Mutually exclusive with new_name/new_module/extract_to.",
      ),
    extract_to: tool.schema
      .string()
      .optional()
      .describe(
        "For extract-component: the destination dotted module path for " +
        "the extracted tdom component (e.g. components.header). Its " +
        "presence routes to the deterministic, type-gated extract_component " +
        "tier. Mutually exclusive with new_name/new_module/new_class.",
      ),
    check_contract: tool.schema
      .boolean()
      .optional()
      .describe(
        "Read-only component-prop contract check (the component_contract " +
        "recipe). No edit is made -- findings come back workspace-wide " +
        "regardless of whether `symbol` itself is component-hole-used. " +
        "Mutually exclusive with new_name/new_module/new_class/extract_to.",
      ),
  },
  async execute(args, context) {
    const cmd = [...PY_CMD, "-m", "tainie.tool", args.symbol, args.instruction]
    if (args.new_name) cmd.push(args.new_name)
    if (args.new_module) cmd.push("--new-module", args.new_module)
    if (args.new_class) cmd.push("--new-class", args.new_class)
    if (args.extract_to) cmd.push("--extract-to", args.extract_to)
    if (args.check_contract) cmd.push("--check-contract")
    const proc = Bun.spawn(cmd, {
      cwd: context.directory,
      stdout: "pipe",
      stderr: "pipe",
    })
    const stdout = (await new Response(proc.stdout).text()).trim()
    const stderr = (await new Response(proc.stderr).text()).trim()
    const code = await proc.exited

    let parsed: any
    try {
      parsed = JSON.parse(stdout)
    } catch {
      throw new Error(`tainie: unparseable output (exit ${code}): ${stdout || stderr}`)
    }

    if (code !== 0) {
      throw new Error(`tainie ${parsed.error}: ${parsed.reason}`)
    }

    return summarizeTainie(parsed)
  },
})
