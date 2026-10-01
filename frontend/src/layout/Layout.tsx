import { Outlet } from 'react-router'
import Footer from './Footer.tsx'
import Header from './Header.tsx'

/** Shared frame for every page: header, page content, footer. */
function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
