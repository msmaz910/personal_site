const year = new Date().getFullYear()

/** Copyright line and social links shown on every page. */
function Footer() {
  return (
    <footer className="site-footer">
      <p>
        &copy; {year} {import.meta.env.VITE_SITE_NAME}
      </p>
      <ul>
        <li>
          <a href={import.meta.env.VITE_LINKEDIN_URL}>LinkedIn</a>
        </li>
        <li>
          <a href={import.meta.env.VITE_GITHUB_URL}>GitHub</a>
        </li>
      </ul>
    </footer>
  )
}

export default Footer
