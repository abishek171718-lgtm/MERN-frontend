import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Components/Logo";
import { authRequest } from "../data/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await authRequest("register", {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });
      navigate("/");
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
        <div className="auth-art register-art"><span>🚀</span></div>
        <div className="auth-form-wrap">
          <span className="eyebrow">Join the fun</span>
          <h1>Create your Toy Zone account</h1>
          {error && <div className="form-error">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <label>Full Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Email Address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
            <label>Confirm Password<input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} /></label>
            <button className="button button-primary auth-submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create Account"}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </section>
    </main>
  );
}
