import React from 'react'

function Footer() {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-10">
      <aside>
        <p>Copyright © {new Date().getFullYear()}</p>
      </aside>
    </footer>
  )
}

export default Footer
