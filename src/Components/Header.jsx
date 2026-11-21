import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import Navbar from "./Navbar";
import products from "../data/products";
import { readCart, readWishlist, STORAGE_EVENT } from "../data/storage";

export default function Header() {
  const [query, setQuery] = useState("");
  const [, setStorageVersion] = useState(0);
  const navigate = useNavigate();
  const cart = readCart();
  const wishlist = readWishlist();
  const cartCount = cart.reduce((total, item) => total + (products.some((product) => product.id === item.id) ? item.quantity : 0), 0);

  useEffect(() => {
    const refresh = () => setStorageVersion((version) => version + 1);
    window.addEventListener(STORAGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    navigate(`/products${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
  }

  return (
    <>
      <header className="site-header">
        <div className="announcement">
          <span>Free delivery on orders over ₹1,499</span>
          <span>Where Every Toy Begins an Adventure! ✨</span>
        </div>
        <div className="header-main">
          <Logo />
          <form className="search-box" onSubmit={submit}>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search toys, games & more" />
            <button type="submit" aria-label="Search">⌕</button>
          </form>
          <div className="header-actions">
            <Link to="/login" className="header-action"><span aria-hidden="true">♙</span><label>Login</label></Link>
            <Link to="/products?wishlist=true" className="header-action"><span aria-hidden="true">♡</span><label>Wishlist</label>{wishlist.length > 0 && <b>{wishlist.length}</b>}</Link>
            <Link to="/cart" className="header-action"><span aria-hidden="true">🛒</span><label>Cart</label>{cartCount > 0 && <b>{cartCount}</b>}</Link>
          </div>
        </div>
      </header>
      <Navbar />
    </>
  );
}
