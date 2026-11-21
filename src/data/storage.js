export const CART_KEY = "toyworld-cart";
export const WISHLIST_KEY = "toyworld-wishlist";
export const USER_KEY = "toyworld-user";
export const STORAGE_EVENT = "toyzone:storage";

export function readStoredValue(key, fallback) {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return fallback;

  try {
    return JSON.parse(storedValue);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Saved data for "${key}" is corrupted. Remove that localStorage item and reload.`);
    }
    throw error;
  }
}

export function writeStoredValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readCart() {
  const cart = readStoredValue(CART_KEY, []);
  if (!Array.isArray(cart) || !cart.every((item) =>
    item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0
  )) {
    throw new Error(`Saved cart data is invalid. Remove the "${CART_KEY}" localStorage item and reload.`);
  }
  return cart;
}

export function readWishlist() {
  const wishlist = readStoredValue(WISHLIST_KEY, []);
  if (!Array.isArray(wishlist) || !wishlist.every((id) => typeof id === "string")) {
    throw new Error(`Saved wishlist data is invalid. Remove the "${WISHLIST_KEY}" localStorage item and reload.`);
  }
  return wishlist;
}

export function saveCart(cart) {
  if (!Array.isArray(cart) || !cart.every((item) =>
    item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0
  )) {
    throw new Error("Cart items must have a product ID and a positive whole-number quantity.");
  }
  writeStoredValue(CART_KEY, cart);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function saveWishlist(wishlist) {
  if (!Array.isArray(wishlist) || !wishlist.every((id) => typeof id === "string")) {
    throw new Error("Wishlist entries must be product IDs.");
  }
  writeStoredValue(WISHLIST_KEY, wishlist);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}
