import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="app-nav">
      <div className="app-nav__inner">
        <Link to="/" className="app-nav__brand">
          Fly With Me
        </Link>
        <div className="app-nav__links">
          <Link to="/">Search Flights</Link>
          <Link to="/live">Live Flights</Link>
          <Link to="/my-flights">My Flights</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
