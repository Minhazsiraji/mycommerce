# AgentSiraji Commerce V2

## Master Development Guide

**Document type:** Permanent engineering rulebook

**Status:** Foundation specification

**Authority:** Approved Software Architecture Specification (SAS)

**Applies to:** All implementation, refactoring, hardening, documentation, review and release work

**Repository:** `Minhazsiraji/mycommerce`

**Primary branch:** `main`

**Current V2 foundation branch:** `feature/commerce-v2`

---

## Document purpose

This guide converts the AgentSiraji Commerce V2 Software Architecture Specification
into repeatable implementation rules. It tells the implementation engineer how work is
prepared, executed, verified, reviewed, reported and released.

This guide does not replace task-specific requirements, approved wireframes or the
Design System. It controls how those approved decisions are implemented.

### Authority order

When instructions conflict, use this order:

1. Security, privacy, legal and financial correctness.
2. Protected commerce invariants in the approved SAS and this guide.
3. The currently approved phase specification and acceptance criteria.
4. Approved Design System and wireframe documents.
5. This Master Development Guide.
6. `CLAUDE.md` and current domain documentation.
7. Existing implementation patterns.
8. Engineer preference.

The implementation engineer must stop and report a conflict instead of silently
choosing a lower-authority instruction.

### Decision ownership

| Role | Authority |
|---|---|
| Product Owner | Business scope, priority, policies, offers, claims and final acceptance |
| Chief Software Architect & UX Director | Architecture, Design System, wireframes, standards and migration direction |
| Implementation Engineer (Work) | Implementation of the bounded approved task and evidence-based technical reporting |

Work does not decide what product should be built. Work may identify a problem,
explain options and recommend a safe response, but must wait for approval when the
choice changes product scope, architecture, data meaning or visual direction.

### Source-of-truth documents

| Subject | Source of truth |
|---|---|
| Product/system architecture | `docs/architecture/AGENTSIRAJI_COMMERCE_V2_SAS.md` |
| Implementation rules | This document |
| Current session constraints | The approved task prompt |
| Current repository facts | Source code, migrations, package scripts and CI |
| Visual rules | Approved Design System/DDS, once created |
| Page structure | Approved responsive wireframe, once created |
| Short repository reminders | `CLAUDE.md` |

The SAS is authoritative where older documents describe an aspirational state as if it
already exists. Current code is authoritative for current behavior, but existing code
does not overrule a protected invariant.

---

# 1. Development Philosophy

## 1.1 Smallest complete change

Implement the smallest change that completely satisfies the approved acceptance
criteria. Do not opportunistically redesign, rename, reorganize or modernize nearby
code.

A small change is not an incomplete change. Required validation, failure behavior,
tests, accessibility and documentation are part of the feature.

## 1.2 Stable core, progressive surface

The modular monolith, database model, server-first rendering model and commerce
invariants form the stable core. Visual presentation can evolve in approved phases
without destabilizing that core.

## 1.3 Reuse before creation

Before adding code:

1. Search the relevant module.
2. Search `src/components/ui/`.
3. Search `src/lib/`.
4. Inspect public module exports.
5. Extend an existing abstraction only when its ownership and contract remain clear.

Similar-looking code is not automatically reusable. Reuse a component only when its
semantics, accessibility and data contract match the new use.

## 1.4 Server authority

The browser is a presentation and interaction boundary, not an authority for price,
stock, identity, authorization, payment or order state. Server Components, services
and transactions remain authoritative.

## 1.5 Evidence before complexity

Do not add a dependency, service, cache, state library, search engine, queue, AI model
or abstraction without a measured problem and approved trade-off. The existing stack
is the default solution.

## 1.6 Quality is phase-local

Each phase owns the quality of the code it introduces. Accessibility, responsive
behavior, performance and tests are not deferred cleanup tasks.

## 1.7 Production safety over apparent completion

When a requested change would weaken a protected invariant, Work must stop. A partial
handoff that clearly explains a blocker is better than a superficially complete unsafe
implementation.

---

# 2. Definition of Done

A task or phase is done only when every applicable item below is true.

## 2.1 Scope

- Approved acceptance criteria are satisfied.
- No unapproved feature or architectural decision was added.
- Protected modules remain untouched unless explicitly in scope.
- The diff contains no unrelated formatting, generated files or cleanup.
- Any discovered out-of-scope defect is reported separately, not silently fixed.

## 2.2 Implementation

- Existing architecture and module boundaries are preserved.
- Inputs, errors, loading, empty and unavailable states are handled.
- Security and commerce invariants are preserved.
- Responsive and accessibility behavior matches the approved specification.
- New configuration has validation and safe defaults where appropriate.
- No secret, production data or private provider payload is committed.

## 2.3 Verification

- Relevant focused tests pass after each completed task.
- `pnpm typecheck` passes.
- `pnpm lint` passes without newly introduced warnings.
- `pnpm test` passes.
- `pnpm build` passes in the approved Node 22/configuration environment, or an
  environment-only blocker is precisely documented.
- Required integration, component, e2e, axe and Lighthouse checks pass when available
  and applicable.
- Visual work is manually checked at the responsive test matrix.
- Critical failure paths are exercised, not only the happy path.

## 2.4 Documentation and handoff

- Documentation reflects changed behavior and decisions.
- Migration, deployment and rollback implications are documented.
- Changed files and verification evidence are listed.
- Risks, assumptions and unresolved blockers are explicit.
- The phase completion report is delivered.
- Commit/push actions follow the prompt; no implicit push occurs.

If any applicable item is false, the phase status is **Incomplete** or **Blocked**, not
Complete.

---

# 3. Development Workflow

## 3.1 Standard task flow

1. **Receive approved scope** — identify the exact phase, allowed files/modules,
   protected areas, references, acceptance criteria, gates and Git instructions.
2. **Inspect** — read `CLAUDE.md`, relevant SAS/MDG sections, applicable domain docs,
   current code, tests and repository status.
3. **Restate boundaries** — summarize what will and will not change.
4. **Resolve conflicts** — stop if the prompt conflicts with an invariant, approved
   design or current repository fact.
5. **Plan bounded tasks** — divide the phase into independently verifiable units.
6. **Record baseline** — run relevant existing tests/gates before risky changes.
7. **Implement one task** — make the smallest correct change.
8. **Verify that task** — run focused tests, lint/typecheck where relevant and inspect
   the diff before continuing.
9. **Repeat** — continue only within the approved phase.
10. **Run full gates** — run all phase-required automated and manual checks.
11. **Review final diff** — confirm file scope, no secrets, no debug code and no
    accidental generated changes.
12. **Report** — deliver evidence using the Phase Completion Report template.
13. **Commit/push only as directed** — never infer permission from task completion.

## 3.2 Stop conditions

Work stops and asks for direction when:

- the task requires a product, policy, brand or UX decision not already approved;
- source behavior conflicts with the SAS or approved acceptance criteria;
- the change would touch a protected module not named in scope;
- safe implementation requires a new dependency, provider or architecture decision;
- the work would span more than roughly three domain modules without an approved plan;
- production data, credentials or irreversible migration access is required;
- an existing dirty-worktree change overlaps the required edit and ownership is
  unclear;
- tests reveal a critical unrelated commerce/security issue;
- a required quality gate cannot be executed or fails for a reason outside the task;
- rollback is unsafe or undefined for a high-risk change.

## 3.3 Verification cadence

Do not wait until the end to discover that the phase broke the repository.

| Change type | Minimum task-level verification |
|---|---|
| Documentation only | Markdown structure, links/paths, diff scope |
| Pure utility/validator | Focused unit tests, typecheck |
| Component/UI | Component test where available, typecheck, lint, responsive/keyboard review |
| Server Action/service | Unit or integration test, validation/auth review, typecheck, lint |
| Database/repository | Integration test, migration review if applicable, typecheck, lint |
| Commerce transaction | Concurrency/idempotency regression test and full affected-domain suite |
| Payment/webhook | Provider validation, retry/idempotency tests and sandbox verification |
| Release configuration | Build plus environment, header, route and rollback checks |

---

# 4. Work Session Rules

## 4.1 Required session input

Every implementation session should name:

- phase and task;
- approved reference documents;
- acceptance criteria;
- in-scope routes/modules;
- protected modules;
- required tests and manual checks;
- whether to commit;
- whether to push or open a PR.

If these are incomplete but the missing fact materially changes implementation, Work
asks before coding.

## 4.2 Required session behavior

Work must:

- inspect before editing;
- communicate assumptions and conflicts early;
- keep a bounded task plan for non-trivial work;
- preserve unrelated user changes;
- use repository scripts and the pinned Node/pnpm versions;
- verify after each completed task;
- stop immediately when the approved task is complete;
- provide a self-contained final report.

## 4.3 Context control

- Read only relevant domain documents and code.
- Do not re-derive settled stack or architecture choices.
- Reference SAS/MDG sections instead of reproducing them in prompts.
- Record material new decisions in documentation so future sessions do not have to
  infer them.
- Do not treat an earlier AI summary as stronger evidence than current code or
  approved documentation.

## 4.4 Work MUST ALWAYS do

