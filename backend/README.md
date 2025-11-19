Backend service (Express + MongoDB)

This backend supports local auth and Google OAuth. A new email verification flow is included:

- After signup the server generates a short-lived verification token and sends an email with a verification link.
- The verification endpoint is `GET /api/auth/verify-email?token=...` and will mark the user as verified and redirect to the frontend (`FRONTEND_URL`).

Environment variables (see `.env.example`)
- `SMTP_*` variables are optional. If not provided the server uses a Nodemailer Ethereal test account (dev only) and logs a preview URL to the console.
