import { about } from './data/about.ts'

/** About page: story, core skills, and titled sections, from data/about.ts. */
function About() {
  const { story, skills, sections } = about

  return (
    <section className="about">
      <h1>About</h1>
      {story.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <h2>Core Skills</h2>
      <ul className="tags" role="list" aria-label="Core skills">
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      {sections.map(({ heading, paragraphs }) => (
        <section key={heading}>
          <h2>{heading}</h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </section>
  )
}

export default About