1. Confirm the branch and working-tree state before editing.
2. Read `CLAUDE.md` and applicable specifications.
3. Search for reusable code before creating code.
4. Validate untrusted input at the boundary.
5. Enforce authentication and authorization server-side.
6. Preserve the protected commerce invariants.
7. Keep the diff limited to approved scope.
8. Add or update tests for changed behavior and risks.
9. Run applicable quality gates.
10. Review the final diff for unrelated changes and secrets.
11. Report exact verification results and blockers.
12. Wait for explicit approval before pushing or releasing unless the prompt clearly
    grants it.

## 4.5 Work MUST NEVER do

1. Make product, policy, offer, brand or architecture decisions independently.
2. Change the tech stack or introduce microservices/message brokers.
3. Implement features outside the current approved phase.
4. Rewrite or regenerate unchanged files.
5. Mix an unrelated refactor with a feature or bug fix.
6. Disable lint, type or boundary rules to make code pass.
7. Trust client prices, totals, discounts, roles or ownership identifiers.
8. Read user-owned data by request ID and authorize only after retrieval.
9. Use floating point for money.
10. Read then write stock for a decrement.
11. Treat a browser payment return or unverified callback as proof of payment.
12. Mark a refund complete before external movement of money is evidenced.
13. Collapse multiple payment attempts into one mutable history.
14. Change stock without an explainable inventory movement.
15. Import a provider SDK outside its adapter or storage abstraction.
16. Add a dependency without explicit approval.
17. Hand-edit an applied/generated migration or use schema push on production.
18. Use production secrets, payment keys or customer data in tests/previews.
19. Commit secrets, debug dumps, build output or environment files.
20. Commit, push, deploy, publish, migrate production or release without authorization.
21. Claim a test passed if it was not run.
22. Claim a phase is complete while an applicable gate is failing.
23. Hide or minimize a security, payment, inventory or data-integrity risk.
24. Implement AI that can authoritatively change price, payment, inventory or order
    state.

---

# 5. Branch Strategy

## 5.1 Branch model

- `main` is protected and represents the production/release line.
- Work occurs on short-lived, focused branches.
- One branch should represent one bounded phase, hardening unit, bug or documentation
  task.
- Branches are deleted after merge when no longer needed.
- Long-running branches are refreshed through a reviewed, non-destructive integration
  approach; never rewrite a shared branch casually.

## 5.2 Naming

| Purpose | Pattern | Example |
|---|---|---|
| User-visible capability | `feature/<scope>` | `feature/homepage-v2` |
| Correctness bug | `fix/<scope>` | `fix/search-empty-filter` |
| Commerce/security hardening | `hardening/<scope>` | `hardening/payment-idempotency` |
| Documentation | `docs/<scope>` | `docs/master-development-guide` |
| Performance | `perf/<scope>` | `perf/catalog-images` |
| Tests/infrastructure | `test/<scope>` or `chore/<scope>` | `test/checkout-concurrency` |
| Production emergency | `hotfix/<scope>` | `hotfix/webhook-retry` |

Use lower-case kebab-case. Avoid ticket-only names, personal names and vague branches
such as `updates`, `new-design` or `fixes`.

## 5.3 Branch safety

- Confirm the current branch before the first edit and before commit.
- Do not work directly on `main` unless an explicitly approved emergency procedure
  requires it.
- Never force-push a protected/shared branch.
- Do not delete another contributor's branch.
- Keep unrelated local changes out of the branch's commits.

---

# 6. Git Commit Standards

## 6.1 Commit format

Use:

~~~text
<type>(<scope>): <imperative summary>
~~~

Approved types:

- `feat` — approved user-visible capability;
- `fix` — behavior/correctness repair;
- `docs` — documentation only;
- `test` — tests only;
- `refactor` — behavior-preserving internal change;
- `perf` — measured performance improvement;
- `chore` — tooling, dependencies or maintenance;
- `ci` — CI/CD configuration.

Examples:

~~~text
feat(home): implement approved trust section
fix(payments): preserve retryable callback processing
test(inventory): cover concurrent hold release
docs(architecture): add master development guide
~~~

## 6.2 Commit quality

- A commit has one coherent purpose.
- Its message explains the outcome, not the files changed.
- It is buildable and testable unless explicitly labeled as an approved checkpoint.
- It contains no unrelated formatting or generated changes.
- A behavior change includes its tests in the same commit.
- Required documentation is updated in the same commit as the decision/behavior.
- Generated migrations and corresponding schema change belong together.

## 6.3 Commit timing

Commit only when:

- the task/phase is complete according to its prompt;
- the final diff was reviewed;
- applicable gates pass;
- the user or approved workflow authorizes a commit.

Do not amend, squash or rewrite commits already shared without explicit coordination.

---

# 7. Pull Request Standards

## 7.1 Required PR content

Every PR must state:

1. Goal and approved scope.
2. Reference specification, wireframe or issue.
3. Affected routes/modules.
4. Protected areas confirmed unchanged.
5. Key implementation decisions already approved.
6. Tests and commands run with results.
7. Manual responsive/accessibility checks.
8. Security, privacy and commerce-invariant impact.
9. Performance impact and measurements.
10. Migration/deployment requirements.
11. Rollback procedure.
12. Known limitations and follow-up work.

Visual PRs include before/after screenshots for representative desktop and mobile
widths. Interaction changes include a short recording when still images cannot explain
behavior.

## 7.2 PR size and scope

- Prefer one approved phase or independently reviewable sub-phase per PR.
- If a PR spans more than roughly three modules, document why the scope is inseparable.
- Split visual redesign from commerce-state hardening.
- Split mechanical renames or file moves from behavior changes where possible.
- Mark dependencies between PRs explicitly.

## 7.3 Review gates

A PR cannot merge until applicable gates pass:

- architecture/module boundaries;
- product/wireframe fidelity;
- commerce invariant and security review;
- database/migration review;
- test/CI review;
- responsive/accessibility review;
- performance review;
- documentation/operational review;
- preview verification;
- rollback readiness.

The author may not resolve a substantive reviewer concern by deleting the test, lint
rule or acceptance criterion that exposed it.

---

# 8. Repository Hygiene Rules

## 8.1 Before work

- Run `git status --short --branch`.
- Identify tracked, untracked and modified files.
- Treat pre-existing changes as user-owned.
- Inspect `.gitignore` before adding new generated artifacts.
- Confirm Node 22 and the pinned pnpm version for release-equivalent verification.

## 8.2 During work

- Modify only necessary files.
- Do not apply repository-wide formatting for a local task.
- Do not rename files without a scope reason.
- Do not leave debug logging, commented-out implementations or scratch data.
- Do not commit `.env*`, secrets, database dumps, uploaded customer files, build output
  or editor/OS metadata.
- Do not manually change the lockfile; change it only through the package manager after
  approved dependency changes.
- Preserve line endings and existing conventions.

## 8.3 Before handoff

- Review `git diff --check`.
- Review the complete diff, including generated migrations and lockfile changes.
- Confirm no source/application file changed in documentation-only tasks.
- Confirm no unexpected untracked files remain.
- Report pre-existing unrelated changes separately.

## 8.4 Generated files

- Generate Drizzle migrations through the approved script.
- Review generated SQL; generation does not imply correctness.
- Do not regenerate snapshots or lockfiles without cause.
- Do not hand-edit an already applied migration.
- Store reports/screenshots only when they are approved project artifacts; otherwise
  keep them out of the repository.

---

# 9. Coding Standards

## 9.1 Language

- TypeScript strict mode remains enabled.
- Avoid `any`; use `unknown` at trust boundaries and narrow it.
- Prefer explicit domain types and discriminated unions for result/state models.
- Do not use non-null assertions to hide uncertain data without a proven invariant.
- Make invalid states difficult to represent.
- Use `readonly`/immutable values where mutation is not required.
- Centralize constants; avoid unexplained literals.

## 9.2 Functions and control flow

- Functions have one primary responsibility.
- Use guard clauses to keep failure paths visible.
- Separate parsing, authorization, business decisions and persistence.
- Do not catch errors only to ignore them.
- External calls require a timeout and classified retry behavior.
- Repeatable commands and external events require idempotency by design.

## 9.3 React and Next.js

- Server Components are the default.
- Add `'use client'` only at the smallest interactive boundary.
- Do not fetch on the client when the server already has the data.
- Route files compose and coordinate; they do not own business rules.
- Use Next.js image, font, metadata, caching and streaming facilities correctly.
- Suspense fallbacks preserve final geometry to avoid layout shift.
- Treat route params, search params, headers, cookies and form data as untrusted.

## 9.4 Domain layering

- `repository.ts` owns Drizzle queries.
- `service.ts` owns domain rules and transactions.
- `actions.ts` owns input transport, authentication/authorization, service delegation
  and safe result mapping.
- `validators.ts` owns client-safe Zod schemas.
- `schema.ts` owns Drizzle tables and remains server-only.
- UI components never call Drizzle directly.
- Shared code never imports domain modules.

## 9.5 Imports

