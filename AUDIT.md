# Audit — React Lab 2

Part of what you submit. Fill in sections 0–4 **before** you ask the AI to change anything:
deciding what's wrong is your job, not the AI's. The sheet you audit against is "The Shape
of a Good React Slice" — section 08 of the lab doc.

Point at code as `file:line`, e.g. `CoursesPage.jsx:14`.

> Written with Claude, in the same conversation that generated the first draft (see
> PROMPTS.md). Sections 0–4 were written against the untouched first draft,
> before any fix. Line numbers in 0–4 refer to that draft.

---

## 0. What came back

| File the AI gave you | What's in it (components, hooks) | Lines |
| --- | --- | --- |
| `src/courses/useCourses.js` | hook `useCourses`: 7 × `useState` (list, status, loadError, form, submitting, formError, fieldErrors), 1 × `useEffect` (initial load), `setField`, `submit(event)` | 88 |
| `src/courses/CoursesView.jsx` | component `CoursesView` (heading + list states + the whole add form, from a `FIELDS` array), helper `seatsText` | 86 |
| `src/courses/CoursesPage.jsx` | component `CoursesPage`: calls `useCourses()`, passes 9 props to `CoursesView` | 20 |
| `src/courses/AddCourseForm.jsx` | not written (still the TODO stub) | 4 |

- Does it run? List loads ✔ / valid add (CS150) appears between CS101 and CS201 ✔ /
  duplicate code shows "Course code already exists" ✔ / bad input shows "Validation failed"
  and four reasons under the inputs, keeping what was typed ✔
