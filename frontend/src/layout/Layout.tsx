import { Outlet } from 'react-router'
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import RidgeBand from './RidgeBand.tsx'

/** Shared frame for every page: header, mountain band, page content, footer. */
function Layout() {
  return (
    <>
      <Header />
      <RidgeBand />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
