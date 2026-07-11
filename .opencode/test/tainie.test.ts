import { expect, test } from "bun:test"
import { summarizeTainie } from "../tool/tainie"

test("passes through escalated=true", () => {
  const parsed = {
    applied: 1,
    skipped: 2,
    benign_skipped: 0,
    failure_skipped: 2,
    unresolvable: 0,
    symbol: "m.f",
    escalated: true,
  }
  const { metadata } = summarizeTainie(parsed)
  expect(metadata.escalated).toBe(true)
})

test("missing escalated defaults to false, not silently absorbed", () => {
  const parsed = { applied: 1, skipped: 0, unresolvable: 0, symbol: "m.f" }
  const { metadata } = summarizeTainie(parsed)
  expect(metadata.escalated).toBe(false)
})

test("component_contract check summarizes findings, not applied/skipped", () => {
  const parsed = {
    workspace: "/tmp/ws",
    symbol: "components.ComplaintCard",
    applicable: true,
    findings: [
      { kind: "missing-required", path: "/tmp/ws/admin_view.py", line: 10, col: 4, name: "complaint", reason: null, message: null },
    ],
  }
  const { output, metadata } = summarizeTainie(parsed)
  expect(metadata.applicable).toBe(true)
  expect(metadata.findings).toHaveLength(1)
  expect(metadata.findings[0].name).toBe("complaint")
  expect(output).toContain("component_contract check")
})

test("component_contract check with zero findings still reports applicable and empty findings", () => {
  const parsed = { workspace: "/tmp/ws", symbol: "m.NotHoleUsed", applicable: false, findings: [] }
  const { metadata } = summarizeTainie(parsed)
  expect(metadata.applicable).toBe(false)
  expect(metadata.findings).toEqual([])
})