- Dependency direction remains `app -> modules -> lib`.
- Import another module through its `index.ts` only.
- Client Components may import module `actions.ts` directly to preserve the RPC
  boundary.
- Repository joins may import table definitions from `@/lib/db/schema`.
- Schema foreign-key relationships may use documented direct schema imports.
- Never disable boundary lint to make an import pass.

## 9.6 Comments

- Explain why, risk, trade-off or non-obvious invariant.
- Do not narrate what visible code already says.
- Mark a temporary workaround with an owner/exit condition or tracked follow-up.
- Security-sensitive comments must remain accurate after edits.

---

# 10. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Source files | kebab-case | `product-card.tsx` |
| React components | PascalCase | `ProductCard` |
| Functions/variables | camelCase | `calculateOrderTotal` |
| Types/interfaces | PascalCase | `OrderSummary` |
| Boolean values | affirmative `is/has/can/should` | `isAvailable` |
| Constants | descriptive camelCase; uppercase only for true global constants | `maxCartQuantity` |
| Environment variables | SCREAMING_SNAKE_CASE | `CRON_SECRET` |
| Database tables/columns | snake_case | `inventory_movements` |
| Routes | lower-case kebab-case | `/forgot-password` |
| Cache tags | domain-prefixed, centralized | `product:<id>` |
| Events | past-tense business facts | `order.paid` |
| Test files | source name + `.test` | `validators.test.ts` |
| Branches | lower-case kebab-case scope | `feature/homepage-v2` |

Names should describe business meaning. Avoid vague names such as `data`, `item`,
`helper`, `manager`, `handleStuff`, `newComponent` or numeric suffixes.

Do not rename legacy storage/database fields solely for aesthetics. A name migration
needs a real clarity/compatibility benefit and an approved migration plan.

---

# 11. Folder Organization Rules

## 11.1 Stable top-level ownership

~~~text
src/app/              Routes, layouts, metadata and composition
src/modules/          Domain-owned behavior and domain UI
src/components/ui/    Shared visual primitives
src/lib/              Shared infrastructure and framework-neutral utilities
drizzle/              Generated/reviewed database migrations
docs/                 Architecture, standards and operational runbooks
scripts/              Approved maintenance/migration utilities
~~~

## 11.2 Module shape

Use only the files a module actually needs:

~~~text
src/modules/<domain>/
  actions.ts
  components/
  index.ts
  repository.ts
  schema.ts
  service.ts
  types.ts
  validators.ts
  *.test.ts
~~~

Do not create empty placeholder modules for future roadmap items.

## 11.3 Placement decisions

- Domain-specific UI stays in that module.
- A primitive moves to `src/components/ui/` only after its semantics and accessibility
  are genuinely cross-domain.
- A utility moves to `src/lib/` only when it has no domain ownership and imports no
  module.
- Provider code stays behind an adapter.
- A route-local component may stay beside its route until reuse/complexity justifies
  module ownership.
- Do not create `utils.ts` dumping grounds; name utilities by purpose.

## 11.4 Maximum file size guidelines

These are review triggers, not excuses for arbitrary fragmentation.

| Unit | Target | Review required | Strong split threshold |
|---|---:|---:|---:|
| General TypeScript/TSX file | <= 250 lines | > 300 lines | > 500 lines |
| React component | <= 180 lines | > 220 lines | > 350 lines |
| Function/method | <= 40 logical lines | > 60 logical lines | > 100 logical lines |
| Repository/service file | <= 300 lines | > 400 lines | > 500 lines |
| Test file | <= 350 lines | > 500 lines | Case-specific |

Generated migrations, schemas with cohesive table declarations and specification
documents are exceptions. Every >500-line handwritten source file touched by a phase
must be assessed. Split only by real responsibilities, not by line-count cosmetics.

---

# 12. Component Design Rules

## 12.1 Component layers

1. **Primitive** — button, input, select, textarea and future accessible primitives.
2. **Pattern** — product card, trust item, price display, section heading, form field.
3. **Section** — hero, featured collection, review section, newsletter.
4. **Page composition** — route-level ordering and data coordination.

Dependencies flow downward. A primitive does not know about products or orders.

## 12.2 Component contract

Every reusable component must have:

- a clear semantic purpose;
- minimal, typed props;
- server/client boundary intentionally chosen;
- accessible name, state and keyboard behavior;
- defined loading/empty/error behavior where relevant;
- responsive behavior;
- token-driven styling;
- no hidden business mutation.

## 12.3 Composition

- Prefer composition over configuration objects with dozens of flags.
- Avoid boolean-prop matrices that create ambiguous variants.
- Keep data fetching in Server Components or module reads.
- Keep business decisions outside presentational components.
- Reuse `ProductCard`/`ProductGrid` contracts for product merchandising unless the DDS
  explicitly approves a new variant.
- Preserve semantic HTML before adding decorative wrappers.

## 12.4 UI primitives

- Extend existing primitives before creating duplicates.
- New primitives require demonstrated reuse or accessibility value.
- Do not assume the repository has a complete shadcn/ui installation; inspect what
  actually exists.
- Variant styles must come from the approved Design System/tokens.
- All interactive states include default, hover, active, focus-visible, disabled,
  loading and error behavior as applicable.

---

# 13. Server Component vs Client Component Rules

## 13.1 Use a Server Component when

- rendering static or database-backed content;
- reading session/server data;
- composing pages and sections;
- generating metadata;
- no browser event, state, effect or browser-only API is required.

## 13.2 Use a Client Component when

- handling direct browser interaction;
- maintaining transient local UI state;
- using effects, refs or browser APIs;
- implementing focus-managed dialogs/drawers;
- performing optimistic UI around a Server Action.

## 13.3 Boundary rules

- Place `'use client'` as low in the tree as practical.
- Pass serializable, minimal props across the boundary.
- Do not pass secrets, tokens, provider payloads or unnecessary customer data.
- Do not import server-only barrels, repositories, schemas or provider SDKs into a
  Client Component.
- Client Components import `actions.ts` directly, not the module barrel.
- Avoid making an entire page/client shell interactive for one control.
- Measure bundle impact when adding a new client boundary or library.

---

# 14. State Management Rules

## 14.1 State ownership

| State | Owner |
|---|---|
| Products, accounts, orders, payments, stock | PostgreSQL/server |
| Search, filter, sort, pagination | URL query parameters |
| Authentication/session | Better Auth/server session |
| Guest cart identity | secure HTTP-only cookie |
| Temporary form/dialog state | local React state/action state |
| Mutation pending/optimistic display | transition/action state with server reconciliation |
| Theme preference | approved local preference mechanism |

## 14.2 Rules

- Do not add a global client-state library without evidence and approval.
- URL-addressable state stays in the URL and survives pagination/navigation.
- Never use client state as the source of truth for totals, stock, payment or order
  status.
- Optimistic UI must reconcile with the server and recover visibly on failure.
- Do not duplicate the same state across URL, context and local state.
- Persist only what needs to survive refresh, and use the least sensitive storage.
- Do not place session credentials or private order data in `localStorage`.

---

# 15. API and Server Action Rules

## 15.1 Interface selection

| Interface | Use |
|---|---|
| Server Component read | First-party server-rendered data |
| Server Action | First-party browser mutation |
| Route Handler | Auth/provider callback, webhook, cron or true HTTP integration |

Do not create REST endpoints merely to wrap internal reads/actions.

## 15.2 Server Action order

Every Server Action follows this order:

1. Parse/validate unknown input with Zod.
2. Authenticate when required.
3. Authorize role/ownership from server-derived identity.
4. Apply persistent rate limiting when an untrusted caller can loop.
5. Delegate to a service or transaction.
6. Write required audit/event records.
7. Invalidate affected cache tags after successful commit.
8. Return a typed, display-safe result.

Use a consistent discriminated result shape as modules are touched. Expected errors
are safe and actionable. Unexpected errors receive correlation context in logs and a
generic user message.

## 15.3 Route Handler rules

- Verify provider/cron authentication before processing.
- Use raw body verification when required by a provider.
- Enforce payload content type and size limits.
- Separate event receipt, processing claim and successful completion.
- Make retries safe and duplicate delivery a no-op after success.
- Return provider-compatible codes promptly.
- Do not use browser return URLs as payment authority.
- Do not cache callback/webhook responses.

## 15.4 Public input

- Prefer recovery-safe parsing for public URL/query state.
- Normalize only when normalization does not change business meaning.
- Reject excessive quantities, payloads and unsupported values.
- Never return stack traces, SQL/provider messages or existence-sensitive auth errors.

---

# 16. Database Change Rules

## 16.1 Approval

A database change requires:

- approved feature/hardening scope;
- ownership by one domain module;
- data/invariant impact analysis;
- migration and rollback/forward-fix plan;
- test data plan;
- review of indexes, constraints, retention and privacy.

Visual-only phases must not change schemas.

## 16.2 Query rules

- Drizzle access lives in repositories.
- Use parameterized queries; interpolated `sql.raw()` is prohibited.
- User-owned rows are scoped by user ID in the database condition.
- Select only required columns on high-volume paths.
- Avoid N+1 queries.
- Paginate public lists.
- Add indexes only from query evidence and `EXPLAIN ANALYZE` with production-shaped
  data.
