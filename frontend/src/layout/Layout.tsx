import { Outlet } from 'react-router'
import ChatWidget from './ChatWidget.tsx'
import Footer from './Footer.tsx'
import Header from './Header.tsx'

/** Shared frame for every page: header, page content, footer, and the chat widget. */
function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}

export default Layout
