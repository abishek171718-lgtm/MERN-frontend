import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../Components/Logo";
import { authRequest } from "../data/auth";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await authRequest("login", form);
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-back" to="/">← Back to store</Link>
      <section className="auth-card">
        <div className="auth-brand"><Logo /></div>
        <div className="auth-art"><span>🚂</span></div>
        <div className="auth-form-wrap">
          <span className="eyebrow">Welcome back</span>
          <h1>Welcome to Toy Zone</h1>
          <p>Pick up your next great playtime adventure.</p>
          {error && <div className="form-error">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <label>Email Address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
            <div className="auth-options">
              <label className="remember"><input type="checkbox" /> Remember me</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button className="button button-primary auth-submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</button>
          </form>
          <p className="auth-switch">New to Toy Zone? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}
