import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div><Logo light /><p>Playful discoveries for curious kids. Find something wonderful for every little adventure.</p></div>
        <div><h3>Explore</h3><Link to="/">Home</Link><Link to="/about">About Us</Link><Link to="/categories">Categories</Link><Link to="/products">Shop Products</Link></div>
        <div><h3>Help</h3><Link to="/contact">Contact Us</Link><Link to="/faq">FAQ</Link><Link to="/terms">Terms &amp; Conditions</Link></div>
        <div><h3>Visit Us</h3><p>123 Rainbow Avenue<br />Coimbatore, Tamil Nadu 641001</p><p>📞 +91 98765 43210</p></div>
      </div>
      <div className="footer-bottom">© 2026 Toy Zone. Where Every Toy Begins an Adventure!</div>
    </footer>
  );
}