- Transactions include every state change required for one business invariant.
- Do not hold transactions open across slow provider/network calls.

## 16.3 Data rules

- Money is integer poisha plus currency.
- Order items and addresses are purchase-time snapshots.
- Payment attempts stay distinct.
- Inventory movements are append-only.
- Status transitions are explicit and validated.
- PII collection and retention are minimized.
- Real customer data never enters local/preview/test environments.

## 16.4 Destructive changes

- Prefer additive expand/backfill/contract migration.
- Back up and rehearse restore before destructive work.
- Validate row counts and integrity before and after.
- Never drop/rename a field in the same deploy that stops reading the old form unless
  rolling-deploy compatibility is proven.
- Use a later cleanup release for destructive contraction.

---

# 17. Migration Rules

## 17.1 Creation

1. Change the owning Drizzle schema.
2. Run `pnpm db:generate`.
3. Read the generated SQL in full.
4. Confirm lock behavior, defaults, nullability, indexes and constraints.
5. Add explicit custom SQL only when required and document why.
6. Test on a disposable Neon branch or production-shaped database.
7. Add migration/integration tests where risk warrants.

Never hand-edit an applied migration and never use `drizzle-kit push` against
production.

## 17.2 Compatibility

- Migrations must be safe with the currently deployed version during rolling/preview
  operation.
- Use nullable/additive columns first.
- Backfills are resumable, observable and bounded.
- Constraint enforcement follows verified normalization.
- Application deployment order is documented.

## 17.3 Production execution

- Production migration needs explicit authorization.
- Confirm backup/PITR and owner before execution.
- Record the exact migration set and expected duration.
- Monitor errors, locks, connections and application health.
- Do not automatically roll back a partially applied destructive migration; follow the
  approved forward-fix/restore plan.

## 17.4 Migration report

Record:

- migration identifiers;
- affected tables/rows;
- preflight queries;
- execution result and duration;
- postflight integrity checks;
- application version/deploy;
- rollback or forward-fix status.

---

# 18. Security Checklist

## 18.1 Every change

- [ ] All external/request values are treated as untrusted.
- [ ] Zod validation occurs at the boundary.
- [ ] Authentication is enforced server-side where required.
- [ ] Authorization uses role/ownership and cannot be bypassed by direct calls.
- [ ] User-owned query scope includes session user ID.
- [ ] Responses/errors disclose no secret or unnecessary PII.
- [ ] No credentials, tokens, cookies or provider secrets enter logs/client props.
- [ ] Public loopable operations have persistent rate limits.
- [ ] Cache behavior cannot expose private/user/admin data.
- [ ] Uploads restrict size, type, key/folder and ownership.
- [ ] Admin mutations use mandatory role + 2FA guard and audit behavior.
- [ ] Dependencies and external content are not implicitly trusted.

## 18.2 Commerce changes

- [ ] Prices, discounts, shipping and totals are recomputed server-side.
- [ ] Money remains integer poisha with currency.
- [ ] Stock updates are conditional and transactional.
- [ ] Inventory changes are explainable and idempotent where repeatable.
- [ ] Payment callbacks are independently provider-verified.
- [ ] Amount, currency and order reference are reconciled.
- [ ] Payment attempt history remains separate.
- [ ] Retryable callback failures remain retryable.
- [ ] Cancellation and completed refund remain distinct.
- [ ] External side effects occur after commit or through a durable outbox.

## 18.3 Platform/release

- [ ] Environment variables validate at startup/build as appropriate.
- [ ] Production, preview and local credentials are separated.
- [ ] Preview uses sandbox payment credentials.
- [ ] Security headers and CSP remain effective.
- [ ] Cloudflare does not cache/challenge auth, checkout, admin or callbacks.
- [ ] Dependency audit has no unapproved high/critical findings.
- [ ] Backup and restore path is known.
- [ ] Sensitive operational access uses least privilege.
- [ ] Secret rotation impact is documented.

## 18.4 Security exceptions

No critical/high security exception is implicit. An exception requires risk evidence,
compensating control, owner, expiry date and architect/Product Owner approval. Release
notes must name it.

---

# 19. Performance Checklist

## 19.1 Approved budgets

The approved SAS budgets govern release acceptance. Route-specific stricter targets
may be used when the approved baseline supports them.

| Metric | Target | Maximum launch threshold |
|---|---:|---:|
| LCP, p75 mobile | <= 2.0 s | 2.5 s |
| INP, p75 | <= 150 ms | 200 ms |
| CLS, p75 | <= 0.05 | 0.10 |
| TTFB, cached public page | <= 300 ms | 500 ms |
| Initial JS, critical storefront route | <= 120 KB gzip target | Approved exception required |
| Lighthouse performance, representative mobile | >= 90 | No regression below approved baseline |
| Image layout shift | 0 expected | 0.02 page total |

Measure on representative mobile hardware/network settings. Real-user p75 data takes
priority when a sufficient sample exists.

## 19.2 Rendering

- [ ] Server Component is used unless browser interactivity requires a client boundary.
- [ ] Client boundary is the smallest practical subtree.
- [ ] No duplicate client fetch exists for server-available data.
- [ ] Slow independent regions stream when useful.
- [ ] Suspense/loading UI preserves final layout geometry.
- [ ] Shared cached output contains no personalization.
- [ ] Dynamic private/commerce routes are not incorrectly cached.

## 19.3 JavaScript and dependencies

- [ ] New client-side code has a justified interaction need.
- [ ] Bundle impact is measured for new libraries/client boundaries.
- [ ] Heavy admin-only tools do not inflate storefront bundles.
- [ ] No duplicate utility/library capability is shipped.
- [ ] Third-party scripts are deferred, consent-aware and approved.
- [ ] No continuous hydration/state subscription exists without need.

## 19.4 Images and fonts

- [ ] Every image has explicit dimensions or stable aspect ratio.
- [ ] `sizes` matches real responsive slots.
- [ ] Transformations go through the storage abstraction.
- [ ] Only the likely LCP image is preloaded/priority.
- [ ] Below-fold images lazy-load.
- [ ] Asset quality and dimensions suit the role; original camera files are not shipped.
- [ ] Fonts use the approved self-hosted/Next.js strategy and do not cause layout shift.

## 19.5 Data and caching

- [ ] No N+1 query was introduced.
- [ ] List queries select only required columns and paginate.
- [ ] Critical query changes are measured with production-shaped data.
- [ ] Indexes respond to measured query plans.
- [ ] Cache keys include every output-changing input.
- [ ] Mutations invalidate tags only after successful commit.
- [ ] Cache is never authoritative for money, stock or payment.
- [ ] Build/preview does not depend on production data.

## 19.6 Motion

- [ ] Motion uses transform/opacity where possible.
- [ ] Large blurred/translucent areas do not animate continuously.
- [ ] Layout properties are not animated on scroll.
- [ ] Off-screen/nonessential motion stops.
- [ ] Reduced-motion preference is honored.

## 19.7 Performance evidence

For a performance-sensitive phase record:

- route and scenario;
- baseline and post-change values;
- tool/profile used;
- bundle difference;
- query evidence if relevant;
- approved exception with owner/expiry if a threshold is exceeded.

---

# 20. Accessibility Checklist

All customer and admin experiences target WCAG 2.2 AA.

## 20.1 Structure

- [ ] Page has one logical `h1`.
- [ ] Heading levels follow content hierarchy.
- [ ] `header`, labeled `nav`, `main`, `aside` and `footer` landmarks are appropriate.
- [ ] A visible-on-focus skip link reaches main content.
- [ ] Repeated navigation regions have distinct accessible labels.
- [ ] Lists, tables and forms use semantic elements.
- [ ] Page/document language is correct.

## 20.2 Keyboard and focus

- [ ] Every action works with keyboard alone.
- [ ] Focus order follows reading/interaction order.
- [ ] Focus-visible styling is always perceivable.
- [ ] Dialog/drawer focus is trapped and restored.
- [ ] Escape closes dismissible overlays.
- [ ] No information or action requires hover only.
- [ ] Drag interaction has a keyboard alternative.
- [ ] Loading/navigation does not lose or strand focus.

## 20.3 Forms

- [ ] Every control has a programmatic label.
- [ ] Help/error text is linked with `aria-describedby`.
- [ ] Invalid fields use `aria-invalid` and are not identified by color alone.
- [ ] Error summary/focus behavior is appropriate for multi-field failures.
- [ ] Constraints and formats are stated before errors.
- [ ] Correct autocomplete tokens are used.
- [ ] Password managers and paste are supported.
- [ ] Async status uses a restrained live region when needed.

## 20.4 Visual and content

- [ ] Normal text contrast is at least 4.5:1; large text at least 3:1.
- [ ] Focus/UI boundaries meet non-text contrast.
- [ ] Glass surfaces pass contrast over every supported background/image.
- [ ] Meaning does not rely on color, position or motion alone.
- [ ] Touch targets are at least 44 x 44 CSS pixels where practical.
- [ ] Content works at 200% text zoom and 400% reflow.
- [ ] Product images have useful alt text; decorative imagery uses empty alt.
- [ ] Icon-only controls have accessible names.
- [ ] Price, discount, availability and status are screen-reader understandable.

