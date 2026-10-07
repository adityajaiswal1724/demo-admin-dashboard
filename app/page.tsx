"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_LOGIN, DEMO_SESSION_KEY } from "@/lib/demo-auth";
import { APPOINTMENT_FEE_PENCE } from "@/lib/config";
import { money } from "@/lib/data";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Users,
  CalendarDays,
  CreditCard,
} from "lucide-react";
export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_SESSION_KEY) === "true")
      router.replace("/overview");
  }, [router]);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your Username and password.");
      return;
    } // Presentation gate only. These public demo credentials are not secure authentication.
    if (username.trim() === DEMO_LOGIN.username && password === DEMO_LOGIN.password) {
      sessionStorage.setItem(DEMO_SESSION_KEY, "true");
      router.push("/overview");
    } else setError("The Username or password is incorrect. Please try again.");
  }
  return (
    <main className="login">
      <section className="login-story">
        <Link className="wordmark" href="/">
          Demo
        </Link>
        <div className="login-story-main">
          <span className="eyebrow">A LITTLE CLARITY. A BIG DIFFERENCE.</span>
          <h1>
            Every customer.
            <br />
            One complete picture.
          </h1>
          <p>
            Bring the moments that matter together.
            <br />
            From a first purchase to their next appointment.
          </p>
          <div className="login-preview">
            <div className="row between">
              <div className="row">
                <span className="avatar">EH</span>
                <div>
                  <strong>Emily Hart</strong>
                  <small>A familiar face, a complete story.</small>
                </div>
              </div>
              <Users size={20} />
            </div>
            <div className="preview-line">
              <span className="icon-tile sage">
                <CreditCard size={18} />
              </span>
              <div>
                <strong>A purchase made</strong>
                <small>Shopify · Order activity</small>
              </div>
              <span className="preview-check">✓</span>
            </div>
            <div className="preview-line">
              <span className="icon-tile lavender">
                <CalendarDays size={18} />
              </span>
              <div>
                <strong>A moment booked</strong>
                <small>
                  TidyCal · {money(APPOINTMENT_FEE_PENCE)} appointment
                </small>
              </div>
              <span className="preview-check">✓</span>
            </div>
            <div className="preview-foot">
              <Layers3 size={15} /> Five platforms. One customer view.
            </div>
          </div>
        </div>
        <div className="login-story-footer">
          A complete view of customer activity.<span>SAMPLE DATA ONLY</span>
        </div>
      </section>
      <section className="login-form-section">
        <div className="login-form">
          <div className="login-emblem">
            <LockKeyhole size={22} />
          </div>
          <span className="eyebrow">YOUR CUSTOMER DASHBOARD</span>
          <h2>Welcome to Demo</h2>
          <p>Your customer activity, together in one place.</p>
          <aside className="demo-credentials" aria-labelledby="demo-credentials-title">
            <h3 id="demo-credentials-title">Demo login details</h3>
            <p>Use these credentials to explore the dashboard.</p>
            <dl>
              <dt>Username / ID</dt>
              <dd><code>{DEMO_LOGIN.username}</code></dd>
              <dt>Password</dt>
              <dd><code>{DEMO_LOGIN.password}</code></dd>
            </dl>
          </aside>
          <form onSubmit={submit} noValidate>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              autoComplete="username"
              placeholder="Enter your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-required="true"
            />
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-required="true"
              />
              <button
                type="button"
                className="icon-button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary login-submit">
              Log in <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-notice">
            <ShieldCheck size={16} /> Demo environment — sample data only
          </div>
        </div>
        <footer>
          Demo Customer Dashboard <span>Fictional data · Presentation demo</span>
        </footer>
      </section>
    </main>
  );
}
