import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import products from "../data/products";
import { readCart, readStoredValue, saveCart, USER_KEY, writeStoredValue } from "../data/storage";

const emptyAddress = { name: "", email: "", phone: "", address: "", city: "", pincode: "" };

export default function Cart() {
  const [cart, setCart] = useState(readCart);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [addressError, setAddressError] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(searchParams.get("checkout") === "true" && Boolean(readStoredValue(USER_KEY, null)));
  const [completedOrder, setCompletedOrder] = useState(null);
  const items = cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const delivery = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const total = subtotal + delivery;

  function updateCart(next) {
    setCart(next);
    saveCart(next);
  }

  function changeQuantity(id, amount) {
    updateCart(cart.map((item) => {
      if (item.id !== id) return item;
      const product = products.find((entry) => entry.id === id);
      return { ...item, quantity: Math.min(product?.stock || 1, Math.max(1, item.quantity + amount)) };
    }));
  }

  function checkout() {
    if (!readStoredValue(USER_KEY, null)) {
      navigate("/login?redirect=%2Fcart%3Fcheckout%3Dtrue");
      return;
    }
    setCheckoutOpen(true);
  }

  function placeOrder(event) {
    event.preventDefault();
    if (!address.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email) || !/^\d{10}$/.test(address.phone.replace(/\D/g, "")) || address.address.trim().length < 8 || !address.city.trim() || !/^\d{6}$/.test(address.pincode)) {
      setAddressError("Enter your name, valid email, 10-digit phone, full address, city and 6-digit PIN code.");
      return;
    }

    const order = {
      id: `TZ-${Date.now().toString().slice(-8)}`,
      placedAt: new Date().toISOString(),
      items: items.map(({ product, quantity }) => ({ id: product.id, name: product.name, quantity, price: product.price })),
      total,
      address,
      paymentNote: "Demo order. No payment was collected.",
    };
    const previousOrders = readStoredValue("toyzone-orders", []);
    if (!Array.isArray(previousOrders)) {
      throw new Error('Saved order data is invalid. Remove the "toyzone-orders" localStorage item and reload.');
    }
    writeStoredValue("toyzone-orders", [order, ...previousOrders]);
    updateCart([]);
    setCompletedOrder(order);
    setCheckoutOpen(false);
    setAddressError("");
  }

  if (completedOrder) {
    return (
      <section className="section order-complete">
        <div className="order-confetti">✦ ✧ ✦</div>
        <span className="order-check">✓</span>
        <p className="eyebrow">Adventure confirmed</p>
        <h1>Thank you, {completedOrder.address.name.split(" ")[0]}!</h1>
        <p>Your Toy Zone order <strong>{completedOrder.id}</strong> is saved on this device.</p>
        <p className="order-demo-note">{completedOrder.paymentNote}</p>
        <Link className="button button-primary" to="/products">Keep exploring</Link>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="section empty-state">
        <span>🛒</span><h1>Your cart is ready for an adventure</h1>
        <p>Find a new favourite from 400 toys and games.</p>
        <Link className="button button-primary" to="/products">Explore the collection</Link>
      </section>
    );
  }

  return (
    <>
      <section className="page-banner compact"><span className="eyebrow">Almost there</span><h1>Your Shopping <em>Cart</em></h1></section>
      <section className="section cart-layout">
        <div className="cart-items">
          {items.map(({ product, quantity }) => (
            <article className="cart-item" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div><p className="product-category">{product.category}</p><h3>{product.name}</h3><strong>₹{product.price.toLocaleString("en-IN")}</strong></div>
              <div className="quantity-control">
                <button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label="Decrease quantity">−</button>
                <b>{quantity}</b>
                <button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label="Increase quantity">+</button>
              </div>
              <strong className="item-total">₹{(product.price * quantity).toLocaleString("en-IN")}</strong>
              <button type="button" className="remove-button" onClick={() => updateCart(cart.filter((item) => item.id !== product.id))} aria-label={`Remove ${product.name}`}>×</button>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>{checkoutOpen ? "Delivery details" : "Order Summary"}</h2>
          <p><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></p>
          <p><span>Delivery</span><strong>{delivery ? `₹${delivery}` : "Free"}</strong></p>
          <hr /><p className="grand-total"><span>Total</span><strong>₹{total.toLocaleString("en-IN")}</strong></p>
          {checkoutOpen ? (
            <form className="checkout-form" onSubmit={placeOrder}>
              {addressError && <p className="form-error">{addressError}</p>}
              <label>Full name<input required value={address.name} onChange={(event) => setAddress({ ...address, name: event.target.value })} /></label>
              <label>Email<input required type="email" value={address.email} onChange={(event) => setAddress({ ...address, email: event.target.value })} /></label>
              <label>Phone<input required inputMode="numeric" maxLength="10" value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value.replace(/\D/g, "").slice(0, 10) })} /></label>
              <label>Address<textarea required rows="3" value={address.address} onChange={(event) => setAddress({ ...address, address: event.target.value })} /></label>
              <div className="checkout-address-row">
                <label>City<input required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} /></label>
                <label>PIN code<input required inputMode="numeric" maxLength="6" value={address.pincode} onChange={(event) => setAddress({ ...address, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) })} /></label>
              </div>
              <p className="order-demo-note">Frontend demo only — no real payment or order service is connected.</p>
              <button type="submit" className="button button-primary">Place Demo Order</button>
              <button type="button" className="checkout-cancel" onClick={() => setCheckoutOpen(false)}>Back to cart</button>
            </form>
          ) : (
            <>
              {searchParams.get("checkout") === "true" && <p className="success-message">You're signed in. Your cart is ready.</p>}
              <button type="button" className="button button-primary" onClick={checkout}>Proceed to Checkout</button>
              <Link to="/products" className="continue-link">Continue Shopping</Link>
            </>
          )}
        </aside>
      </section>
    </>
  );
}
