# Keybank Admin Panel

Administration dashboard for the Keybank smart-locker platform. The UI talks to the existing API through RTK Query. Authentication is a bearer access token. There is no refresh-token or logout endpoint in the current contract.

## Requirements

- Node.js 22 or newer
- The API must allow the browser origin. The current server sends `Access-Control-Allow-Origin: http://localhost:3000`, so the Vite dev and preview servers are pinned to port 3000.

## Setup

```bash
npm install
cp .env.example .env
```

Set both values in `.env`. They are required at startup:

```
VITE_API_BASE_URL=http://10.10.26.164:5001/api/v1
VITE_SOCKET_URL=http://10.10.26.164:5001
```

Do not commit `.env`.

## Scripts

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm test           # vitest run
npm run build      # tsc -b && vite build
npm run preview    # http://localhost:3000
```

## Authentication

| Step | Method and path | Notes |
| --- | --- | --- |
| Login | `POST /auth/login` | Body `{ email, password }`. Password minimum is 8 characters. Response data includes `accessToken` and `role`. |
| Forgot password | `POST /auth/forgot-password` | The collection path `/auth/forget-password` returns 404 on this host. |
| Verify OTP | `POST /auth/verify-otp` | Body `{ email, oneTimeCode }` with a code from 1000 to 9999. The reset token is read from the `Authorization` response header, then from `resetToken`, `accessToken`, or `token` in the body. |
| Reset password | `POST /auth/reset-password` | Header `Authorization: Bearer <reset token>`. Body `{ newPassword, confirmPassword }` only. Extra token fields are rejected. |
| Change password | `POST /auth/change-password` | Signed-in administrator. |
| Profile | `GET /user/profile`, `PATCH /user/profile` | Profile update is multipart: `name`, `email`, `contact`, `address`, `image`. |

Only `ADMIN` and `SUPER_ADMIN` can enter the panel. A 401 on an authenticated request clears the session. Logout is client-side: the API does not provide a logout route.

The access token and the in-progress reset token are stored in `sessionStorage` under `keybank.admin.session`. That keeps them to the current tab. The API does not issue HttpOnly cookies, so the browser cannot keep the token out of JavaScript. Tokens are not written to logs.

## Real-time notifications

`VITE_SOCKET_URL` accepts an Engine.IO v4 connection. The Postman collection does not name any Socket.IO events or a handshake. The client sends the access token as `auth.token` and listens with `onAny`. A payload is applied only when it matches the HTTP notification shape (`_id`, `title`, `message`, `isRead`). Unknown events are ignored. The UI shows the socket connection state and does not pretend that a live event stream is confirmed.

HTTP notifications:

- `GET /communication/notification?page=&limit=`
- `PATCH /communication/notification/mark-as-read/:id`
- `PATCH /communication/notification/mark-as-read`

There is no unread-count endpoint. The badge counts unread items on the loaded page and shows `N+` when that page is full of unread items and more pages exist.

## Other integrated routes

All paths are relative to `VITE_API_BASE_URL`.

- Dashboard: `GET /admin/dashboard/stats`, `GET /admin/statistics/users?year=`, `GET /admin/statistics/revenue?year=`, recent `GET /audit-logs`
- Users: `GET /admin/users`, `PATCH /admin/users/change-status/:id`
- Lockers: `GET /locker`, `GET /locker/:lockerId`, `POST /locker/create`, `PATCH /locker/update/:id`, `DELETE /locker/delete/:id`
- Bookings: `GET /admin/bookings`, `GET /admin/bookings/:id`, `PATCH .../cancel`, `PATCH .../refund`
- Transactions: `GET /admin/transactions`
- Plans: `GET/POST /plan`, `PATCH/DELETE /plan/:id`
- Reports: `GET /report`, `PATCH /report/:id/status`
- FAQs: `GET/POST /faq`, `PATCH/DELETE /faq/:id`
- Legal content: `GET /disclaimer?type=`, `POST /disclaimer` with `{ type, content }` for `terms`, `privacy`, and `about`

## Not available from this backend

- Administrator create, edit, delete, role assignment, and a permission catalog. The user list is the customer directory.
- Refresh tokens and a server logout.
- Named Socket.IO notification events.
- An aggregate compartment or availability statistic. Per-locker box availability comes from `GET /locker/:lockerId`. `GET /locker/:id/box-details` is not called because its response body is not documented.
- Remote box open and pickup-PIN changes. Those routes expect a customer token.
- `POST /auth/social-signin` and switch-role return 404 on this host.
- `GET /disclaimer` for `privacy` and `about` can return 500 when no content has been saved. The settings form still allows a first save.

## Tests

Vitest globals are enabled. Test files must not import `describe`, `it`, `expect`, or `vi` from `vitest`. With Vite 8, that import resolves to a second runner instance and collection fails. DOM matchers are registered in `src/test/setup.ts` against the global `expect`.
