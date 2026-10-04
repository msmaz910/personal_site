import { contact } from './data/contact.ts'

/** Contact page: intro, then email as the primary button and LinkedIn and GitHub as secondary. */
function Contact() {
  return (
    <section className="contact">
      <h1>Contact</h1>
      <p>{contact.intro}</p>
      <ul className="contact-links" role="list">
        <li>
          <a className="button" href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`}>
            Email me
          </a>
        </li>
        <li>
          <a className="button button-secondary" href={import.meta.env.VITE_LINKEDIN_URL}>
            LinkedIn
          </a>
        </li>
        <li>
          <a className="button button-secondary" href={import.meta.env.VITE_GITHUB_URL}>
            GitHub
          </a>
        </li>
      </ul>
    </section>
  )
}

export default Contact
