import { Activity, ClipboardList, GitPullRequestArrow, Search, Send, Telescope } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar atlas-sidebar">
        <NavLink className="brand" to="/">
          <Activity aria-hidden="true" />
          <span>TechGraph</span>
        </NavLink>
        <nav className="side-nav" aria-label="Primary navigation">
          <NavLink to="/">
            <Telescope aria-hidden="true" />
            Map
          </NavLink>
          <NavLink to="/submit">
            <Send aria-hidden="true" />
            Submit
          </NavLink>
          <NavLink to="/review">
            <ClipboardList aria-hidden="true" />
            Review
          </NavLink>
        </nav>
        <div className="sidebar-note">
          <GitPullRequestArrow aria-hidden="true" />
          <p>Evidence changes the map only after review.</p>
        </div>
      </aside>
      <div className="main-shell">
        <header className="global-header">
          <div className="header-title">
            <span>Science and technology progress</span>
          </div>
        <div className="search-box">
          <Search aria-hidden="true" />
          <input aria-label="Search technologies and claims" placeholder="Search technologies, claims, sources..." />
        </div>
        <span className="prototype-pill">Prototype</span>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
