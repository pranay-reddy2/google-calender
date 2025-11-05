import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/useAuthStore";
import "./Login.css";

function Login() {
  const { loginWithGoogle, error } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      // Error is handled by store
      console.error("Login error:", err);
    }
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
  };

  return (
    <div className="login-page">
      {/* Hero Section */}
      <div className="login-hero">
        <div className="login-container">
          {/* Left Side - Branding & Info */}
          <div className="login-content">
            <div className="login-logo-section">
              <svg className="login-logo" viewBox="0 0 24 24" fill="#4285F4">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
              <h1 className="login-brand">Calendar</h1>
            </div>

            <h2 className="login-headline">
              Spend less time planning and more time doing
            </h2>

            <p className="login-description">
              Get Calendar on your phone and stay organized wherever you are.
              Create events, set reminders, and collaborate with others all in
              one place.
            </p>

            <div className="login-features">
              <div className="feature-item">
                <svg
                  className="feature-icon"
                  viewBox="0 0 24 24"
                  fill="#5F6368"
                >
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
                <div>
                  <h3 className="feature-title">Multiple calendars</h3>
                  <p className="feature-desc">
                    Organize your schedule with different calendars
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <svg
                  className="feature-icon"
                  viewBox="0 0 24 24"
                  fill="#5F6368"
                >
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <div>
                  <h3 className="feature-title">Share & collaborate</h3>
                  <p className="feature-desc">
                    Share calendars with your team and family
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <svg
                  className="feature-icon"
                  viewBox="0 0 24 24"
                  fill="#5F6368"
                >
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <div>
                  <h3 className="feature-title">Smart reminders</h3>
                  <p className="feature-desc">
                    Never miss important events with timely notifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Card */}
          <div className="login-card-container">
            <div className="login-card">
              <div className="card-header">
                <svg className="card-logo" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
                <h2 className="card-title">Sign in</h2>
                <p className="card-subtitle">to continue to Calendar</p>
              </div>

              {error && (
                <div className="error-message">
                  <svg
                    className="error-icon"
                    viewBox="0 0 24 24"
                    fill="#EA4335"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  auto_select={false}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="320"
                />
              </div>

              <div className="card-footer">
                <p className="footer-text">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>

            <div className="help-links">
              <a href="#" className="help-link">
                Help
              </a>
              <span className="help-divider">•</span>
              <a href="#" className="help-link">
                Privacy
              </a>
              <span className="help-divider">•</span>
              <a href="#" className="help-link">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
