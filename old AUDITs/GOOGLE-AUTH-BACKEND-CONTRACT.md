# GOOGLE-AUTH-BACKEND-CONTRACT.md

**Date:** 2026-06-29  
**Task:** Part 3 of 3 — Backend Integration Contract for Google Authentication  
**Status:** Documentation only. No backend calls are active. No production code is enabled.

---

## ENDPOINT CONTRACT

### POST /auth/google

#### Purpose
Exchange a Google ID token (obtained client-side via the Google Identity Services SDK)
for an AegisLex session. The backend validates the token with Google, creates or
updates the user record, and returns a standard AegisLex session response.

#### Request
```
POST /auth/google
Content-Type: application/json
```

```json
{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ii4uLiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `googleToken` | `string` | ✅ Yes | Google ID token (JWT) obtained from the Google Identity Services JS SDK via `CredentialResponse.credential`. |
| `deviceId` | `string` | ❌ Optional | Device fingerprint for session tracking. Same value sent by email/password login. |

> **Note:** The frontend `GoogleAuthRequest` model uses the field name `idToken`.
> Align field naming with the backend developer during implementation. Either rename
> the frontend field to `googleToken` or the backend field to `idToken` — they must match.

---

#### Success Response (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "user": {
    "id": "usr-abc123",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "role": "lawyer",
    "organizationName": "Smith & Associates",
    "avatarUrl": "https://lh3.googleusercontent.com/a/...",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2026-01-15T10:30:00Z",
    "lastLoginAt": "2026-06-29T09:00:00Z",
    "preferences": {
      "theme": "dark",
      "language": "en",
      "notifications": {
        "email": true,
        "push": true,
        "analysisComplete": true,
        "reportReady": true
      }
    }
  }
}
```

> **Critical:** The response shape must be IDENTICAL to `POST /auth/login`.
> The frontend stores the session using the same `SessionService.setSession()` call
> regardless of whether the user authenticated via Google or email/password.
> Any shape difference will break the frontend session pipeline.

---

#### Error Responses

| HTTP Status | Error Code | Trigger Condition |
|------------|------------|-------------------|
| `400 Bad Request` | `MISSING_TOKEN` | `googleToken` field is absent or empty. |
| `400 Bad Request` | `MALFORMED_TOKEN` | `googleToken` is not a valid JWT string. |
| `401 Unauthorized` | `INVALID_TOKEN` | Token signature validation against Google's public keys fails. |
| `401 Unauthorized` | `TOKEN_EXPIRED` | `exp` claim in the Google ID token has passed. |
| `401 Unauthorized` | `WRONG_AUDIENCE` | `aud` claim does not match this application's Google Client ID. |
| `401 Unauthorized` | `WRONG_ISSUER` | `iss` claim is not `accounts.google.com` or `https://accounts.google.com`. |
| `403 Forbidden` | `EMAIL_NOT_VERIFIED` | `email_verified` claim in the Google token is `false`. |
| `403 Forbidden` | `ACCOUNT_DISABLED` | The matching AegisLex user account is disabled (`isActive = false`). |
| `409 Conflict` | `EMAIL_PROVIDER_CONFLICT` | A user with this email already exists but registered via email/password. |
| `429 Too Many Requests` | `TOO_MANY_REQUESTS` | Rate limit exceeded on this endpoint. |
| `500 Internal Server Error` | `GOOGLE_VALIDATION_FAILED` | Backend could not reach Google's validation endpoint. |
| `500 Internal Server Error` | `SERVER_ERROR` | Unexpected backend error. |

#### Error Response Shape
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The provided Google token is invalid or has expired."
  }
}
```

---

## TOKEN VALIDATION CHECKLIST

The backend must perform ALL of the following validations before creating a session.

### 1. Token Format Validation
- [ ] Confirm the token is a three-part dot-separated string (JWT format).
- [ ] Decode the header, payload, and signature without trusting the content yet.

### 2. Google Signature Verification
- [ ] Fetch Google's public keys from:  
      `https://www.googleapis.com/oauth2/v3/certs`  
      (cache with the `Cache-Control` / `max-age` response header)
- [ ] Match the `kid` (key ID) header of the incoming token to the correct public key.
- [ ] Verify the RS256 signature using the matched public key.
- [ ] Reject the token immediately if verification fails.

### 3. Audience Validation (`aud`)
- [ ] Confirm the `aud` claim exactly matches your Google OAuth 2.0 Client ID  
      (e.g. `123456789012-abc...apps.googleusercontent.com`).
- [ ] Reject tokens with any other audience — this prevents token reuse from other apps.

