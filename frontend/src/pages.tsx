import About from './About.tsx'
import Home from './Home.tsx'
import Placeholder from './Placeholder.tsx'

/** The site's pages, in nav order. Drives both the header links and the routes. */
export const pages = [
  { path: '/', label: 'Home', element: <Home /> },
  { path: '/about', label: 'About', element: <About /> },
  { path: '/career', label: 'Career', element: <Placeholder title="Career" /> },
  { path: '/portfolio', label: 'Portfolio', element: <Placeholder title="Portfolio" /> },
  { path: '/contact', label: 'Contact', element: <Placeholder title="Contact" /> },
]
