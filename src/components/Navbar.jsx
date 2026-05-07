import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        marginBottom: "1rem",
      }}
    >
      <Link to="/">Search Flights </Link>
      <Link to="/live">Live Flights</Link>
      <Link to="/my-flights">My Flights</Link>
    </nav>
  );
};

export default Navbar;
