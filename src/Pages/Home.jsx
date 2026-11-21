import { useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/products";
import categories from "../data/categories";
import ProductCard from "../Components/ProductCard";
import { readStoredValue, writeStoredValue } from "../data/storage";

const RECENT_KEY = "toyzone-recent-products";

export default function Home() {
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const featuredCategories = categories.slice(0, 4);
  const bestsellers = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const newArrivals = [...products].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const recentIds = readStoredValue(RECENT_KEY, []);
  if (!Array.isArray(recentIds)) {
    throw new Error(`Saved recent-products data is invalid. Remove the "${RECENT_KEY}" localStorage item and reload.`);
  }
  const recentProducts = recentIds.map((id) => products.find((product) => product.id === id)).filter(Boolean);

  function subscribe(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }
    const subscribers = readStoredValue("toyzone-newsletter", []);
    if (!Array.isArray(subscribers)) {
      throw new Error('Saved newsletter data is invalid. Remove the "toyzone-newsletter" localStorage item and reload.');
    }
    if (!subscribers.includes(email)) writeStoredValue("toyzone-newsletter", [...subscribers, email]);
    setEmail("");
    setNewsletterMessage("You're on the list! This demo saves subscriptions only in this browser.");
  }

  return (
    <>
      <section className="hero">
        <div className="hero-shape shape-one">★</div>
        <div className="hero-content">
          <span className="eyebrow">Where Every Toy Begins an Adventure!</span>
          <h1>Where every toy opens a <em>world of wonder</em></h1>
          <p>Discover safe, creative and educational toys designed to make every moment magical.</p>
          <div className="hero-buttons">
            <Link className="button button-primary" to="/products">Shop Now <span>→</span></Link>
            <Link className="button button-outline" to="/categories">Explore Categories</Link>
          </div>
          <div className="hero-trust"><span>★ 4.8 average rating</span><span>400 handpicked adventures</span></div>
        </div>
        <div className="hero-art">
          <img className="hero-toy-image" src="/images/products/railway-train.svg" alt="Colourful toy train and railway set" />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="eyebrow">Find their favourite</span><h2>Shop by Category</h2></div>
          <Link to="/categories" className="text-link">View all 20 categories →</Link>
        </div>
        <div className="category-grid">
          {featuredCategories.map((category) => (
            <Link className="category-card" style={{ "--category-color": category.color, "--category-pale": category.pale }} to={`/products?category=${encodeURIComponent(category.name)}`} key={category.slug}>
              <div className="category-emoji">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>20 playful picks</p>
              <span>Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section featured-section">
        <div className="section-heading">
          <div><span className="eyebrow">Loved by little explorers</span><h2>Featured Toys</h2></div>
          <Link to="/products" className="text-link">View all 400 toys →</Link>
        </div>
        <div className="product-grid">{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="section home-collection">
        <div className="section-heading"><div><span className="eyebrow">Popular playtime picks</span><h2>Bestsellers</h2></div><Link to="/products?sort=popular" className="text-link">Shop favourites →</Link></div>
        <div className="product-grid">{bestsellers.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="section featured-section">
        <div className="section-heading"><div><span className="eyebrow">Fresh from the toy box</span><h2>New Arrivals</h2></div><Link to="/products?sort=newest" className="text-link">See what's new →</Link></div>
        <div className="product-grid">{newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      {recentProducts.length > 0 && (
        <section className="section home-collection">
          <div className="section-heading"><div><span className="eyebrow">Pick up where you left off</span><h2>Recently Viewed</h2></div></div>
          <div className="product-grid">{recentProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}

      <section className="testimonials-section">
        <div className="section-heading"><div><span className="eyebrow">Playtime, well spent</span><h2>Little moments, big smiles</h2></div></div>
        <div className="testimonial-grid">
          <article><span>★★★★★</span><p>“A lovely way to make an ordinary afternoon a little more imaginative.”</p><small>Sample shopper story</small></article>
          <article><span>★★★★★</span><p>“We found something fun for every age in the family.”</p><small>Sample shopper story</small></article>
          <article><span>★★★★★</span><p>“The colourful kits make learning feel like play.”</p><small>Sample shopper story</small></article>
        </div>
      </section>

      <section className="benefits">
        <div><span>🚚</span><p><strong>Free Delivery</strong><small>On orders above ₹1,499</small></p></div>
        <div><span>🛡️</span><p><strong>Kid-conscious picks</strong><small>Age guidance on every toy</small></p></div>
        <div><span>↩️</span><p><strong>Easy Returns</strong><small>7-day return policy</small></p></div>
        <div><span>💬</span><p><strong>Friendly Support</strong><small>Here to help you</small></p></div>
      </section>

      <section className="newsletter-section">
        <div><span className="eyebrow">A little joy in your inbox</span><h2>Get playtime inspiration</h2><p>Sign up for new toy ideas and playful inspiration. Saved locally in this frontend demo.</p></div>
        <form onSubmit={subscribe}><label className="visually-hidden" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button className="button button-primary" type="submit">Join the fun</button>{newsletterMessage && <small>{newsletterMessage}</small>}</form>
      </section>
    </>
  );
}
