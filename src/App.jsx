import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Home from "./Pages/Home.jsx";
import About from "./Pages/About";
import Categories from "./Pages/Categories";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import Contact from "./Pages/Contact";
import FAQ from "./Pages/FAQ";
import Terms from "./Pages/Terms";

function ShoppingLayout({ children }) {
  return <><Header /><main>{children}</main><Footer /></>;
}

export default function App() {
  const location = useLocation();
  const authPaths = ["/login", "/register", "/forgot-password"];
  if (authPaths.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<ShoppingLayout><Home /></ShoppingLayout>} />
      <Route path="/about" element={<ShoppingLayout><About /></ShoppingLayout>} />
      <Route path="/categories" element={<ShoppingLayout><Categories /></ShoppingLayout>} />
      <Route path="/products" element={<ShoppingLayout><Products /></ShoppingLayout>} />
      <Route path="/product/:id" element={<ShoppingLayout><ProductDetails /></ShoppingLayout>} />
      <Route path="/cart" element={<ShoppingLayout><Cart /></ShoppingLayout>} />
      <Route path="/contact" element={<ShoppingLayout><Contact /></ShoppingLayout>} />
      <Route path="/faq" element={<ShoppingLayout><FAQ /></ShoppingLayout>} />
      <Route path="/terms" element={<ShoppingLayout><Terms /></ShoppingLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
