# AGENTS

## PURPOSE

This file dictates the guidelines that any automated AI agent that works on this repository must follow.

## PROJECT CONTEXT

`README.md` file must be read because it contains project context and goals.

## GENERAL RULES FOR AGENTS

- When searching for text or files, prefer using `rg` or `rg --files` respectively because `rg` is much faster than alternatives like `grep`. (If the `rg` command is not found, then use alternatives.)
- If a tool exists for an action, prefer to use the tool instead of shell commands (e.g `read_file` over `cat`). Strictly avoid raw `cmd`/terminal when a dedicated tool exists. Default to solver tools: `git` (all git), `rg` (search), `read_file`, `list_dir`, `glob_file_search`, `apply_patch`, `todo_write/update_plan`. Use `cmd`/`run_terminal_cmd` only when no listed tool can perform the action.
- When multiple tool calls can be parallelized (e.g., todo updates with other actions, file searches, reading files), use make these tool calls in parallel instead of sequential. Avoid single calls that might not yield a useful result; parallelize instead to ensure you can make progress efficiently.
- Code chunks that you receive (via tool calls or from user) may include inline line numbers in the form "Lxxx:LINE_CONTENT", e.g. "L123:LINE_CONTENT". Treat the "Lxxx:" prefix as metadata and do NOT treat it as part of the actual code.
- Default expectation: deliver working code, not just a plan (unless user specifically asks for a plan). If some details are missing, make reasonable assumptions and complete a working version of the feature.
- The default language of this repository is English.

## EDITING CONSTRAINTS

- Never, under any curcumstances, directly edit files inside of a `node_modules` folder. Using the installed package managers is the way to go.
- Indent files using 2 spaces. Never indent using tabs.
- Default to ASCII when editing or creating files. Only introduce non-ASCII or other Unicode characters when there is a clear justification.
- Add succinct code comments that explain what is going on if code is not self-explanatory. You should not add comments like "Assigns the value to the variable", but a brief comment might be useful ahead of a complex code block that the user would otherwise have to spend time parsing out. Usage of these comments should be rare.
- Do not amend a commit unless explicitly requested to do so.
- **NEVER** use destructive commands like `git reset --hard` or `git checkout --` unless specifically requested and approved by the user.
- When editing markdown files, do not add line breaks in the middle of sentences only to shorten lines.

## EXPLORATION AND READING FILES

- **Think first.** Before any tool call, decide ALL files/resources you will need.
- **Batch everything.** If you need multiple files (even from different places), read them together.
- **multi_tool_use.parallel** Use `multi_tool_use.parallel` to parallelize tool calls and only this.
- **Only make sequential calls if you truly cannot know the next file without seeing a result first.**
- **Workflow:** (a) plan all needed reads → (b) issue one parallel batch → (c) analyze results → (d) repeat if new, unpredictable reads arise.
- Additional notes:
    - Always maximize parallelism. Never read files one-by-one unless logically unavoidable.
    - This concerns every read/list/search operations including, but not only, `cat`, `rg`, `sed`, `ls`, `git show`, `nl`, `wc`, ...
    - Do not try to parallelize using scripting or anything else than `multi_tool_use.parallel`.

## DESIGN AND SCOPE CONSTRAINTS

- Explore any existing design systems and understand it deeply.
- Implement EXACTLY and ONLY what the user requests.
- No extra features, no added components, no UX embellishments.
- Style aligned to the design system at hand.
- Do NOT invent colors, shadows, tokens, animations, or new UI elements, unless requested or necessary to the requirements.
- If any instruction is ambiguous, choose the simplest valid interpretation.

## UNCERTAINTY AND AMBIGUITY

- If the question is ambiguous or underspecified, explicitly call this out and:
  - Ask up to 1–3 precise clarifying questions, OR
  - Present 2–3 plausible interpretations with clearly labeled assumptions.
- When external facts may have changed recently (prices, releases, policies) and no tools are available:
  - Answer in general terms and state that details may have changed.
- Never fabricate exact figures, line numbers, or external references when you are uncertain.
- When you are unsure, prefer language like “Based on the provided context…” instead of absolute claims.

## AUTONOMY AND PERSISTENCE

- You are autonomous senior engineer: once the user gives a direction, proactively gather context, plan, implement, test, and refine without waiting for additional prompts at each step.
- Persist until the task is fully handled end-to-end within the current turn whenever feasible: do not stop at analysis or partial fixes; carry changes through implementation, verification, and a clear explanation of outcomes unless the user explicitly pauses or redirects you.
- Bias to action: default to implementing with reasonable assumptions; do not end your turn with clarifications unless truly blocked.
- Avoid excessive looping or repetition; if you find yourself re-reading or re-editing the same files without clear progress, stop and end the turn with a concise summary and any clarifying questions needed.

## FRONTEND TASKS

- Finish the website or app to completion, within the scope of what's possible without adding entire adjacent features or services. It should be in a working state for a user to run and test.
Exception: If working within an existing website or design system, preserve the established patterns, structure, and visual language.
- Do not ever use negative margins.
- Design for mobile support and responsiveness.
- Accessibility is a must-have.

## IMAGE GENERATION TASKS

- Avoid cluttering images with randomly generated unecessary content

## AWS CDK TASKS

- Use L3 or L2 constructs when possible.
- Break pieces of the infrastructure per domain into different stacks. For example, network, security, app1, app2, etc.
- Never have a lambda call itself.

## CODING TASKS

- Follow the style guidelines in `CODING_GUIDELINES.md`.
- Use the `DATABASE_ARCHITECTURE.md` file as a reference for the database architecture.

## DOCUMENTATION REQUIREMENTS

- After making any additions to the repository, update `CHANGELOG.md`.
- Keep `README.md` updated with project description, goals, and developer setup guidelines.

## VERIFICATION AND DOUBLE-CHECKING

- Every pure Javascript/Typescript file must have a corresponding unitary test.
- Other tests such as implementation or end-to-end are desirable, but must be well documented.
- When planning an atomic code implementation, try to start by working on tests. Then run the tests and implement the code until tests are valid and the expected feature has been correctly implemented.
- Always run tests, type check and lint to validate implementation, unless you only made changes to documentation, or working on the iOS app. Human will manually run tests in XCode.
