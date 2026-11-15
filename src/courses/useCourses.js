// src/courses/useCourses.js — the hook: fetch and logic for the Courses page (CONTRACT.md §4).
//
// useCourses() → { courses, status, error, addCourse }
//   status: "loading" | "ready" | "error"   ·   error: the load failure's message, else null
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client.js";

function byCode(a, b) {
  return a.code.localeCompare(b.code);
}

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  // Load the list once, when the page appears. The cleanup drops a stale answer
  // (StrictMode runs this twice in development).
  useEffect(() => {
    let ignore = false;
    apiFetch("/api/courses")
      .then((data) => {
        if (ignore) return;
        setCourses(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, []);

  // POST the course; put the 201 body into the list in code order, as a new array —
  // no reload. An ApiError is not caught here: it reaches the form, which shows it.
  async function addCourse(courseRequest) {
    const created = await apiFetch("/api/courses", { method: "POST", body: courseRequest });
    setCourses((prev) => [...prev, created].sort(byCode));
    return created;
  }

  return { courses, status, error, addCourse };
}
