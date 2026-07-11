import { tool } from "@opencode-ai/plugin"

// Resolve the Python that has tainie installed. Default assumes the session is
// launched with tainie's venv active; override with TAINIE_PYTHON if not.
const PY = process.env.TAINIE_PYTHON ?? "python"

// Pure, testable: map the recognize CLI's (stdout, stderr, exit) into a parsed
// verdict or a thrown error carrying the CLI's own reason. No I/O.
export function parseRecognizeResult(stdout: string, stderr: string, code: number): any {
  let parsed: any
  try {
    parsed = JSON.parse(stdout)
  } catch {
    throw new Error(`recognize: unparseable output (exit ${code}): ${stdout || stderr}`)
  }
  if (code !== 0) {
    throw new Error(`recognize ${parsed.error}: ${parsed.reason}`)
  }
  return parsed
}

export default tool({
  description:
    "Dry-run: report which of tainie's deterministic recipes apply to a named " +
    "Python symbol, from type-resolved Glean facts, WITHOUT mutating the workspace. " +
    "Returns a verdict (applied recipes + per-recipe worklist, unresolvable sites, " +
    "ambiguous flag). Call this BEFORE the tainie edit tool to decide whether a " +
    "recipe fits; applied:[] means no recipe applies — route to generation instead.",
  args: {
    target: tool.schema
      .string()
      .describe("Fully-qualified name of the target symbol, e.g. models.Complaint.author"),
    intent: tool.schema
      .string()
      .describe('The edit intent in plain language; recorded, consulted only for tiebreaks'),
  },
  async execute(args, context) {
    const proc = Bun.spawn([PY, "-m", "tainie.recognize", args.target, args.intent], {
      cwd: context.directory,
      stdout: "pipe",
      stderr: "pipe",
    })
    const stdout = (await new Response(proc.stdout).text()).trim()
    const stderr = (await new Response(proc.stderr).text()).trim()
    const code = await proc.exited

    const verdict = parseRecognizeResult(stdout, stderr, code)
    const applied = (verdict.applied ?? []) as any[]
    return {
      output:
        `recognize · ${applied.length} applicable` +
        (applied.length ? ` (${applied.map((a) => a.recipe).join(", ")})` : " — route to generation") +
        (verdict.ambiguous ? " · ambiguous" : "") +
        ` · target ${verdict.target}`,
      metadata: {
        applied,
        unresolvable: verdict.unresolvable ?? [],
        ambiguous: verdict.ambiguous ?? false,
      },
    }
  },
})
