import { Link } from 'react-router'
import { home } from './data/home.ts'

/** Landing page: name, tagline, tags, intro and a link to About, from data/home.ts. */
function Home() {
  const { title, mission, tags, intro, link } = home

  return (
    <section className="home">
      <h1>{import.meta.env.VITE_SITE_NAME}</h1>
      <p className="home-title">{title}</p>
      <p className="home-mission">{mission}</p>
      <ul className="tags" role="list" aria-label="Focus areas">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <p className="home-intro">{intro}</p>
      <Link className="button" to={link.to}>
        {link.label}
      </Link>
    </section>
  )
}

export default Home
