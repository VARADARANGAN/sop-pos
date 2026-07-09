import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api/v1";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Retrieve token from localStorage if it exists (fallback)
  const getStoredToken = () => localStorage.getItem("token");

  // Call API helper
  const apiRequest = async (endpoint, options = {}) => {
    const token = getStoredToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Something went wrong");
    }
    return result;
  };

  // Re-verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiRequest("/auth/me");
        if (res.success) {
          // If we retrieve profile, set user state
          setUser(res.data);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Session verification failed", err.message);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.success && res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request failed on server", err.message);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  const forgotPassword = async (email) => {
    return await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (token, newPassword) => {
    return await apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    hasRole: (roles) => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    apiRequest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
