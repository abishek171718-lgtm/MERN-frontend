import { useState } from "react";
import { Link } from "react-router-dom";
import { readCart, readWishlist, saveCart, saveWishlist } from "../data/storage";

export default function ProductCard({ product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const wishlist = readWishlist();
  const isWishlisted = wishlist.includes(product.id);
  const discount = product.discountPercent || Math.round((1 - product.price / product.originalPrice) * 100);

  function addToCart() {
    if (product.stock < 1) return;
    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);
    saveCart(existing
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } : item)
      : [...cart, { id: product.id, quantity: 1 }]);
    setRefresh((value) => value + 1);
  }

  function toggleWishlist() {
    saveWishlist(isWishlisted ? wishlist.filter((id) => id !== product.id) : [...wishlist, product.id]);
    setRefresh((value) => value + 1);
  }

  return (
    <>
      <article className="product-card" data-refresh={refresh}>
        <div className="product-image-wrap">
          <span className="product-badge">{product.badge}</span>
          <span className="discount-badge">-{discount}%</span>
          <button type="button" className={`wishlist-button ${isWishlisted ? "selected" : ""}`} onClick={toggleWishlist} aria-label={`${isWishlisted ? "Remove from" : "Add to"} wishlist`}>
            {isWishlisted ? "♥" : "♡"}
          </button>
          <Link to={`/product/${encodeURIComponent(product.id)}`} aria-label={`View ${product.name}`}>
            <img src={product.image} alt={product.name} loading="lazy" />
          </Link>
          <button type="button" className="quick-view-button" onClick={() => setQuickViewOpen(true)}>Quick View</button>
        </div>
        <div className="product-info">
          <p className="product-category">{product.category}</p>
          <Link to={`/product/${encodeURIComponent(product.id)}`}><h3>{product.name}</h3></Link>
          <div className="rating" aria-label={`${product.rating} out of 5 stars`}>
            ★★★★★ <span>{product.rating} ({product.reviewCount})</span>
          </div>
          <p className="age-label">{product.age} · {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
          <div className="product-bottom">
            <div className="price">
              <strong>₹{product.price.toLocaleString("en-IN")}</strong>
              <del>₹{product.originalPrice.toLocaleString("en-IN")}</del>
            </div>
            <button type="button" className="add-cart-button" onClick={addToCart} disabled={product.stock < 1} aria-label={`Add ${product.name} to cart`}>
              {product.stock > 0 ? "＋" : "×"}
            </button>
          </div>
        </div>
      </article>
      {quickViewOpen && (
        <div className="quick-view-backdrop" role="presentation" onClick={() => setQuickViewOpen(false)}>
          <section className="quick-view-modal" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`} onClick={(event) => event.stopPropagation()}>
            <button className="quick-view-close" type="button" onClick={() => setQuickViewOpen(false)} aria-label="Close quick view">×</button>
            <img src={product.image} alt={product.name} />
            <div>
              <p className="product-category">{product.category}</p>
              <h2>{product.name}</h2>
              <p className="rating">★★★★★ <span>{product.rating} · {product.reviewCount} reviews</span></p>
              <p>{product.description}</p>
              <p className="quick-view-price">₹{product.price.toLocaleString("en-IN")} <del>₹{product.originalPrice.toLocaleString("en-IN")}</del></p>
              <div className="quick-view-actions">
                <button className="button button-primary" type="button" onClick={addToCart} disabled={product.stock < 1}>Add to Cart</button>
                <Link className="button button-outline" to={`/product/${encodeURIComponent(product.id)}`}>Details</Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
