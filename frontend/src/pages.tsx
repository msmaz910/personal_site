import About from './About.tsx'
import Career from './Career.tsx'
import Contact from './Contact.tsx'
import Home from './Home.tsx'
import Portfolio from './Portfolio.tsx'

/** The site's pages, in nav order. Drives both the header links and the routes. */
export const pages = [
  { path: '/', label: 'Home', element: <Home /> },
  { path: '/about', label: 'About', element: <About /> },
  { path: '/career', label: 'Career', element: <Career /> },
  { path: '/portfolio', label: 'Portfolio', element: <Portfolio /> },
  { path: '/contact', label: 'Contact', element: <Contact /> },
]
