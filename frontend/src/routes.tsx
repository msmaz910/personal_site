import type { RouteObject } from 'react-router'
import Layout from './layout/Layout.tsx'
import NotFound from './NotFound.tsx'
import { pages, type RouteHead } from './pages.tsx'
import StyleGuide from './StyleGuide.tsx'

/**
 * Every route renders inside the shared layout and carries its head content as `handle`.
 * /style-guide is unlisted; it and the not-found page are kept out of search results.
 */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      ...pages.map(({ path, element, title, description }) => ({
        path,
        element,
        handle: { title, description } satisfies RouteHead,
      })),
      {
        path: '/style-guide',
        element: <StyleGuide />,
        handle: { title: 'Design tokens | Michelle Lewis', noindex: true } satisfies RouteHead,
      },
      {
        path: '*',
        element: <NotFound />,
        handle: { title: 'Page not found | Michelle Lewis', noindex: true } satisfies RouteHead,
      },
    ],
  },
]