## 20.5 Motion and media

- [ ] `prefers-reduced-motion` removes nonessential parallax/large movement/autoplay.
- [ ] No flashing content violates safety thresholds.
- [ ] Autoplaying media can be paused/stopped and does not block navigation.
- [ ] Video/audio has required captions/transcript where applicable.

## 20.6 Required test mix

- [ ] Automated axe check on representative changed routes, once available.
- [ ] Keyboard-only journey.
- [ ] Screen-reader spot check for a changed critical interaction.
- [ ] 200% zoom and narrow reflow.
- [ ] Reduced-motion and high-contrast checks.
- [ ] Manual review; zero automated violations alone is not acceptance.

---

# 21. SEO Checklist

SEO work follows launch readiness. Do not enable public indexing before approved brand,
policy, domain and content requirements are ready.

## 21.1 Indexation

- [ ] Indexable routes are explicitly approved.
- [ ] Cart, checkout, account, order lookup/history, admin and internal search states
  are explicitly noindex where required.
- [ ] `robots.ts` and `sitemap.ts` reflect the same policy.
- [ ] Preview/staging environments cannot be indexed.
- [ ] Canonical URL uses the approved production domain and normalized route.

## 21.2 Metadata

- [ ] Unique title and description represent the actual page.
- [ ] Approved brand replaces generic placeholder metadata.
- [ ] Open Graph/social image and text are correct.
- [ ] Product availability, price and currency metadata match server facts.
- [ ] Pagination/filter variants do not create uncontrolled duplicate pages.
- [ ] Metadata does not expose private search/order/account values.

## 21.3 Structured data

- [ ] JSON-LD type is appropriate: Organization, Product, Offer, Breadcrumb, etc.
- [ ] Structured claims match visible content.
- [ ] Price/availability come from authoritative server data.
- [ ] Review ratings are emitted only for valid, approved review data.
- [ ] Markup validates without fabricated fields.

## 21.4 Technical/content

- [ ] Semantic headings and internal links support discovery.
- [ ] Product/category slugs remain stable or have redirects.
- [ ] Not-found and discontinued product behavior is intentional.
- [ ] Images have useful alt text and reasonable filenames.
- [ ] Policy, privacy, returns/terms and contact pages exist before launch.
- [ ] No unsupported marketing, health, performance or sustainability claim is added.

---

# 22. Responsive Design Checklist

## 22.1 Mobile-first rules

- Start from the narrowest supported viewport and enhance progressively.
- Do not merely scale desktop; reorder and simplify according to the approved mobile
  wireframe.
- Primary product facts and conversion actions remain discoverable without excessive
  scrolling or hidden gestures.
- Horizontal page scrolling is prohibited at 320 CSS pixels unless the content is a
  deliberately scrollable region with a clear affordance.

## 22.2 Test matrix

Minimum manual widths:

| Context | Width |
|---|---:|
| Narrow mobile | 320 px |
| Common mobile | 375/390 px |
| Large mobile | 430 px |
| Tablet portrait | 768 px |
| Small laptop/tablet landscape | 1024 px |
| Desktop | 1280/1440 px |
| Wide desktop | 1920 px spot check |

Also test content stress: long product titles, large prices, missing image, one/many
variants, validation errors, zoom, translated/Bangla copy where approved and empty
states.

## 22.3 Checklist

- [ ] Navigation follows approved mobile/desktop patterns.
- [ ] Tap targets remain 44 x 44 where practical.
- [ ] Text remains readable without zoom.
- [ ] Grid columns and gaps follow tokens.
- [ ] Images preserve intended crops without layout shift.
- [ ] Sticky elements do not cover fields/actions/content.
- [ ] On-screen keyboard does not hide the active field/action.
- [ ] Drawer/dialog fits viewport and scrolls internally when necessary.
- [ ] Tables have an approved mobile treatment.
- [ ] Forms use correct input types/autocomplete and avoid unintended mobile zoom.
- [ ] Landscape and reduced-height behavior is usable.
- [ ] No breakpoint-only content creates an accessibility discrepancy.

---

# 23. UI/UX Checklist

The approved DDS and wireframes own visual/product decisions. If either is missing for a
visual task, Work stops instead of inventing the design.

## 23.1 Fidelity

- [ ] Section order, purpose and content contract match the wireframe.
- [ ] Colors, type, spacing, radius, glass, elevation and icons use approved tokens.
- [ ] Existing reusable components are used where their contract fits.
- [ ] No unapproved section, copy, badge, offer or claim was added.
- [ ] Desktop and mobile behavior match their approved specifications.

## 23.2 Commerce clarity

- [ ] Product title, image, price, variant, availability and primary action have clear
  hierarchy.
- [ ] Discount presentation is truthful and comprehensible.
- [ ] Trust content is evidence-based, current and not decorative misinformation.
- [ ] Delivery/payment facts match configured behavior.
- [ ] Disabled/unavailable actions explain why and how to recover.
- [ ] Destructive/financial actions require appropriate confirmation.

## 23.3 Interaction states

- [ ] Default, hover, active, focus-visible, disabled and loading states exist.
- [ ] Empty, error, offline/unavailable and partial-data states are designed.
- [ ] Pending actions prevent accidental duplicate submission where necessary.
- [ ] Success feedback is visible and announced when appropriate.
- [ ] Back/refresh/deep-link behavior preserves expected URL state.
- [ ] Animation supports comprehension and never delays primary tasks.

## 23.4 Content

- [ ] Copy is concise, specific and approved.
- [ ] Labels use customer language, not internal status codes.
- [ ] Error copy explains the recovery action.
- [ ] Placeholder content cannot ship accidentally.
- [ ] Dates, money and phone/address formats are locally appropriate.
- [ ] AI-generated content is reviewed and has provenance where required.

---

# 24. Animation Guidelines

## 24.1 Purpose

Motion may explain hierarchy, confirm action, preserve spatial context or add restrained
brand character. Motion must not compensate for unclear layout.

## 24.2 Approved categories

- **Micro feedback:** button press, toggle, validation and cart confirmation.
- **State transition:** drawer, dialog, accordion and filter changes.
- **Entrance/reveal:** restrained section/content appearance where it aids orientation.
- **Brand expression:** rare approved hero/background motion.

## 24.3 Rules

- Use DDS duration/easing tokens; do not invent local values.
- Prefer transform and opacity.
- Keep micro interactions generally around 100-200 ms and standard transitions around
  180-300 ms unless the DDS defines otherwise.
- Avoid long stagger sequences, scroll-jacking and forced waiting.
- Do not continuously animate large glass blur, shadows or layout.
- Never animate price, stock or order state in a way that obscures the final fact.
- Prevent cumulative layout shift.
- Pause/stop motion when off-screen or page visibility changes where relevant.
- Use CSS before a dependency when CSS satisfies the requirement.

## 24.4 Reduced motion

With `prefers-reduced-motion: reduce`:

- remove parallax, large translation, autoplay and decorative looping;
- replace spatial transitions with near-instant fades/state changes;
- preserve all information and functionality;
- never hide feedback simply because motion is reduced.

## 24.5 Approval gate

A new animation library requires the dependency approval process and measured bundle
impact. No library is approved merely because a reference design uses one.

---

# 25. Error Handling Standards

## 25.1 Error classes

| Class | Behavior |
|---|---|
| Validation | Field/form guidance; preserve safe input |
| Authentication | Safe sign-in/reverification path; avoid account enumeration |
| Authorization | Non-revealing response; log security context where appropriate |
| Conflict | Explain stale stock/state or duplicate action and recovery |
| Not found | Safe route/domain-specific recovery |
| External unavailable | Retry guidance without claiming success |
| Unexpected | Generic customer message plus internal correlation context |

## 25.2 Standards

- Expected errors use typed codes/results, not message-string parsing.
- User messages are actionable, safe and non-technical.
- Unexpected errors do not reveal stack, SQL, provider payload or secret.
- Error boundaries exist at useful recovery scopes.
- A failed mutation never displays success.
- Partial writes are prevented by transactions or represented as an explicit recoverable
  state.
- External calls have timeouts and retry classification.
- Retry is bounded and idempotent; do not retry non-idempotent work blindly.
- Audit/payment/inventory errors that affect an invariant are not swallowed.
- Cache invalidation happens only after successful persistence.

## 25.3 UI behavior

- Place field errors close to fields and connect them programmatically.
- Use a form summary when multiple failures make recovery difficult.
- Preserve non-sensitive user input after recoverable errors.
- Maintain/focus a logical recovery target.
- Avoid toasts as the only record of a critical error.
- Provide an explicit retry only when retry is safe.

---

# 26. Logging Standards

## 26.1 Structured logging

Logs should include safe, useful fields:

- timestamp (platform supplied where applicable);
- severity;
- event/action name;
- correlation/request ID;
- module/route;
- safe entity identifiers;
- result/error code;
- duration and provider status class where useful;
- retry/attempt metadata.

