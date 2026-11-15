# Prompt log — React Lab 2

Part of what you submit. It shows *how* you used AI: did you hand it the contract and the
rules, or type "make it work"? Fill it in **as you go**, not from memory at the end.

- Name and roll number: Hetul Mehta, MT2026036
- AI tool and plan (e.g. ChatGPT free, Gemini, Claude free, Copilot): Claude (claude.ai), free plan

AI use was allowed by the professor. Prompt 1 was sent in a new Claude chat. The fix was done
with Claude in a separate conversation.

**Log every prompt you send, in order — including the ones that didn't help.** Paste each
prompt in full. One exception: if you pasted CONTRACT.md's prompt 1 unchanged, write
"CONTRACT.md prompt 1, unchanged". Summarise each reply; don't paste whole files.

---

## Prompt 1 — generate

**Sent:**

```text
CONTRACT.md prompt 1, unchanged
```

**What came back:** three files in `src/courses/`, about 205 lines in all:
- `useCourses.js` (100 lines): one hook holding **everything**. That's the list (`courses`,
  `status`, `loadError`) and the whole form (`values` object, `submitting`, `submitError`,
  `fieldErrors`), plus `changeField` and a `submit(event)` handler that calls `apiFetch`
  and catches the error itself. 7 `useState`, 1 `useEffect` (with `[]` and an `ignore`
  cleanup). Helpers `toCourseRequest`, `toNumberOrNull`, `insertSortedByCode`.
- `CoursesView.jsx` (85 lines): ONE View for the whole page: heading, list states and the
  form, with two inner components (`CourseList`, `Field`). Takes 9 props.
- `CoursesPage.jsx` (19 lines): calls the hook, passes all 9 values down.
- No `AddCourseForm`.
- Hooks used: only `useState` and `useEffect`. **Nothing from the "not yet" list.**
- Not asked for: the `Field`/`CourseList` sub-components, singular "1 credit", `noValidate`
  on the form, `role="alert"` on the load error, and empty Credits/Capacity sent as `null`
  instead of a number.

**Did it run?** Checked in a scratch copy of the project: `npm test` gave **33 passed /
29 failed**. Failing: `useCourses.test.jsx` (8/10), `CoursesView.test.jsx` (8/8),
`AddCourseForm.test.jsx` (11/11), `fieldErrors.test.jsx` (2/2). Passing: `CoursesPage.test.jsx`
(the screen works end to end), all of `test/search/`, `client.test.js`. So it works, but
the shape is wrong.

**What I did with it:** the first draft I audited came from an earlier run of
this same prompt. It has the same shape and the same 33/29 result, so I audited that one in
AUDIT.md and didn't swap in this run's files.

---

## Prompt 2 — fix

**Why I sent it:** to carry out every decision in AUDIT.md §4: cut `FIELDS`, `setField`,
`submit(event)`, the separate `fieldErrors` state and the hook's `try/catch`; move the form
state and markup into `AddCourseForm` and the `<h1>` into `CoursesPage`; add
`AddCourseForm({ onAdd })`, `addCourse` that lets the `ApiError` through, and accessible
errors.

**Sent:** no separate fix prompt to a fresh chat. After AUDIT.md §0–4 was written, Claude
(in a separate conversation) was asked to carry out those decisions to the shape in
CONTRACT.md §4.

**What came back:** four files in `src/courses/`:
- `useCourses.js`: 3 × `useState` + the same `useEffect`; `addCourse(courseRequest)` POSTs,
  inserts sorted as a new array, returns the created course, and doesn't catch. Returns
  exactly `{ courses, status, error, addCourse }`.
- `CoursesView.jsx`: list states only, 3 props, `key={course.id}`.
- `AddCourseForm.jsx`: six controlled inputs written out, `submitting`, one `error`; calls
  `onAdd` with numbers and `description: null` when empty; clears on success and keeps the
  values on failure; reasons under each input with `aria-invalid` / `aria-describedby`,
  `role="alert"` on the message above the button.
- `CoursesPage.jsx`: `<h1>`, `CoursesView`, `AddCourseForm`. Nothing else.

`npm test`: **62 passed / 0 failed** (`npm run test:stretch`: 4/4). `npm run dev`: list
loads, CS150 lands between CS101 and CS201, a duplicate shows the 409 message, bad input
shows four reasons under their inputs, and search still works.

**What I kept, and what I rejected:** kept all four files. Compared with the first draft,
the load effect, the sorted insert from the 201 body and the seats text stayed. The
one-big-View, the form state in the hook and the swallowed error were removed.

---

## Afterwards

- How many prompts did the whole feature take? Two: prompt 1 (new chat) and the fix.
- Which of your prompts would you write differently now, and how? I'd run prompt 1 in a
  **new** chat, as CONTRACT.md says, so the first draft is truly blind. Then I'd send the
  fix as its own prompt containing my AUDIT.md §4 decisions and CONTRACT.md §4, so each
  step is a separate, logged prompt.
- One thing the rules in prompt 1 prevented (or failed to prevent): they prevented every
  "not yet" hook (none appeared, unlike `ai-sample/CoursesPage.jsx`). They failed to
  prevent the shape problem: "One View component that only renders" was read as *one View
  for the whole page*, so the form and its state ended up in the wrong place.
