import { tool } from "@opencode-ai/plugin"
import { summarizeTainie } from "./tainie"

const PY = process.env.TAINIE_PYTHON ?? "python"

export default tool({
  description:
    "You just hand-edited a function signature or class field declaration: " +
    "call this to fan that declaration change out to every call site, " +
    "deterministically and type-gated. Do NOT hand-edit the call sites, and " +
    "do NOT call the tainie tool for the fan-out half. Call this BEFORE " +
    "touching any other file — the edit is detected as the working-tree diff " +
    "of the declaration file against git HEAD. Refusals name what would be " +
    "supported; a refusal is a fact, never retry it.",
  args: {
    file: tool.schema
      .string()
      .describe(
        "Workspace-relative path of the declaration file you just edited, e.g. models.py",
      ),
  },
  async execute(args, context) {
    const proc = Bun.spawn([PY, "-m", "tainie.propagate", args.file], {
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
      throw new Error(`propagate: unparseable output (exit ${code}): ${stdout || stderr}`)
    }
    if (code !== 0) {
      throw new Error(`propagate ${parsed.error}: ${parsed.reason}`)
    }
    return summarizeTainie(parsed)
  },
})
