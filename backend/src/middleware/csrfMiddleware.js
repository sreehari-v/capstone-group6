// Simple double-submit CSRF protection middleware
export default function csrfProtection(req, res, next) {
    // Safe methods don't require CSRF
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(req.method)) return next();

    // Skip certain auth endpoints that must be accessible without CSRF
    const skipPrefixes = [
        "/api/auth/login",
        "/api/auth/signup",
        "/api/auth/verify-email",
        "/api/auth/resend-verification",
        "/api/auth/google",
        "/api/auth/google/callback",
        "/api/auth/refresh",
    ];
    for (const p of skipPrefixes) {
        if (req.path.startsWith(p)) return next();
    }

    const cookie = req.cookies?.csrfToken;
    const header = req.get("X-CSRF-Token") || req.get("x-csrf-token");
    if (!cookie || !header) return res.status(403).json({ message: "Missing CSRF token" });
    if (cookie !== header) return res.status(403).json({ message: "Invalid CSRF token" });
    return next();
}
