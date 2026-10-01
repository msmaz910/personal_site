import type { RouteObject } from 'react-router'
import Layout from './layout/Layout.tsx'
import NotFound from './NotFound.tsx'
import { pages } from './pages.tsx'
import StyleGuide from './StyleGuide.tsx'

/** Every route renders inside the shared layout. /style-guide is unlisted. */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      ...pages.map(({ path, element }) => ({ path, element })),
      { path: '/style-guide', element: <StyleGuide /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]
