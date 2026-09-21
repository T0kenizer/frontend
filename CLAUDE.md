# Frontend guidelines

## TypeScript conventions

- Use the global utility types `Optional<T>`, `Nullable<T>` and `Nullish<T>`, declared in `src/types/global.d.ts`, instead of writing `T | undefined`, `T | null` or `T | null | undefined` inline.
  - `foo: Optional<string>` ✅ — `foo: string | undefined` ❌
  - `bar: Nullable<Date>` ✅ — `bar: Date | null` ❌
  - `baz: Nullish<number>` ✅ — `baz: number | null | undefined` ❌

## UI components

- Essential components (button, input, dialog, table, …) must be created with shadcn (`npx shadcn@latest add <component>`), then modified as needed in `src/components/ui/`.
  - Never hand-write a component that shadcn already provides.
  - Customization (styles, variants, behaviour) happens by editing the generated file, not by creating a parallel component next to it.
