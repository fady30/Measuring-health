const API_BASE = "https://localhost:3000";

function setSession(tokens) {
    localStorage.setItem("token", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
}

function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("deviceId");
}

async function refreshSession() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        return false;
    }

    const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
        clearSession();
        return false;
    }

    setSession(await response.json());
    return true;
}

async function authFetch(url, options = {}) {
    const buildOptions = () => ({
        ...options,
        headers: {
            ...(options.headers || {}),
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    let response = await fetch(url, buildOptions());

    if (response.status === 401 && await refreshSession()) {
        response = await fetch(url, buildOptions());
    }

    return response;
}