Use stable event names. Do not build monitoring from free-form prose alone.

## 26.2 Never log

- passwords, TOTP secrets or backup codes;
- session tokens/cookies;
- API/store/database secrets;
- full payment provider payloads by default;
- bank account/receipt data beyond approved reconciliation fields;
- full addresses, phone numbers or email when not operationally required;
- exported account data;
- future raw AI prompts containing customer/order data;
- authorization headers.

Redact or hash identifiers when the operational question does not require the original.

## 26.3 Severity

| Level | Meaning |
|---|---|
| Debug | Local/temporary diagnostics; not committed as noisy production output |
| Info | Expected lifecycle fact useful for operations |
| Warn | Recoverable anomaly requiring visibility |
| Error | Failed operation or degraded correctness requiring action |
| Critical | Payment, inventory, security, data-loss or widespread outage risk |

## 26.4 Audit vs operational log

Audit logs record who performed an administrative mutation and what business entity
changed. Operational logs diagnose runtime behavior. One does not replace the other.

Successful admin mutations require an audit entry. If audit reliability conflicts with
a critical transaction, follow the approved transactional/outbox design; do not invent
silent best-effort behavior in a new path.

---

# 27. Testing Standards

## 27.1 Test layers

| Layer | Purpose |
|---|---|
| Static | TypeScript, ESLint and module-boundary correctness |
| Unit | Pure validation, money, transition and helper rules |
| Component | Interactive behavior, semantics and accessibility |
| Integration | Database transactions and module cooperation |
| End-to-end | Customer/operator journeys across boundaries |
| Non-functional | axe, Lighthouse, load, security and restore behavior |

## 27.2 General rules

- A behavior change includes a test at the lowest level that proves the risk.
- A regression fix starts with or includes a test that would have failed before it.
- Test outcomes, not internal implementation details.
- Keep tests deterministic; control time, randomness and provider responses.
- Use production-shaped factories without production customer data.
- Payment tests use sandbox or sanitized fixtures.
- Avoid broad snapshots for important business behavior.
- Do not weaken/delete a test to accept an unapproved behavior change.
- Flaky tests are defects; quarantine only with owner, reason and expiry.

## 27.3 Mandatory commerce coverage

- concurrent buyers of the last unit;
- tampered price/discount/shipping;
- duplicate order submission;
- stale cart price/stock;
- idempotent hold expiry/cancellation;
- inventory adjustment ledger;
- variant/product ownership scoping;
- forged/duplicate/retryable payment callbacks;
- amount/currency mismatch;
- payment-attempt isolation;
- atomic manual verification;
- refund-required versus refund-completed;
- IDOR and admin 2FA;
- guest lookup matching and rate limiting.

## 27.4 Storefront coverage

- search/filter/sort/pagination URL behavior;
- product/category not-found and empty states;
- responsive navigation/cart;
- keyboard product/variant/cart path;
- metadata/canonical/noindex policy;
- reduced-motion behavior and glass contrast;
- loading/error recovery.

## 27.5 Commands

Current repository gates:

~~~bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm audit --audit-level high
~~~

Run release-equivalent gates on Node 22 with the pinned pnpm lockfile. Add integration,
Playwright/axe and Lighthouse commands to package scripts when those approved systems
are introduced.

## 27.6 Test acceptance

Report exact counts/results. If a build fails because required preview data or provider
configuration is unavailable, identify the precise phase and evidence that compilation
passed. Do not label the overall build passed.

---

# 28. CI/CD Standards

## 28.1 Current minimum CI

The current GitHub Actions workflow uses Node 22 and runs:

1. frozen-lockfile install;
2. typecheck;
3. lint;
4. unit tests;
5. production build with non-secret placeholders;
6. dependency audit at high severity.

All gates must be green or have an explicitly approved, time-bounded exception. At the
time of the approved repository audit, dependency advisories are known blockers; they
must not be normalized as acceptable release noise.

## 28.2 Required evolution

As infrastructure is approved, CI must add:

- isolated production-shaped preview database;
- affected-domain integration tests;
- selected Playwright customer/admin journeys;
- axe accessibility checks;
- Lighthouse/bundle budgets;
- migration validation;
- secret/dependency scanning;
- preview health verification.

## 28.3 Pipeline rules

- CI uses pinned Node 22 and pnpm/lockfile.
- Real secrets are not exposed to untrusted PRs.
- Preview uses isolated data and sandbox providers.
- Production deployment is gated by protected branch/review policy.
- Migration ordering and application compatibility are explicit.
- Concurrency cancels obsolete preview verification where safe.
- A deploy is not a release until smoke checks pass.
- Scheduled jobs are idempotent and authenticated.

## 28.4 Failure handling

- Do not rerun repeatedly to hide a deterministic failure.
- Capture failing step, relevant log excerpt and local reproduction.
- Separate infrastructure flakiness from code failure using evidence.
- Do not bypass a security or migration gate to publish.
- If production deployment succeeds but verification fails, follow rollback/incident
  procedure immediately.

---

# 29. Documentation Rules

## 29.1 Documentation is part of the change

Update documentation in the same commit when a change affects:

- architecture/module ownership;
- database shape or migration procedure;
- external API/callback contract;
- authentication/authorization/security control;
- caching/performance budget;
- environment variables/provider setup;
- user/admin operational workflow;
- release, rollback or incident behavior;
- approved Design System/wireframe contract.

## 29.2 Current vs recommended state

Architecture documents distinguish:

- **Current State** — verified implementation today;
- **Recommended State** — approved target;
- **Migration Strategy** — safe staged path.

Do not describe planned Playwright, monitoring, outbox, shadcn primitives or AI as
implemented until source/configuration proves it.

## 29.3 Writing rules

- Use direct, testable statements.
- Explain why a non-obvious rule exists.
- Include exact commands/paths only when verified.
- Keep secrets and production payloads out of examples.
- Use diagrams only when they clarify non-trivial flow/state/ownership.
- Keep links relative inside repository documents.
- State assumptions, owners and exit criteria for temporary guidance.
- Date or version operational facts likely to become stale.

## 29.4 ADR requirement

Create an Architecture Decision Record before implementing a material change to:

- tech stack/provider;
- module boundaries;
- authoritative data model;
- payment/inventory/order state;
- public API contract;
- authentication/session model;
- caching identity;
- AI authority or customer-data use.

An ADR includes problem, options, decision, consequences, security/cost/performance
impact, migration and rollback.

## 29.5 Documentation validation

- Check headings and Markdown fence balance.
- Confirm file/route/script references exist.
- Review internal links where tooling is available.
- Confirm the documentation-only diff does not include application files.
- Keep SAS/MDG/DDS terminology consistent.

---

# 30. Code Review Checklist

## 30.1 Scope and intent

- [ ] PR matches an approved phase/task.
- [ ] Acceptance criteria are traceable to the diff/tests.
- [ ] No unrelated cleanup or generated changes exist.
- [ ] Protected modules are unchanged or explicitly approved.
- [ ] Product/design decisions match approved documents.

## 30.2 Architecture

- [ ] `app -> modules -> lib` direction is preserved.
- [ ] Cross-module imports use public barrels except documented exceptions.
- [ ] Server/client boundary is minimal and safe.
- [ ] Repositories/services/actions/components own the right responsibilities.
- [ ] Provider SDK is behind the adapter.
- [ ] No unjustified abstraction/dependency/service was added.

## 30.3 Correctness/security

- [ ] Boundary validation exists.
- [ ] Auth/role/ownership checks are server-side and query-scoped.
- [ ] Money, snapshot, stock, payment and inventory invariants hold.
- [ ] Repeatable/external operations are idempotent.
- [ ] Failure cannot leave contradictory partial state.
- [ ] Errors/logs/caches expose no sensitive data.
- [ ] Admin mutation audit behavior is correct.

## 30.4 UI quality

- [ ] DDS/wireframe fidelity is demonstrated.
- [ ] All interaction/empty/error/loading states exist.
- [ ] Responsive matrix passes.
- [ ] Keyboard, focus, semantics, contrast and reduced motion pass.
- [ ] Copy/claims/data are approved and truthful.

## 30.5 Performance

- [ ] No unnecessary client JavaScript or fetch.
- [ ] Images/fonts/layout meet rules.
- [ ] No N+1 or unmeasured critical query/index.
- [ ] Cache safety/invalidation is correct.
- [ ] Baseline/budget evidence is included where applicable.

## 30.6 Tests and operations

- [ ] Tests prove the changed risks and failure paths.
- [ ] Full required gates pass on Node 22.
- [ ] Migration/deploy order and rollback are reviewed.
- [ ] Documentation is synchronized.
- [ ] Observability/alerting is sufficient for the risk.
- [ ] No unresolved critical/high issue is hidden in follow-up work.

---

# 31. Release Checklist

## 31.1 Release authorization

- [ ] Product Owner approved scope/content/policies.
- [ ] Architect/UX Director approved architecture and visual fidelity.
- [ ] Required PR reviews and CI are green.
- [ ] No critical payment, inventory, security or data-integrity blocker remains.
- [ ] High dependency findings are remediated or explicitly time-bounded/approved.
- [ ] Rollback owner and method are confirmed.

