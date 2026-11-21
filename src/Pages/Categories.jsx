import { Link } from "react-router-dom";
import categories from "../data/categories";

export default function Categories() {
  return (
    <>
      <section className="page-banner">
        <span className="eyebrow">20 toy worlds to explore</span>
        <h1>Find their next <em>adventure</em></h1>
      </section>
      <section className="section">
        <div className="category-grid large-categories">
          {categories.map((category) => (
            <Link
              key={category.slug}
              className="category-card category-identity-card"
              style={{ "--category-color": category.color, "--category-pale": category.pale }}
              to={`/products?category=${encodeURIComponent(category.name)}`}
            >
              <span className="category-count">20 toys</span>
              <div className="category-emoji">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{category.features[0]}</p>
              <span className="category-shop-link">Explore category →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