- Requests in the Network tab — on page load: 2 × `GET /api/courses` (StrictMode runs the
  effect twice in dev only; the ignore flag drops the first answer, so it's 1 in
  production) ; per add: 1 × `POST /api/courses` (plus `POST /api/auth/login` once, the first
  time: the given client's admin stand-in). No reload of the list after an add.
- `npm test` before any fix: 33 passed / 29 failed. Failing: `test/courses/useCourses.test.jsx`
  (8/10), `test/courses/CoursesView.test.jsx` (8/8), `test/courses/AddCourseForm.test.jsx`
  (11/11), `test/courses/fieldErrors.test.jsx` (2/2). The behaviour works, but the shape is
  wrong: no `AddCourseForm`, the hook doesn't return `{ courses, status, error, addCourse }`,
  and the View takes form props.

## 1. Part A — walk the allowed list

Is each element present, and in the right place?

| Element (the sheet, Part A) | Where it is in the AI's code (`file:line`, or "missing") | Right place? If not, where should it be? |
| --- | --- | --- |
| One View component that only renders | `CoursesView.jsx:16`: no hooks, no fetch ✔ | Partly. It renders the list **and** the form (`CoursesView.jsx:56–83`). The list View is right; the form belongs in its own component, `AddCourseForm`, which owns its inputs. |
| Fetch + logic in a separate hook or module | `useCourses.js:18` (load at `:30`, POST at `:56`) | Yes for the list. But the hook also runs the form (`submit(event)` at `:50` takes a DOM event and does `preventDefault` at `:51`), so it isn't reusable without that exact form. |
| `useState` for the course list, at the right level | `useCourses.js:19` | Yes: the list is shared by the View (shows it) and the add (inserts into it), so it lives above both, in the hook. |
| `useState` for the form's inputs, at the right level | `useCourses.js:23` (`form` object) | No. Only the form reads or writes the inputs, so they belong in `AddCourseForm`. Lifting them to the hook makes the whole page re-render on every keystroke and bloats the hook's API. |
| `useEffect` — for the initial fetch only (with a cleanup) | `useCourses.js:28–44`, `[]`, `ignore` cleanup at `:41–43` | Yes. |
| Props down, callbacks up (the form raises "add this course") | `CoursesPage.jsx:8–18` passes 9 props; the View raises `onFieldChange` per keystroke and `onSubmit(event)` | No. The form should raise one thing, `onAdd(courseRequest)`, with plain data, not keystrokes and a DOM event. |
| `.map` to render the list, with a stable `key` | `CoursesView.jsx:37–38`, `key={course.id}` | Yes. |
| Loading / error / empty states, from one `status` | `useCourses.js:20` (`status`), branches at `CoursesView.jsx:28–34` | Yes, one `status` field. The message comes from a prop named `loadError` (`useCourses.js:21`) where the contract says `error`. |

## 2. Part B — scan for "not yet"

Search the files (VS Code: Ctrl/Cmd+Shift+F) for each one.

| Not yet | Found? (`file:line`) | What it does in *this* slice | Cut, or keep — and why |
| --- | --- | --- | --- |
| `useMemo` | No | — | — |
| `useCallback` | No | — | — |
| `useReducer` | No | — | — |
| `useRef` | No | — | — |
| Context (`createContext`, `useContext`) | No | — | — |
| A data-fetching library, or `axios`, or raw `fetch` instead of `apiFetch` | No: `apiFetch` only (`useCourses.js:30`, `:56`) | — | — |
| TypeScript (types, interfaces, `.ts`/`.tsx`) | No | — | — |
| Anything else nobody taught you (name it) | A config-driven form: the `FIELDS` array (`CoursesView.jsx:8`) mapped into inputs (`:58`) | Generates five inputs from data | Cut. Six fields don't need an abstraction. Written out, each input can carry its own `aria-invalid`/`aria-describedby`, and it reads like the contract. |

## 3. The rule — every hook and every component split

One row for **each** `useState`, `useEffect` and custom hook call, and for **each**
component. Say what it does *in this slice*. "The AI added it" and "just in case" are not
answers — if you can't name its job, the decision is "cut".

| Hook call or component (`file:line`) | What earns it here? (one sentence) | Keep / cut / move (to where) |
| --- | --- | --- |
| `useState` courses (`useCourses.js:19`) | The list the View shows and the add inserts into. | Keep |
| `useState` status (`useCourses.js:20`) | One field for loading / ready / error, so impossible combinations can't happen. | Keep |
| `useState` loadError (`useCourses.js:21`) | The load failure's message for "Couldn't load courses: …". | Keep, rename to `error`, and only set it when status is "error" |
| `useState` form (`useCourses.js:23`) | The six input values — needed, but only by the form. | Move to `AddCourseForm` (as six controlled inputs) |
| `useState` submitting (`useCourses.js:24`) | Disables "Add course" while waiting — only the form shows it. | Move to `AddCourseForm` |
| `useState` formError (`useCourses.js:25`) | The last add's error message — only the form shows it. | Move to `AddCourseForm` |
| `useState` fieldErrors (`useCourses.js:26`) | Per-field reasons from a 400 — always taken from the same error as `formError`, so it's a second copy of one fact. | Cut. Keep the one `error` object in the form, and read `error.fieldErrors` from it |
| `useEffect` initial load (`useCourses.js:28`) | Loads the list once when the page appears; the cleanup drops a stale answer. | Keep |
| `useCourses()` call (`CoursesPage.jsx:6`) | Connects the page to its data and logic. | Keep |
| `CoursesPage` (`CoursesPage.jsx:5`) | Puts the hook, the View and the form together. | Keep; it should also render the `<h1>` and the form |
| `CoursesView` (`CoursesView.jsx:16`) | Shows the list states from props, testable with no server. | Keep, but only the list: 3 props (`courses`, `status`, `error`) |
| `AddCourseForm` (missing) | Owns the inputs and raises "add this course" with plain data. | Add |

## 4. Decisions — before any fix prompt

- I will **cut**: the `FIELDS` array (`CoursesView.jsx:8`); `setField` and `submit(event)`
  from the hook (`useCourses.js:46`, `:50`); the separate `fieldErrors` state
  (`useCourses.js:26`); the hook's `try/catch` around the POST (`useCourses.js:55–74`).
- I will **move** (from → to): the form state (`useCourses.js:23–25`) → `AddCourseForm`;
  the form markup (`CoursesView.jsx:56–83`) → `AddCourseForm`; the `<h1>` and `<section>`
  (`CoursesView.jsx:52–53`) → `CoursesPage`.
- I will **add** (missing from the AI's version): `AddCourseForm({ onAdd })`;
  `addCourse(courseRequest)` in the hook, which POSTs, inserts the 201 body sorted by code
  as a new array, resolves with it, and lets an `ApiError` through; the hook returning
  exactly `{ courses, status, error, addCourse }`; accessible errors (`aria-invalid`,
  `aria-describedby` pointing at the message's `id`, `role="alert"` on the message above
  the button).
- Other smells I found (state stored that could be computed, a reload after add, browser
  validation, `key={index}`, swallowed errors…): the hook **swallows** the add error
  (`useCourses.js:69–71`): it catches and stores it, so a caller of the hook can never
  `await` an add and react to its failure. `fieldErrors` duplicates part of the error object
  (stored, could be read). The good parts: no reload after add ✔, no browser validation ✔,
  `key={course.id}` not the index ✔, numbers sent as numbers and `description` as `null`
  when empty ✔.

---

## 5. Strip check (section 14 of the doc)

For each "not yet" item you removed — one at a time:

| Removed | `npm test` after | The app after (loads / adds / shows errors) |
| --- | --- | --- |
| — (nothing from the "not yet" list was in the draft) | — | — |

The AI used none of them: no `useMemo`, `useCallback`, `useReducer`, `useRef`, Context, data
library, raw `fetch` or TypeScript (§2). The rule in prompt 1 that prevented it: *"Use only
useState and useEffect. Do not use useMemo, useCallback, useReducer, useRef, or context."*,
together with *"Never call fetch directly"* and *"No TypeScript"*. Compare
`ai-sample/CoursesPage.jsx`, written with no rules, which uses four of them. (Caveat: the
draft came from a conversation that had already read the lab, see PROMPTS.md, so the rules
may not be the only reason.)

The one extra the draft did have, the `FIELDS` array (§2, "anything else"), was cut as part
of the fix. It isn't on the "not yet" list, and the fix was done in one pass, so there's no
separate removal step to report. After the fix: `npm test` 62/62, and the app loads, adds,
and shows the 409 and the field errors.

## 6. Before / after

|  | Before (the AI's first version) | After (yours) |
| --- | --- | --- |
| Files and components | 3 files: `useCourses`, `CoursesView` (list **and** form), `CoursesPage`; no `AddCourseForm` | 4 files: `useCourses`, `CoursesView` (list only), `AddCourseForm`, `CoursesPage` |
| `useState` calls (and where) | 7, all in `useCourses` (list, status, loadError, form, submitting, formError, fieldErrors) | 11: 3 in `useCourses` (courses, status, error) and 8 in `AddCourseForm` (six inputs, submitting, error) |
| `useEffect` calls | 1 (initial load, `[]`, ignore cleanup) | 1 (the same) |
| "Not yet" items | none (plus a `FIELDS` config array) | none |
| Requests: on load / per add | 1 GET (2 in dev under StrictMode) / 1 POST | 1 GET (2 in dev under StrictMode) / 1 POST |
| `npm test` | 33 passed / 29 failed | 62 passed / 0 failed |

## 7. Two sentences

- One thing the AI got right that you might not have thought of: it inserted the new course
  from the 201 body and re-sorted a copy (`[...prev, created].sort(byCode)`) instead of
  reloading the list, and it guarded the initial load with an `ignore` cleanup, so
  StrictMode's double request in dev can't show a stale answer.
- One thing you will never accept from an AI without checking again: "it works in the
  browser". The first draft did everything on screen and passed the end-to-end test, yet
  29 tests failed, because the form's state sat in the wrong place and the hook swallowed
  the add errors. I'll always check *where* the state lives and *who* catches the errors.