## 31.2 Pre-deploy

- [ ] Release commit/branch/tag is exact and recorded.
- [ ] Node 22 production build passes.
- [ ] Production environment variables are complete and validated.
- [ ] Production/preview credentials and databases are separated.
- [ ] Schema migrations are reviewed and rehearsed.
- [ ] Backup/PITR and restoration access are confirmed.
- [ ] Cloudflare/DNS/TLS/cache/WAF rules are reviewed.
- [ ] Payment webhook/callback routes bypass inappropriate cache/challenge.
- [ ] Email domain/from address and operational contacts are valid.
- [ ] Cron secrets/site URL and scheduled jobs are valid.
- [ ] Policy/contact/returns/privacy/terms content is approved for commercial launch.

## 31.3 Deploy

- [ ] Record start time, operator and target.
- [ ] Apply migrations in approved order.
- [ ] Deploy the exact reviewed commit.
- [ ] Monitor deployment, migration, error and provider logs.
- [ ] Do not make parallel manual production changes.

## 31.4 Smoke test

- [ ] Production domain, HTTP->HTTPS and canonical host work.
- [ ] Security headers remain present.
- [ ] Homepage, collection, product, search and cart load.
- [ ] Register/sign-in/account session behavior works.
- [ ] Guest and signed-in carts do not cross identities.
- [ ] Checkout recomputes real totals/stock.
- [ ] Sandbox/live payment verification follows the approved release stage.
- [ ] Bank-transfer instructions contain approved real details.
- [ ] Order confirmation/history/lookup work.
- [ ] Admin requires role and 2FA.
- [ ] Hold-release cron rejects missing secret and succeeds with the secret.
- [ ] Monitoring/alerts receive expected signals.

## 31.5 Post-release

- [ ] Watch errors, payment callback failures, checkout success and latency.
- [ ] Confirm no inventory drift or duplicated transition.
- [ ] Compare Core Web Vitals/error rates to baseline.
- [ ] Record release outcome and known issues.
- [ ] Close or execute rollback decision within the agreed observation window.

Commercial launch remains blocked until SAS Phase D hardening exit criteria pass.

---

# 32. Rollback Procedure

## 32.1 Principles

- Protect customer data, payment truth and inventory truth before uptime optics.
- Roll back application code only when it remains compatible with the current schema.
- Never reverse a destructive migration casually.
- Stop incoming harmful traffic/actions when continued processing would worsen damage.
- Maintain an incident timeline and decision owner.

## 32.2 Procedure

1. **Detect and classify** — identify user impact, affected version, payment/inventory
   risk and whether data mutation continues.
2. **Assign owner** — one release/incident decision maker.
3. **Contain** — disable the affected feature/provider route through an approved safe
   control, pause deploys/jobs or apply WAF restrictions when appropriate.
4. **Preserve evidence** — record logs, event IDs, release commit and database state;
   do not expose sensitive payloads.
5. **Choose recovery:**
   - redeploy last known-good application if schema-compatible;
   - feature-off/config reversal if designed and safe;
   - forward-fix for additive schema/state defects;
   - restore from backup only under the approved data-recovery plan.
6. **Execute** — use the exact approved target; avoid unrelated changes.
7. **Verify** — repeat critical smoke checks and reconcile payment/inventory/order facts.
8. **Communicate** — state impact, current safety and remaining recovery.
9. **Review** — write root cause, missing control/test and prevention action.

## 32.3 Database rollback

- Additive migrations usually remain while application code rolls back.
- A destructive migration needs a rehearsed restore/forward plan before release.
- Never delete customer/payment/order rows to make a test pass.
- After recovery, run integrity queries for affected orders, payments, events, stock and
  movements.

## 32.4 Rollback success

Rollback is complete only when:

- harmful behavior is stopped;
- affected critical journeys pass;
- payment and inventory reconciliation is complete or has an owned action plan;
- monitoring is stable;
- stakeholders receive a clear status;
- follow-up defects are tracked.

---

# 33. Hotfix Procedure

## 33.1 Qualification

A hotfix is for an active production issue such as:

- payment confirmation/refund corruption;
- stock oversell/double release;
- authentication/authorization bypass;
- customer data exposure;
- checkout/order outage;
- critical dependency exploit with relevant exposure;
- widespread broken release.

Visual polish and routine enhancements are not hotfixes.

## 33.2 Workflow

1. Create `hotfix/<scope>` from the exact production commit.
2. Reproduce or capture the failure safely.
3. Add the smallest regression test possible.
4. Implement the smallest safe correction.
5. Run focused tests plus typecheck, lint, full unit tests and build.
6. Run security/commerce checks appropriate to impact.
7. Obtain expedited but independent review.
8. Document deploy and rollback.
9. Deploy with explicit authorization.
10. Smoke test and monitor/reconcile.
11. Merge the fix back into every active branch that contains the defect.
12. Complete a post-incident review.

## 33.3 Restrictions

- Do not bundle refactoring or feature work.
- Do not skip authorization, tests or rollback planning because the change is urgent.
- Do not force-push protected branches.
- Do not silently edit production data. If reconciliation requires data correction,
  use a reviewed, auditable script/query with backup and post-checks.

---

# 34. Prompt Template for Future Work Sessions

Copy and complete this template. Remove sections that truly do not apply, but do not
leave scope ambiguous.

~~~markdown
You are the Senior Implementation Engineer for AgentSiraji Commerce V2.

Follow these documents in order:
1. `docs/architecture/AGENTSIRAJI_COMMERCE_V2_SAS.md`
2. `docs/architecture/MASTER_DEVELOPMENT_GUIDE.md`
3. [approved DDS path]
4. [approved wireframe/specification path]

CURRENT PHASE
[phase identifier and name]

CURRENT TASK
[one bounded implementation outcome]

APPROVED GOAL
[what user/business outcome this task must produce]

IN SCOPE
- [routes]
- [modules]
- [components/behavior]

OUT OF SCOPE
- [explicit exclusions]

PROTECTED MODULES
- [list from MDG/SAS plus phase-specific protected areas]

ACCEPTANCE CRITERIA
1. [testable result]
2. [testable result]
3. [responsive/accessibility/failure requirement]

REQUIRED VERIFICATION
- [focused tests]
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- [integration/e2e/axe/Lighthouse/manual matrix]

GIT INSTRUCTIONS
- Branch: `[branch]`
- Commit: [yes/no; exact timing]
- Push: [yes/no]
- PR: [yes/no/draft]

RULES
- Inspect current code and relevant documents before editing.
- Do not make product, architecture or visual decisions.
- Reuse existing components and preserve module boundaries.
- Modify only required files; never regenerate unchanged files.
- Validate after each completed task.
- Stop and report any conflict or need to touch protected scope.
- Stop immediately when this task is complete.

FINAL REPORT
Use the MDG Phase Completion Report Template and include exact evidence.
~~~

---

# 35. Daily Progress Report Template

Use this for a workday or long session. Do not mark an item complete without evidence.

~~~markdown
# AgentSiraji Commerce V2 — Daily Progress Report

**Date:** YYYY-MM-DD
**Phase:**
**Branch:**
**Starting commit:**
**Current commit:**
**Status:** On track / At risk / Blocked

## Approved objective

[One concise statement]

## Completed today

- [Task and observable outcome]

## Files changed

- `path` — [reason]

## Verification run

| Check | Result | Evidence/notes |
|---|---|---|
| Focused tests | Pass/Fail/Not run | |
| Typecheck | Pass/Fail/Not run | |
| Lint | Pass/Fail/Not run | |
| Unit tests | Pass/Fail/Not run | |
| Build | Pass/Fail/Blocked/Not run | |
| Manual responsive/a11y | Pass/Fail/Not run | |

## Decisions requested

- [Decision Work cannot make, options and impact]

## Risks or blockers

- [Severity, evidence, owner/needed action]

## Next approved task

[Next task only; do not start unapproved scope]

## Git status

- Commit created: Yes/No
- Pushed: Yes/No
- PR: [link/status or None]
~~~

---

# 36. Phase Completion Report Template

~~~markdown
# AgentSiraji Commerce V2 — Phase Completion Report

**Phase:**
**Approved scope:**
**Branch:**
**Final commit:** [hash or Not committed]
**Status:** Complete / Incomplete / Blocked

## Outcome

[Lead with the implemented outcome in plain language.]

## Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| [criterion] | Pass/Fail/Blocked | [test, route, screenshot or note] |

## Changed files

| File | Purpose |
|---|---|
| `path` | [why required] |

## Reuse and architecture

- Reused: [components/services/patterns]
- Module boundary impact: [none/details]
- Protected modules: [confirmed unchanged or approved impact]
- New dependency: [none or approval reference]
- Database migration: [none or identifiers]

## Verification

| Gate | Result | Details |
|---|---|---|
| Focused tests | | |
| Typecheck | | |
| Lint | | |
| Unit tests | | |
| Integration/e2e | | |
| Build | | |
| Dependency audit | | |
| Accessibility | | |
| Responsive visual review | | |
| Performance | | |
| Security/invariant review | | |

