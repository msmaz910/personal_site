import { useMatches } from 'react-router'
import type { RouteHead } from '../pages.tsx'

/** Renders the current route's title, description and robots tags; React 19 moves them into <head>. */
function PageMeta() {
  const { title, description, noindex } = useMatches().at(-1)!.handle as RouteHead

  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
    </>
  )
}

export default PageMeta
