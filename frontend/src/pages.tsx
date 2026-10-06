import About from './About.tsx'
import Career from './Career.tsx'
import Contact from './Contact.tsx'
import Home from './Home.tsx'
import Portfolio from './Portfolio.tsx'

/** Head content for a route. noindex pages are kept out of search results and have no description. */
export interface RouteHead {
  title: string
  description?: string
  noindex?: boolean
}

/** The site's pages, in nav order. Drives the header links, the routes, and each page's title and description. */
export const pages = [
  {
    path: '/',
    label: 'Home',
    element: <Home />,
    title: 'Michelle Lewis | Analytics Engineering Leader',
    description:
      'Michelle Lewis leads Data Science & Enterprise Analytics at Insperity, building dashboards, models, and pipelines that drive corporate strategy.',
  },
  {
    path: '/about',
    label: 'About',
    element: <About />,
    title: 'About | Michelle Lewis',
    description:
      'From art history and Wall Street data desks to analytics engineering leadership. Skills in SQL, Python, dbt, Snowflake, and AI.',
  },
  {
    path: '/career',
    label: 'Career',
    element: <Career />,
    title: 'Career | Michelle Lewis',
    description:
      'From Lehman Brothers and Barclays to Director of Data Science & Enterprise Analytics at Insperity, plus an MBA from Baruch College.',
  },
  {
    path: '/portfolio',
    label: 'Portfolio',
    element: <Portfolio />,
    title: 'Portfolio | Michelle Lewis',
    description:
      'Case studies in customer health scoring, executive dashboards, machine learning, and expense audits, plus this AI-chat website.',
  },
  {
    path: '/contact',
    label: 'Contact',
    element: <Contact />,
    title: 'Contact | Michelle Lewis',
    description:
      'Get in touch to talk analytics engineering, data leadership, or AI. Email is the fastest way to reach me.',
  },
]
