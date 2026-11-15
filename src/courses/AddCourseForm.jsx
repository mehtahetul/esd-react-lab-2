// src/courses/AddCourseForm.jsx — the form: raises "add this course" (CONTRACT.md §4).
//
// Owns its six input values, whether it is submitting, and the last error. On submit it
// hands a CourseRequest to onAdd and shows whatever onAdd throws. It never calls the API.
import { useState } from "react";

export function AddCourseForm({ onAdd }) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [credits, setCredits] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onAdd({
        code,
        title,
        department,
        credits: Number(credits),
        capacity: Number(capacity),
        description: description === "" ? null : description,
      });
      setCode("");
      setTitle("");
      setDepartment("");
      setCredits("");
      setCapacity("");
      setDescription("");
    } catch (err) {
      setError(err); // keep what was typed; show why it failed
    } finally {
      setSubmitting(false);
    }
  }

  // The reason for one field, read from the last error (a 400's fieldErrors), or undefined.
  const reasonFor = (name) => error?.fieldErrors?.[name];

  // Props that tie an input to its reason, so a screen reader announces it.
  const errorProps = (name) =>
    reasonFor(name) ? { "aria-invalid": "true", "aria-describedby": `course-${name}-error` } : {};

  const reason = (name) =>
    reasonFor(name) && (
      <p id={`course-${name}-error`} className="field-error">
        {reasonFor(name)}
      </p>
    );

  return (
    <form className="add-course" onSubmit={handleSubmit}>
      <h2>Add a course</h2>

      <div className="field">
        <label htmlFor="course-code">Code</label>
        <input id="course-code" value={code} onChange={(e) => setCode(e.target.value)} {...errorProps("code")} />
        {reason("code")}
      </div>

      <div className="field">
        <label htmlFor="course-title">Title</label>
        <input id="course-title" value={title} onChange={(e) => setTitle(e.target.value)} {...errorProps("title")} />
        {reason("title")}
      </div>

      <div className="field">
        <label htmlFor="course-department">Department</label>
        <input
          id="course-department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          {...errorProps("department")}
        />
        {reason("department")}
      </div>

      <div className="field">
        <label htmlFor="course-credits">Credits</label>
        <input
          id="course-credits"
          type="number"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          {...errorProps("credits")}
        />
        {reason("credits")}
      </div>

      <div className="field">
        <label htmlFor="course-capacity">Capacity</label>
        <input
          id="course-capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          {...errorProps("capacity")}
        />
        {reason("capacity")}
      </div>

      <div className="field">
        <label htmlFor="course-description">Description</label>
        <textarea
          id="course-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          {...errorProps("description")}
        />
        {reason("description")}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error.message}
        </p>
      )}
      <button type="submit" disabled={submitting}>
        Add course
      </button>
    </form>
  );
}
