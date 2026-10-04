import { Fragment } from 'react'
import { portfolio } from './data/portfolio.ts'

/** Portfolio page: project cards grouped by type, from data/portfolio.ts. */
function Portfolio() {
  return (
    <section className="portfolio">
      <h1>Portfolio</h1>
      {portfolio.map(({ heading, projects }) => (
        <Fragment key={heading}>
          <h2>{heading}</h2>
          <ul className="cards" role="list" aria-label={heading}>
            {projects.map(({ title, context, description, tags, links }) => (
              <li key={title} className="card">
                <h3>{title}</h3>
                <p className="card-context">{context}</p>
                <p className="card-description">{description}</p>
                <ul className="tags" role="list" aria-label={`${title} technologies`}>
                  {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                {links.map(({ label, href }) => (
                  <a key={href} href={href}>
                    {label}
                  </a>
                ))}
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </section>
  )
}

export default Portfolio
