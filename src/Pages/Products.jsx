import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import products from "../data/products";
import categories from "../data/categories";
import ProductCard from "../Components/ProductCard";
import { readWishlist } from "../data/storage";
import { STORAGE_EVENT } from "../data/storage";

const PAGE_SIZE = 24;
const INITIAL_VISIBLE = 12;
const AGE_GROUPS = ["All ages", "Under 3 years", "3–5 years", "6–8 years", "9+ years"];

function isInAgeGroup(age, group) {
  if (group === "All ages") return true;
  const years = Number(age.match(/\d+/)?.[0] || 0);
  if (group === "Under 3 years") return years < 3;
  if (group === "3–5 years") return years >= 3 && years <= 5;
  if (group === "6–8 years") return years >= 6 && years <= 8;
  return years >= 9;
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const wishlistOnly = params.get("wishlist") === "true";
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [age, setAge] = useState("All ages");
  const [minRating, setMinRating] = useState("0");
  const [sort, setSort] = useState(params.get("sort") || "popular");
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [wishlistVersion, setWishlistVersion] = useState(0);

  useEffect(() => {
    setSearch(params.get("search") || "");
    setCategory(params.get("category") || "All");
    setSort(params.get("sort") || "popular");
    setPage(1);
    setVisibleCount(INITIAL_VISIBLE);
  }, [params]);

  useEffect(() => {
    const refreshWishlist = () => setWishlistVersion((version) => version + 1);
    window.addEventListener(STORAGE_EVENT, refreshWishlist);
    return () => window.removeEventListener(STORAGE_EVENT, refreshWishlist);
  }, []);

  const filtered = useMemo(() => {
    const wishlist = readWishlist();
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesSearch = !query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query);
      const matchesCategory = category === "All" || product.category === category;
      const matchesMin = !minPrice || product.price >= Number(minPrice);
      const matchesMax = !maxPrice || product.price <= Number(maxPrice);
      const matchesAge = age === "All ages" || isInAgeGroup(product.age, age);
      const matchesRating = product.rating >= Number(minRating);
      return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesAge && matchesRating && (!wishlistOnly || wishlist.includes(product.id));
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "newest") return b.createdAt - a.createdAt;
      if (sort === "rating") return b.rating - a.rating;
      return b.popularity - a.popularity;
    });
  }, [search, category, minPrice, maxPrice, age, minRating, sort, wishlistOnly, wishlistVersion]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageLimit = Math.min(PAGE_SIZE, Math.max(0, filtered.length - pageStart));
  const pageItems = filtered.slice(pageStart, pageStart + Math.min(visibleCount, pageLimit));

  function chooseCategory(value) {
    setCategory(value);
    setPage(1);
    setVisibleCount(INITIAL_VISIBLE);
    const next = new URLSearchParams(params);
    if (value === "All") next.delete("category");
    else next.set("category", value);
    setParams(next);
  }

  function resetFilters() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setAge("All ages");
    setMinRating("0");
    setSort("popular");
    setCategory("All");
    setPage(1);
    setVisibleCount(INITIAL_VISIBLE);
    setParams(wishlistOnly ? { wishlist: "true" } : {});
  }

  return (
    <>
      <section className="page-banner compact">
        <span className="eyebrow">{wishlistOnly ? "Saved for later" : "400 toys, endless adventures"}</span>
        <h1>{wishlistOnly ? "Your Wishlist" : category === "All" ? "The Toy Collection" : category}</h1>
      </section>
      <section className="section products-page">
        <aside className="filters">
          <div className="filter-heading"><h3>Find your fun</h3><button type="button" onClick={resetFilters}>Reset</button></div>
          <label className="filter-label">Category
            <select value={category} onChange={(event) => chooseCategory(event.target.value)}>
              <option value="All">All categories ({products.length})</option>
              {categories.map((item) => <option value={item.name} key={item.slug}>{item.name} ({products.filter((product) => product.category === item.name).length})</option>)}
            </select>
          </label>
          <fieldset className="price-filter">
            <legend>Price range (₹)</legend>
            <div><input type="number" min="0" placeholder="Min" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); setVisibleCount(INITIAL_VISIBLE); }} /><span>–</span><input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); setVisibleCount(INITIAL_VISIBLE); }} /></div>
          </fieldset>
          <label className="filter-label">Age group
            <select value={age} onChange={(event) => { setAge(event.target.value); setPage(1); setVisibleCount(INITIAL_VISIBLE); }}>
              {AGE_GROUPS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-label">Minimum rating
            <select value={minRating} onChange={(event) => { setMinRating(event.target.value); setPage(1); setVisibleCount(INITIAL_VISIBLE); }}>
              <option value="0">Any rating</option><option value="4">4+ stars</option><option value="4.5">4.5+ stars</option><option value="4.8">4.8+ stars</option>
            </select>
          </label>
        </aside>
        <div className="products-content">
          <div className="products-toolbar">
            <p><strong>{filtered.length}</strong> toys found</p>
            <input aria-label="Search products" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); setVisibleCount(INITIAL_VISIBLE); }} placeholder="Search all toys..." />
            <label className="sort-control">Sort by
              <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); setVisibleCount(INITIAL_VISIBLE); }}>
                <option value="popular">Popularity</option><option value="newest">Newest arrivals</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option>
              </select>
            </label>
          </div>
          {pageItems.length ? (
            <>
              <div className="product-grid">{pageItems.map((product) => <ProductCard key={product.id} product={product} />)}</div>
              <div className="catalog-pagination">
                {visibleCount < pageLimit && <button className="button button-outline" type="button" onClick={() => setVisibleCount((count) => Math.min(pageLimit, count + 12))}>Load More</button>}
                <div className="page-controls">
                  <button type="button" disabled={page === 1} onClick={() => { setPage(page - 1); setVisibleCount(INITIAL_VISIBLE); }}>←</button>
                  <span>Page {page} of {pageCount}</span>
                  <button type="button" disabled={page === pageCount} onClick={() => { setPage(page + 1); setVisibleCount(INITIAL_VISIBLE); }}>→</button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state"><span>🔎</span><h2>No toys found</h2><p>Try changing your search or filters.</p><button className="button button-primary" type="button" onClick={resetFilters}>Clear filters</button></div>
          )}
        </div>
      </section>
    </>
  );
}
