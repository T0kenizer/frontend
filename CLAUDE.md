# Frontend guidelines

## General conventions

- **Wording**: Always use English for all UI-facing text (labels, placeholders, tooltips, error messages, etc.). Translate any French or other-language copy to English before committing.

## TypeScript conventions

- Use the global utility types `Optional<T>`, `Nullable<T>` and `Nullish<T>`, declared in `src/types/global.d.ts`, instead of writing `T | undefined`, `T | null` or `T | null | undefined` inline.
  - `foo: Optional<string>` ✅ — `foo: string | undefined` ❌
  - `bar: Nullable<Date>` ✅ — `bar: Date | null` ❌
  - `baz: Nullish<number>` ✅ — `baz: number | null | undefined` ❌

## UI components

Resolution order (follow strictly):

1. **Reuse** — Check `src/components/ui/` first. If the component already exists there, use it as-is (or extend it in place).
2. **Generate via shadcn** — If no matching component exists, add it with `npx shadcn@latest add <component>`. It will land in `src/components/ui/`.
3. **Build from scratch** — Only when shadcn does not provide the component at all, create it manually inside `src/components/ui/`.

Rules:

- Never hand-write a component that shadcn already provides.
- Customization (styles, variants, behaviour) happens by editing the generated file in `src/components/ui/`, not by creating a parallel component next to it.
- Never import a UI primitive from anywhere other than `src/components/ui/`.
