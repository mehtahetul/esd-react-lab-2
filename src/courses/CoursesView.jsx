// src/courses/CoursesView.jsx — the View: only renders (CONTRACT.md §4).
// No fetch, no hooks, no state: everything it shows arrives as props.
function seatsText(seatsLeft) {
  if (seatsLeft === 0) return "Full";
  if (seatsLeft === 1) return "1 seat left";
  return `${seatsLeft} seats left`;
}

export function CoursesView({ courses, status, error }) {
  if (status === "loading") return <p>Loading courses…</p>;
  if (status === "error") return <p>Couldn't load courses: {error}</p>;
  if (courses.length === 0) return <p>No courses yet.</p>;

  return (
    <ul className="courses">
      {courses.map((course) => (
        <li key={course.id}>
          <strong>
            {course.code} · {course.title}
          </strong>
          <span>
            {course.credits} credits · {course.department} · {seatsText(course.seatsLeft)}
          </span>
        </li>
      ))}
    </ul>
  );
}
