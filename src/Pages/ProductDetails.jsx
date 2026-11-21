import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../Components/ProductCard";
import { readCart, readStoredValue, readWishlist, saveCart, saveWishlist, writeStoredValue } from "../data/storage";

const RECENT_KEY = "toyzone-recent-products";
const REVIEWS_KEY = "toyzone-reviews";

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find((item) => item.id === decodeURIComponent(id));
  const [selectedImage, setSelectedImage] = useState(product?.image || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [, refreshWishlist] = useState(0);
  const [reviews, setReviews] = useState(() => readStoredValue(REVIEWS_KEY, {}));

  useEffect(() => {
    if (!product) return;
    setSelectedImage(product.image);
    const recent = readStoredValue(RECENT_KEY, []);
    if (!Array.isArray(recent)) {
      throw new Error(`Saved recent-products data is invalid. Remove the "${RECENT_KEY}" localStorage item and reload.`);
    }
    const next = [product.id, ...recent.filter((recentId) => recentId !== product.id)].slice(0, 8);
    writeStoredValue(RECENT_KEY, next);
  }, [product]);

  if (!product) {
    return <section className="section empty-state"><h1>We couldn't find that toy</h1><Link className="button button-primary" to="/products">Browse all toys</Link></section>;
  }

  const wishlist = readWishlist();
  const isWishlisted = wishlist.includes(product.id);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const productReviews = reviews[product.id] || [];

  function addToCart() {
    const cart = readCart();
    const currentQuantity = cart.find((item) => item.id === product.id)?.quantity || 0;
    const allowedQuantity = Math.min(quantity, Math.max(0, product.stock - currentQuantity));
    if (allowedQuantity < 1) {
      setAdded(false);
      return;
    }
    const existing = cart.find((item) => item.id === product.id);
    saveCart(existing
      ? cart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + allowedQuantity } : item)
      : [...cart, { id: product.id, quantity: allowedQuantity }]);
    setAdded(true);
  }

  function submitReview(event) {
    event.preventDefault();
    if (reviewText.trim().length < 8) {
      setReviewNotice("Please write at least 8 characters.");
      return;
    }
    const next = { ...reviews, [product.id]: [{ name: "Toy Zone shopper", text: reviewText.trim(), date: new Date().toLocaleDateString("en-IN") }, ...productReviews] };
    writeStoredValue(REVIEWS_KEY, next);
    setReviews(next);
    setReviewText("");
    setReviewNotice("Thanks! Your review is saved on this device.");
  }

  function toggleWishlist() {
    saveWishlist(isWishlisted ? wishlist.filter((itemId) => itemId !== product.id) : [...wishlist, product.id]);
    refreshWishlist((value) => value + 1);
  }

  return (
    <>
      <section className="section detail-page">
        <div className="detail-gallery">
          <div className="detail-image">
            <span className="product-badge">-{product.discountPercent}% OFF</span>
            <img src={selectedImage} alt={product.name} />
          </div>
          <div className="image-thumbnails" aria-label="Product image gallery">
            {product.imageGallery.map((image, index) => (
              <button type="button" className={selectedImage === image ? "active" : ""} key={`${product.id}-image-${index}`} onClick={() => setSelectedImage(image)} aria-label={`View product image ${index + 1}`}>
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-info">
          <Link className="back-link" to="/products">← Back to toys</Link>
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="rating">★★★★★ <span>{product.rating} · {product.reviewCount} reviews</span></div>
          <div className="detail-price">
            <strong>₹{product.price.toLocaleString("en-IN")}</strong>
            <del>₹{product.originalPrice.toLocaleString("en-IN")}</del>
            <span>Save {product.discountPercent}%</span>
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-tags"><span>Age: {product.age}</span><span>{product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}</span><span>Quality checked</span></div>
          <div className="detail-actions">
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
              <b>{quantity}</b>
              <button type="button" onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button type="button" className="button button-primary" onClick={addToCart} disabled={product.stock < 1}>Add to Cart</button>
            <button type="button" className={`button button-outline detail-wishlist ${isWishlisted ? "selected" : ""}`} onClick={toggleWishlist}>{isWishlisted ? "♥ Saved" : "♡ Save"}</button>
          </div>
          {added && <p className="success-message">Added to your cart.</p>}
          {product.stock > 0 && product.stock < 6 && <p className="stock-warning">Only {product.stock} left in stock.</p>}
          <div className="product-features">
            <h2>Why they'll love it</h2>
            <ul>{product.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </div>
          <div className="specifications">
            <h2>Specifications</h2>
            {Object.entries(product.specifications).map(([label, value]) => <p key={label}><span>{label}</span><strong>{value}</strong></p>)}
          </div>
        </div>
      </section>

      <section className="section review-section">
        <div className="section-heading"><div><span className="eyebrow">Real play stories</span><h2>Customer reviews</h2></div><span className="rating">★★★★★ <span>{product.rating} / 5</span></span></div>
        <div className="review-layout">
          <form className="review-form" onSubmit={submitReview}>
            <h3>Share your experience</h3>
            <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="What did your little explorer think?" rows="4" />
            {reviewNotice && <p className={reviewNotice.startsWith("Thanks") ? "success-message" : "form-error"}>{reviewNotice}</p>}
            <button className="button button-primary" type="submit">Save Review</button>
            <small>Reviews are stored locally in this browser.</small>
          </form>
          <div className="review-list">
            {productReviews.length ? productReviews.slice(0, 5).map((review, index) => <article className="review-card" key={`${review.date}-${index}`}><div><strong>{review.name}</strong><span>★★★★★</span></div><small>{review.date}</small><p>{review.text}</p></article>) : <div className="review-card"><strong>Families love this pick</strong><p>Be the first to share your own playtime experience.</p></div>}
          </div>
        </div>
      </section>

      <section className="section related-section">
        <div className="section-heading"><div><span className="eyebrow">Keep exploring</span><h2>More in {product.category}</h2></div></div>
        <div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
      </section>
    </>
  );
}