## Risks, limitations and follow-up

- [No hidden follow-up; state severity and launch effect]

## Deployment and rollback

- Deployment performed: Yes/No
- Migration performed: Yes/No
- Rollback method: [summary/not applicable]

## Git actions

- Commit: [hash/message or Not performed]
- Push: [branch/remote or Not performed]
- PR: [link or Not opened]

## Completion declaration

[State why the phase meets the MDG Definition of Done, or why it remains blocked.]
~~~

---

# Appendix A — Protected Modules

The following areas are protected during storefront visual phases unless the approved
task explicitly names a separate hardening change:

- authentication and session guards;
- account ownership and data-rights logic;
- mandatory admin role and 2FA enforcement;
- guest/signed-in cart ownership;
- checkout and order-placement transactions;
- SSLCommerz provider adapter, IPN/callback routes and validation;
- manual bank-transfer verification;
- order, payment and refund state meanings;
- stock reservation, decrement, expiry and release;
- shipping calculation;
- admin operational mutations;
- database schemas and migrations;
- money utilities;
- storage provider abstraction;
- order-item/address snapshots;
- rate-limit infrastructure;
- audit-log infrastructure;
- proxy/auth cookie-prefix/security coupling;
- module-boundary lint rules.

Protected does not mean permanently frozen. It means changes require an explicit,
separately reviewed scope with risk-specific tests and rollback.

---

# Appendix B — Protected Business Rules

1. The platform is a single-vendor physical-products store.
2. It is not a marketplace; no seller, vendor commission or payout model is added.
3. Checkout currency is BDT unless a future architecture decision changes it.
4. Amounts are stored/calculated in integer poisha.
5. Guest checkout remains a first-class supported journey.
6. Every sellable product has one or more variants.
7. Order history preserves purchase-time product, price and address facts.
8. Customer role cannot be elevated from registration/request input.
9. Admin access requires role plus second factor.
10. Provider-hosted payment keeps raw card data outside this application.
11. Reviews, promotions, wishlists and AI are not implemented until separately
    approved with their data/abuse/measurement rules.
12. Policy, return, contact and marketing claims are Product Owner decisions, not
    implementation placeholders.

---

# Appendix C — Protected Commerce Invariants

Violating any item is a defect even if a task appears to request it.

1. Money uses integer minor units and carries currency.
2. Client-supplied price, total, shipping or discount is never authoritative.
3. Order items and addresses are immutable purchase-time snapshots.
4. Stock decrement is conditional and transactional.
5. Inventory movements remain append-only and stock changes explainable.
6. A repeated release/cancellation cannot restore stock twice.
7. Payment notifications are independently provider-verified.
8. Provider event processing is idempotent and retryable failures remain retryable.
9. Each payment attempt remains individually attributable.
10. Amount, currency and order identity are reconciled before marking paid.
11. Manual payment attempt and order confirmation transition atomically.
12. Cancellation/refund-required does not mean money was refunded.
13. A completed refund needs external evidence/reconciliation.
14. User-owned queries include session ownership in the query condition.
15. Server Action input is validated before business work.
16. Successful admin mutations are audited.
17. Public abuse targets use persistent rate limiting.
18. External/repeatable state transitions use stable idempotency keys.
19. Cache is never authoritative for money, stock, payment or private user state.
20. AI cannot authoritatively mutate price, payment, inventory or order state.

---

# Appendix D — AI Implementation Rules

## D.1 Entry gate

An AI feature may begin only when all are approved:

- measurable customer/operator problem;
- deterministic baseline;
- representative evaluation set and success/failure measures;
- privacy/data classification;
- cost/latency budget;
- grounded data sources and freshness rules;
- human oversight and correction path;
- failure/fallback behavior;
- rate limits and abuse model;
- independent kill switch;
- logging/retention plan.

## D.2 Authority boundaries

AI may assist discovery, summarize approved product facts, draft content for human
review or provide non-authoritative support. AI must not:

- set/alter prices or discounts;
- approve payments/refunds;
- change stock/reservations;
- create or transition orders without deterministic validated user intent;
- bypass authorization;
- invent product, delivery, policy or safety claims;
- expose data the requesting user could not retrieve deterministically.

## D.3 Data and retrieval

- Authorize before retrieval, not after model generation.
- Treat product, customer and retrieved text as untrusted content.
- Separate system policy from retrieved data.
- Minimize/redact customer/order data sent externally.
- Do not use customer data for training without a separate approved legal/privacy basis.
- Preserve source/provenance and freshness for grounded answers.
- Never send secrets, credentials, session tokens or full payment payloads.

## D.4 Output and action safety

- Validate model/tool output with deterministic schemas.
- Re-check business rules server-side.
- Show uncertainty and a deterministic fallback.
- Escalate high-impact support/payment/order cases to a human.
- Log safe metadata and evaluation outcomes, not sensitive raw prompts by default.
- Apply cost, token, time and request limits.
- Cache only privacy-safe results with explicit freshness/identity keys.

## D.5 Approval and release

AI work uses a separate phase/PR. It includes red-team cases for prompt injection,
cross-user leakage, unsupported claims, tool misuse and excessive cost. AI failure may
degrade the enhancement but must not break deterministic commerce.

---

# Appendix E — Refactoring Rules

## E.1 When refactoring is allowed

Refactor when:

- required to implement the approved task safely;
- a touched file crosses the strong split threshold and has clear responsibilities;
- tests expose duplicated/ambiguous domain rules;
- a separately approved refactoring phase exists.

Do not refactor merely to match personal style.

## E.2 Refactoring contract

- State whether behavior must remain unchanged.
- Establish characterization tests before risky structural changes.
- Split moves/renames from behavior where practical.
- Preserve public module APIs unless an approved migration exists.
- Keep database/provider behavior stable.
- Measure performance before claiming improvement.
- Update architecture documentation if ownership/boundaries change.
- Do not combine visual redesign, business-state repair and broad cleanup.

## E.3 Large-file split

Split by domain responsibility: reads vs writes, orchestration vs transition rules,
page section vs primitive. Do not create tiny files that force readers to chase one
cohesive algorithm through multiple layers.

---

# Appendix F — Dependency Approval Rules

No new runtime or development dependency is added without approval.

## F.1 Proposal

Provide:

1. Problem and why current stack/platform cannot solve it adequately.
2. Alternatives considered, including no dependency.
3. Package ownership/maintenance/release health.
4. License compatibility.
5. Security history/advisories and transitive risk.
6. Runtime/client bundle impact.
7. Node/React/Next compatibility.
8. Data/privacy/network behavior.
9. Exit/replacement strategy.
10. Exact version/range and approval.

## F.2 Installation

- Use pnpm; do not hand-edit the lockfile.
- Review package and transitive lockfile changes.
- Run typecheck, lint, tests, build and dependency audit.
- Keep provider imports behind the relevant adapter.
- Pin versions where compatibility or supply-chain risk justifies it.
- Do not upgrade unrelated dependencies in the same PR.

## F.3 Removal

Remove unused dependencies and verify no runtime/config/lockfile references remain.
Dependency removal still receives full relevant gates.

---

# Appendix G — Documentation Update Matrix

| Change | Required documentation |
|---|---|
| Architecture/module boundary | SAS + ADR + `CLAUDE.md` summary if essential |
| Database table/relationship | Data model + migration/runbook + SAS if architectural |
| Server Action/route/webhook | API docs + provider/runbook |
| Authentication/security | Security docs + threat model/runbook |
| Cache/performance behavior | Performance docs + baseline/budget evidence |
| New environment variable | Env example/schema + deployment/runbook |
| Provider/integration | Architecture/security/operations + rollback |
| Visual token/component behavior | DDS/component documentation |
| Page hierarchy/journey | Approved wireframe/page specification |
| Release procedure | Go-live/release/rollback runbook |
| AI feature | SAS/ADR + evaluation/privacy/cost/kill-switch documentation |

Documentation changes must describe verified current behavior after implementation,
not merely intent.

---

# Appendix H — Current Known Release Blockers

This appendix is a visibility aid, not a substitute for the live issue tracker. At the
time of the approved Repository Audit/SAS, release blockers include:

- retry-safe SSLCommerz callback processing;
- isolated payment-attempt mutation;
- atomic manual-transfer confirmation;
- accurate refund lifecycle;
- idempotent stock release/cancellation;
- ledger-backed admin stock adjustment;
- variant update ownership scoping;
- bounded bank-transfer inventory hold behavior;
- high/moderate dependency advisories;
- critical commerce integration/e2e coverage;
- release-equivalent Node 22/build/preview database verification;
- monitoring, policy, SEO and operational launch gates.

Work must verify current status rather than assume this list remains unchanged. No
commercial launch is approved until Phase D exit criteria in the SAS are met.

---

## Permanent session rule

Future Work sessions may be told simply:

> Follow the approved SAS, Master Development Guide, current Design System and
> wireframe. Implement only the named phase.

That shorthand is valid only when the session still supplies a bounded task,
acceptance criteria, protected areas, required gates and Git authority. Work never
fills missing product or architecture decisions by invention.

---

End of Master Development Guide.
