import { career } from './data/career.ts'

/** Career page: roles then education as timelines, from data/career.ts. */
function Career() {
  const { roles, education } = career

  return (
    <section className="career">
      <h1>Career</h1>

      <h2>Experience</h2>
      <ol className="timeline" role="list" aria-label="Experience">
        {roles.map(({ title, org, dates, highlights }) => (
          <li key={title}>
            <h3>{title}</h3>
            <p className="timeline-meta">
              {org} · {dates}
            </p>
            {highlights.length > 0 && (
              <ul>
                {highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <h2>Education</h2>
      <ol className="timeline" role="list" aria-label="Education">
        {education.map(({ degree, school, dates }) => (
          <li key={degree}>
            <h3>{degree}</h3>
            <p className="timeline-meta">
              {school} · {dates}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Career