### 4. Issuer Validation (`iss`)
- [ ] Confirm the `iss` claim is either:
  - `accounts.google.com`, OR
  - `https://accounts.google.com`
- [ ] Reject any other issuer.

### 5. Expiry Validation (`exp`)
- [ ] Confirm `exp` (Unix timestamp) is in the future relative to the server clock.
- [ ] Allow a maximum clock-skew tolerance of **60 seconds** to handle minor time drift.
- [ ] Reject expired tokens.

### 6. Not-Before Validation (`nbf` / `iat`) — Optional but Recommended
- [ ] If `nbf` is present, confirm the current time is after `nbf`.
- [ ] If `iat` is present, confirm it is not unreasonably far in the past (e.g. > 5 minutes).

### 7. Email Verification
- [ ] Confirm `email_verified: true` in the token payload.
- [ ] Reject users whose email Google has not verified.

---

## USER UPSERT LOGIC

After token validation, the backend must:

### Lookup Strategy (in order)
1. Search for an existing user by `googleId` (stored as `AuthProvider.GoogleId` — see database review).
2. If not found by `googleId`, search by `email` (from the token's `email` claim).
3. If not found at all: **create** a new user.

### Case A: User Found by `googleId`
- Update `lastLoginAt`.
- Update `avatarUrl` if the token provides a new `picture` claim.
- Return the existing user's session.

### Case B: User Found by `email` (no `googleId` yet)
- Check `authProvider` on the existing record.
- If `authProvider = 'local'` (email/password): return `409 EMAIL_PROVIDER_CONFLICT`.
  - Do NOT merge accounts automatically — this is a security risk.
  - The frontend will display an error: "An account with this email already exists. Please sign in with your email and password."
- If `authProvider = 'google'` (googleId was null but email matched): link the `googleId` to the existing record and return a session.

### Case C: New User
- Create a new User record with:
  ```
  id:               UUID
  firstName:        token.given_name
  lastName:         token.family_name
  email:            token.email
  googleId:         token.sub
  authProvider:     'google'
  avatarUrl:        token.picture (if present)
  emailVerified:    true (validated above)
  isActive:         true
  role:             'viewer' (default — upgrade via admin panel)
  createdAt:        NOW()
  preferences:      default preferences object
  ```

### JWT Generation (same as email/password login)
After the upsert, generate and return:
- `accessToken`: signed JWT with `userId`, `role`, `email`, `exp = NOW + 1h`
- `refreshToken`: opaque random string, stored in DB with `userId`, `exp = NOW + 30d`
- Standard `LoginResponse` shape (see above)

---

## SECURITY NOTES

### What the frontend NEVER does
- The frontend NEVER stores or transmits the Google Client Secret.
- The frontend NEVER makes direct HTTP calls to Google's token endpoint.
- The frontend NEVER exchanges an authorization code for tokens.
- The frontend only receives a Google ID token (JWT) from the GIS SDK popup
  and passes it to this backend endpoint for server-side validation.

### OAuth State Parameter
In the popup flow (used here), OAuth state is not required because the GIS SDK
handles CSRF protection internally via the popup mechanism. If the implementation
is later changed to a redirect flow, implement and verify the `state` parameter.

### PKCE
Not required for the server-side validation flow described here. PKCE is required
if the backend itself initiates an OAuth authorization code flow with PKCE.

### Nonce
- The frontend can optionally generate a cryptographic nonce, include it in the
  `initialize()` call, and pass it to the backend.
- The backend should verify the nonce matches the `nonce` claim in the Google token.
- This prevents token replay attacks. Recommended for high-security deployments.

### CSRF Protection
- The `/auth/google/callback` endpoint should validate the `Origin` or `Referer`
  header to ensure the request originates from the AegisLex frontend domain.
- Standard CSRF tokens are not applicable to this JSON API endpoint.

### Token Replay Prevention
- Google ID tokens have a short expiry (typically 1 hour).
- Consider storing a record of consumed token `jti` claims in a short-lived cache
  (Redis with TTL = token expiry) to prevent token reuse within its validity window.

### Rate Limiting
- Apply rate limiting on this endpoint (e.g. 10 requests per IP per minute).
- Log failed validation attempts for audit purposes.

---

## REFRESH TOKEN AND LOGOUT

The Google session uses the IDENTICAL refresh token and logout flow as email/password:
- `POST /auth/refresh-token { refreshToken }` → new accessToken
- `POST /auth/logout { refreshToken }` → invalidate session

No Google-specific refresh or revocation logic is needed on the frontend.
The backend should NOT call Google's token revocation endpoint on logout
(the AegisLex session is separate from the Google session).
