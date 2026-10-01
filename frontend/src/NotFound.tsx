import { Link } from 'react-router'

/** Shown for any path that does not match a page. */
function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        That trail does not exist. <Link to="/">Head back home</Link>.
      </p>
    </>
  )
}

export default NotFound
