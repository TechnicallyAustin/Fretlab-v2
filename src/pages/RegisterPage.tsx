// src/pages/RegisterPage.tsx

import { useState } from "react";
import { useAuth } from "../lib/auth";
import { Link, useNavigate } from "react-router";

export function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await register(displayName, email, password);
      navigate("/"); // Redirect to home page after successful registration
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--fl-canvas)",
      fontFamily: "var(--fl-font)"
    }}>
      <form onSubmit={handleSubmit} style={{ 
        background: "var(--fl-surface)", 
        border: "1px solid var(--fl-line)", 
        borderRadius: "var(--fl-r-xl)", 
        padding: "32px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "var(--fl-shadow)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ 
            width: 72, height: 72, 
            borderRadius: "50%", 
            background: "var(--fl-accent)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 12H22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 2V4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 12H5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 20V22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M20.7964 5.6873L19.0629 7.42083" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M6.16342 18.5162L7.90001 16.7796" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M20.7964 18.5162L19.0629 16.7796" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M6.16342 5.6873L7.90001 7.42083" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontWeight: 700, color: "var(--fl-ink)" }}>Create account</h1>
          <p style={{ margin: "0 0 24px", fontSize: "0.9rem", color: "var(--fl-ink-3)" }}>Join FretLab to start your practice journey</p>
        </div>

        {error && (
          <div style={{ 
            padding: "12px", 
            borderRadius: "var(--fl-r-md)", 
            background: "var(--fl-error-soft)", 
            border: "1px solid var(--fl-error-line)", 
            color: "var(--fl-error)",
            marginBottom: 20,
            fontSize: "0.88rem"
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="display-name" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--fl-ink)", marginBottom: 8 }}>Display name</label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px 14px", 
              borderRadius: "var(--fl-r-md)", 
              border: "1px solid var(--fl-line)", 
              background: "var(--fl-surface-sunk)",
              color: "var(--fl-ink)",
              fontFamily: "var(--fl-font)",
              fontSize: "0.9rem"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="email" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--fl-ink)", marginBottom: 8 }}>Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px 14px", 
              borderRadius: "var(--fl-r-md)", 
              border: "1px solid var(--fl-line)", 
              background: "var(--fl-surface-sunk)",
              color: "var(--fl-ink)",
              fontFamily: "var(--fl-font)",
              fontSize: "0.9rem"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="password" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--fl-ink)", marginBottom: 8 }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px 14px", 
              borderRadius: "var(--fl-r-md)", 
              border: "1px solid var(--fl-line)", 
              background: "var(--fl-surface-sunk)",
              color: "var(--fl-ink)",
              fontFamily: "var(--fl-font)",
              fontSize: "0.9rem"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="confirm-password" style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--fl-ink)", marginBottom: 8 }}>Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "12px 14px", 
              borderRadius: "var(--fl-r-md)", 
              border: "1px solid var(--fl-line)", 
              background: "var(--fl-surface-sunk)",
              color: "var(--fl-ink)",
              fontFamily: "var(--fl-font)",
              fontSize: "0.9rem"
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{ 
            width: "100%", 
            padding: "14px", 
            borderRadius: "var(--fl-r-md)", 
            border: "none",
            background: "var(--fl-accent)",
            color: "#fff",
            fontFamily: "var(--fl-font)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            marginBottom: 20
          }}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>

        <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--fl-ink-4)" }}>
          <p>Already have an account? <Link to="/login" style={{ color: "var(--fl-accent)", textDecoration: "none" }}>Sign in</Link></p>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginTop: 24,
          padding: "8px 0",
          borderTop: "1px solid var(--fl-line-soft)"
        }}>
          <a href="/terms" style={{ color: "var(--fl-ink-3)", fontSize: "0.8rem", textDecoration: "none" }}>Terms & Privacy</a>
          <a href="/support" style={{ color: "var(--fl-ink-3)", fontSize: "0.8rem", textDecoration: "none" }}>Support</a>
        </div>
      </form>
    </div>
  );
}