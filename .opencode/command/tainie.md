---
description: Fan out a refactoring edit to every call site of a named Python symbol via tainie
---
The user wants to run a tainie fan-out. Arguments: $ARGUMENTS

From those arguments, identify:
- **symbol** — the fully-qualified name of the target (e.g. `pkg.module.render_report`)
- **instruction** — the natural-language edit (e.g. "add verbose=True to all call sites")

For a **rename / retarget** (e.g. "rename field `agent_name` to `author`"),
also identify:
- **new_name** — the new bare identifier (e.g. `author`).

When a rename is requested, set `symbol` to the fully-qualified name of the
field being renamed (e.g. `models.Complaint.agent_name`) and pass `new_name`.
Its presence routes the edit through tainie's deterministic, type-gated rename
tier (span-precise across every reference, ~1s) rather than the per-site model
editor. The rename edits the field's declaration and every reference
atomically — do not pre-declare the new name. Omit `new_name` for non-rename
edits such as adding a keyword argument.

For a **file split / symbol move** (e.g. "move `BaseLayout` out of
`shared/layouts.py` into its own module `shared.base_layout`"), also identify:
- **new_module** — the destination module as a dotted path (e.g.
  `shared.base_layout`).

When a move is requested, set `symbol` to the fully-qualified name of the
top-level def/class being moved (e.g. `shared.layouts.BaseLayout`) and pass
`new_module`. Its presence routes the edit through tainie's deterministic
file_split recipe: it extracts the declaration into the new module, trims the
old file, rewrites every importer, and type-gates the result. `new_name` and
`new_module` are mutually exclusive — a single call is a rename or a move, not
both.

For a **function → dataclass conversion** (e.g. "convert the plain function
`page.Header` into a `@dataclass` component"), also identify:
- **new_class** — the new class name (usually the same as the function's own
  name, e.g. `Header`).

When a conversion is requested, set `symbol` to the fully-qualified name of the
function being converted (e.g. `page.Header`) and pass `new_class`. Its presence
routes the edit through tainie's deterministic, type-gated
function_to_dataclass_component tier. The target must be a plain module-level
function with a `Template` return annotation for the conversion to be recognized.
`new_class` is mutually exclusive with `new_name`, `new_module`, and
`extract_to`.

For an **extract-component** (e.g. "extract `Header` from `page.py` into its own
module `page.header`"), also identify:
- **extract_to** — the destination dotted module path for the extracted tdom
  component (e.g. `page.header`).

When an extract is requested, set `symbol` to the fully-qualified name of the
component being extracted (e.g. `page.Header`) and pass `extract_to`. Its
presence routes the edit through tainie's deterministic, type-gated
extract_component tier. The target can be a plain tdom component function or a
dataclass-with-`__call__` that currently shares its module with other top-level
symbols. Note the known limitation: `DESTINATION_MODULE_PACKAGE_COLLISION` —
the destination package must not share a name with the still-populated source
module. `extract_to` is mutually exclusive with `new_name`, `new_module`, and
`new_class`.

For a **component-prop contract check** (e.g. "does `ComplaintCard`'s prop
contract hold everywhere it's used as a component?"), also identify:
- **check_contract** — set to `true`.

When a check is requested, set `symbol` to the fully-qualified name of the
component being checked and pass `check_contract=true`. This recipe is
read-only: no edit is ever made. The result is `{applicable, findings}` --
`findings` is workspace-wide (every contract violation found anywhere, not
only ones involving `symbol`), and `applicable` reports only whether `symbol`
itself is recognized as a component-hole target; `findings` is never gated
on `applicable`. `check_contract` is mutually exclusive with `new_name`,
`new_module`, `new_class`, and `extract_to`.

Then call the `tainie` tool with those values. When it returns, report the
summary (applied / skipped / unresolvable counts) and list the changed files so
the user can review them with `git diff`. If the tool reports an error
(`missing_fork`, `model_unreachable`, `bad_workspace`, `bad_executor_mode`), relay the reason and stop.

## Packaging work for the tainie subagent

For a multi-site mechanical refactor, prefer dispatching the **`tainie`
subagent** with a handoff packet rather than calling the tool directly. Compose
the packet inline, shaped like `examples/agent-clinic/packets/*.md`:

- **GATE** — the command that must pass afterward (e.g. `uv run pytest -q`).
- **CONTRACT** — what changes and what must NOT; call out any untyped reference
  the type checker can't reach (e.g. a Jinja `{{ obj.field }}`) and say to leave it.
- **EXEMPLAR** — a short code snippet of the desired end state.
- **DELEGATION** — the candidate target FQN (+ `new_name` for a rename, or
  `new_module` for a file split / symbol move). This is a hint; the subagent
  validates it via `recognize` and re-resolves if wrong.
- **AFTER EDITING** — the post-edit checks (`uv run pytest -q`, `git diff`).

Do not name a recipe — the subagent's `recognize` step decides which applies, or
routes to generation when the target is stub-shaped (`generation_shaped`) or no
recipe fits.

**Escalation-relay contract:** when the tainie subagent stops and asks (partial
verdict, over-threshold skips, ambiguity), relay its question to the human
verbatim and stop. You may add context; you may not add a verdict. Do not
reclassify its escalation as a false positive and proceed — whether a partial
result is acceptable is the human's call. See `AGENTS.md` for the full rule.
