import { tool } from "@opencode-ai/plugin"

// Resolve how to invoke the Python that has tainie installed. Default is
// `uv run python`, which resolves the uv workspace's venv (tainie is a
// workspace member) with no reliance on a bare `python` being on PATH.
// Override with TAINIE_PYTHON=/abs/path/to/python for a non-uv / explicit
// interpreter (e.g. the eval harnesses, which run under an already-active venv).
const PY_CMD = process.env.TAINIE_PYTHON ? [process.env.TAINIE_PYTHON] : ["uv", "run", "python"]

export default tool({
  description:
    "Hand ONE call site to a local model (Mellum2) for a verified fill-in-the-middle " +
    "edit proposal. Use this per site instead of hand-editing when the workspace has " +
    "this tool available. The edit is proposed, gated by a type checker, and written " +
    "to disk automatically on a pass; a declined proposal is reported, not an error " +
    "— move to the next site if that happens.",
  args: {
    path: tool.schema.string().describe("File path relative to the workspace, e.g. app.py"),
    line: tool.schema.number().describe("1-indexed line number of the call site to edit"),
    symbol: tool.schema.string().describe("The symbol name at this call site"),
    instruction: tool.schema
      .string()
      .describe('Natural-language edit for this one site, e.g. "add source=\\"web\\""'),
  },
  async execute(args, context) {
    const proc = Bun.spawn(
      [...PY_CMD, "-m", "tainie.fim_tool", args.path, String(args.line), args.symbol, args.instruction],
      {
        cwd: context.directory,
        stdout: "pipe",
        stderr: "pipe",
      }
    )
    const stdout = (await new Response(proc.stdout).text()).trim()
    const stderr = (await new Response(proc.stderr).text()).trim()
    const code = await proc.exited

    let parsed: any
    try {
      parsed = JSON.parse(stdout)
    } catch {
      throw new Error(`mellum-fim: unparseable output (exit ${code}): ${stdout || stderr}`)
    }

    if (code !== 0) {
      throw new Error(`mellum-fim ${parsed.error}: ${parsed.reason}`)
    }

    if (!parsed.applied) {
      return {
        output: `mellum-fim · declined at ${args.path}:${args.line} — ${parsed.reason}`,
        metadata: { applied: false, reason: parsed.reason },
      }
    }

    return {
      output: `mellum-fim · applied at ${args.path}:${args.line}`,
      metadata: { applied: true, path: parsed.path, line: parsed.line },
    }
  },
})
