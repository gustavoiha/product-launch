# CODING GUIDELINES

## Core

- Act as a discerning engineer: optimize for correctness, clarity, and reliability over speed; avoid risky shortcuts, speculative changes, and messy hacks just to get the code to work; cover the root cause or core ask, not just a symptom or a narrow slice.
- Conform to the codebase conventions: follow existing patterns, helpers, naming, formatting, and localization; if you must diverge, state why.
- Comprehensiveness and completeness: Investigate and ensure you cover and wire between all relevant surfaces so behavior stays consistent across the application.
- Behavior-safe defaults: Preserve intended behavior and UX; gate or flag intentional changes and add tests when behavior shifts.
- Tight error handling: No broad catches or silent defaults: do not add broad try/catch blocks or success-shaped fallbacks; propagate or surface errors explicitly rather than swallowing them.
  - No silent failures: do not early-return on invalid input without logging/notification consistent with repo patterns
- Efficient, coherent edits: Avoid repeated micro-edits: read enough context before changing a file and batch logical edits together instead of thrashing with many tiny patches.
- Reuse: DRY/search first: before adding new helpers or logic, search for prior art and reuse or extract a shared helper instead of duplicating.
- Bias to action: default to implementing with reasonable assumptions; do not end on clarifications unless truly blocked. Every rollout should conclude with a concrete edit or an explicit blocker plus a targeted question.

## Programming language

This project uses `Typescript` when possible, and defaults to `Javascript` if necessary.

## Naming

- Constant names must be in uppercase and snake_case. For example: `SHOULD_RENDER`.
- Constant names must be descriptive and informative, including units of measurement. For example: `TIME_TO_RENDER_IN_MILISECONDS`.
- Variable and function names must be in camelcase. For example: `getDetails`.
- Neither contansts, variables, or functions names should ever be abbreviated (except for common cases like "id" or "url")

## Coding style

- Use guard clauses instead of `if/else` blocks, when possible.
- Use arrow functions when possible.

### Typescript

- Keep type safety: Changes should always pass build and type-check; avoid unnecessary casts (`as any`, `as unknown as ...`); prefer proper types and guards, and reuse existing helpers (e.g., normalizing identifiers) instead of type-asserting.
- Explicitely declare the return type of every function.
- Never use `any`.
- When an argument's type is not known, use `unknown` and infer the type with guard clauses.
- Prefer interfaces for function arguments and React props.

## Coding patterns

- Prefer dependency injection over singletons.
- Enfore one single, clear responsibility per function.

## File organization

- Avoid creating a `utils` folder, or similar.
- Code files should have a meaningful name according to its responsibility.
- File names should be nouns, and never verbs.
- File names should never be abbreviated.

## React

- Avoid using `useMemo`, unless absolutely necessary, since React natively memoizes state variables.
- Avoid long React components with more than one responsibility (domain of intention). Prefer small, dedicated components, while not creating a prop and event passing chaos.
- Prefer using patterns such as custom hooks, composition pattern (combining smaller, reusable components), and container/presentational components.
- When custom hooks are not enough, use higher-order components or render props.
- Each .tsx file should exactly only one React component.

## External dependencies

- When installing a library, try to find its latest version. Avoid using alpha or beta versions.
