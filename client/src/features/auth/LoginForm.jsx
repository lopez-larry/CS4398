/**
 * @file LoginForm.jsx
 * @description Login form component for authenticating users via email and password.
 */

import React, {useState} from "react";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {login, user} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await login(email, password);
            if (res?.token) {
                localStorage.setItem("token", res.token);
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            const role = res?.user?.role || user?.role;
            if (role === "admin") {
                navigate("/admin");
            } else if (role === "breeder") {
                navigate("/breeder");
            } else if (role === "customer") {
                navigate("/customer");
            } else {
                navigate("/");
            }

        } catch (err) {
            const status = err?.response?.status;
            const msg =
                err?.response?.data?.message ||
                (status === 401 ? "Invalid email or password." : "Login failed.");
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="login-form"
            style={{maxWidth: 400, margin: "auto"}}
        >
            <h2>Login</h2>

            <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control mb-2"
            />

            <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control mb-2"
            />

            <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            <NavLink to="/forgot-password" className="small text-muted mt-2 d-block">
                Forgot Password?
            </NavLink>

            <NavLink to="/register" className="small text-muted mt-2 d-block">
                Register
            </NavLink>

            {error && <p className="text-danger mt-2">{error}</p>}
        </form>
    );
};

export default LoginForm;
