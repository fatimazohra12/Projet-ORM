import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import du hook useNavigate
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Initialisation du hook pour la navigation

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de redirection
    if (email && password) {
      navigate("/ORM"); // Redirection vers la page Room
    } else {
      alert("Veuillez remplir tous les champs !");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>LogIn</h1>
        <div className="input-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="password-toggle"
            onClick={togglePasswordVisibility}
            role="button"
          >
            👁
          </span>
        </div>
        <a href="/forgot-password" className="forgot-password">
          Forgot password
        </a>
        <button type="submit" className="login-button">
          Log In
        </button>
      </form>
    </div>
  );
}

export default Login;
