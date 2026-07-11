import { expect, test } from "bun:test"
import { parseRecognizeResult } from "../tool/recognize"

test("parses a success verdict on exit 0", () => {
  const verdict = { target: "m.C.f", intent: "rename", applied: [], unresolvable: [], ambiguous: false }
  const out = parseRecognizeResult(JSON.stringify(verdict), "", 0)
  expect(out.target).toBe("m.C.f")
  expect(out.ambiguous).toBe(false)
})

test("throws the CLI reason on a non-zero guarded exit", () => {
  const err = JSON.stringify({ error: "missing_fork", reason: "no pyrefly fork configured" })
  expect(() => parseRecognizeResult(err, "", 1)).toThrow("no pyrefly fork configured")
})

test("throws 'unparseable' when stdout is not JSON", () => {
  expect(() => parseRecognizeResult("Traceback...", "boom", 1)).toThrow("unparseable")
})
