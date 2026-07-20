# GOOGLE-AUTH-DATABASE-REVIEW.md

**Date:** 2026-06-29  
**Task:** Part 3 of 3 — Database Schema Review for Google Authentication  
**Status:** Documentation only. No schema changes are made. No backend models are modified.

---

## OVERVIEW

This document reviews the existing `User` model as expressed in the frontend's
type system and documents the **future database additions** that a backend developer
must implement to support Google Authentication.

No frontend code was changed as a result of this review.

---

## CURRENT USER MODEL (frontend type — `src/app/core/models/index.ts`)

```typescript
export interface User {
  id:               string;
  firstName:        string;
  lastName:         string;
  email:            string;
  avatarUrl?:       string;
  role:             UserRole;
  organizationName?: string;
  createdAt:        string;
  lastLoginAt?:     string;
  isActive:         boolean;
  preferences:      UserPreferences;
}
```

And the extended `UserDto` used in auth responses:
```typescript
export interface UserDto {
  id:               string;
  firstName:        string;
  lastName:         string;
  email:            string;
  role:             UserRole;
  organizationName?: string;
  avatarUrl?:       string;
  isActive:         boolean;
  isVerified?:      boolean;
  createdAt:        string;
  lastLoginAt?:     string;
  preferences:      UserPreferences;
}
```

---

## CURRENT MODEL COMPATIBILITY ASSESSMENT

| Field | Google Auth Compatible? | Notes |
|-------|------------------------|-------|
| `id` | ✅ Yes | UUID — unchanged for Google users |
| `firstName` | ✅ Yes | Populated from Google token `given_name` |
| `lastName` | ✅ Yes | Populated from Google token `family_name` |
| `email` | ✅ Yes | Populated from Google token `email` |
| `avatarUrl?` | ✅ Yes | Populated from Google token `picture` — optional field already exists |
| `role` | ✅ Yes | Default to `'viewer'` on creation; upgradeable via admin |
| `organizationName?` | ✅ Yes | Optional — not available from Google token; left null |
| `isActive` | ✅ Yes | Default `true` on creation |
| `isVerified?` | ✅ Yes | `true` (Google verifies email); optional field already exists in `UserDto` |
| `createdAt` | ✅ Yes | Standard timestamp |
| `lastLoginAt?` | ✅ Yes | Updated on each Google login |
| `preferences` | ✅ Yes | Default preferences object on creation |

**Conclusion:** The existing frontend User model requires **zero changes** to support
Google Authentication response payloads. The backend can return a fully-populated
`UserDto` using existing fields.

---

## REQUIRED DATABASE ADDITIONS (backend only)

The following columns/fields must be added to the backend User table/collection.
These are **backend-only** concerns. The frontend does not read or store them.

### 1. `googleId` (formerly `sub` in the Google token)

| Attribute | Value |
|-----------|-------|
| Column name | `googleId` |
| Type | `VARCHAR(255)` or `TEXT` |
| Nullable | Yes (null for email/password users) |
| Unique | Yes (unique index, nullable) |
| Source | Google ID token `sub` claim (stable per Google account) |
| Purpose | Primary lookup key for returning Google users. More stable than email (Google email can change). |

### 2. `authProvider`

| Attribute | Value |
|-----------|-------|
| Column name | `authProvider` |
| Type | `ENUM('local', 'google')` or `VARCHAR(20)` |
| Nullable | No |
| Default | `'local'` for all existing users |
| Source | Set at registration/first login |
| Purpose | Determines the authentication method. Used to detect email/provider conflicts. |

> **Migration note:** All existing users must be backfilled with `authProvider = 'local'`
> before the Google login endpoint goes live. A failing migration could allow Google users
> to incorrectly overwrite local accounts.

### 3. `profilePictureUrl` (alias for `avatarUrl`)

| Attribute | Value |
|-----------|-------|
| Column name | `profilePictureUrl` OR `avatarUrl` |
| Type | `TEXT` or `VARCHAR(500)` |
| Nullable | Yes |
| Source | Google ID token `picture` claim (Google CDN URL) |
| Purpose | Display user's Google profile photo in the UI. Mapped to `avatarUrl` in the frontend `UserDto`. |

> **Note:** The frontend `User` model already has `avatarUrl?: string`. The backend
> should map its storage column to `avatarUrl` in the API response so the frontend
> displays it immediately without any changes.

### 4. `emailVerified`

| Attribute | Value |
|-----------|-------|
| Column name | `emailVerified` |
| Type | `BOOLEAN` |
| Nullable | No |
| Default | `false` for existing local users (unless they've gone through email verification) |
| Source | Set to `true` when the Google token's `email_verified` claim is `true` |
| Purpose | Tracks whether the user's email address has been verified. |

> **Note:** The frontend `UserDto` already has `isVerified?: boolean`. The backend
> should map `emailVerified` to `isVerified` in the API response.

### 5. `googleRefreshToken` (optional — advanced)

| Attribute | Value |
|-----------|-------|
| Column name | `googleRefreshToken` |
| Type | `TEXT` (encrypted at rest) |
| Nullable | Yes |
| Purpose | If the backend needs to make server-side Google API calls on behalf of the user (e.g. Google Drive access), store the Google refresh token here. |
| Encryption | **Must** be encrypted at rest. Never return in API responses. |

> **Recommended only if** offline Google API access is required. Not needed for
> basic Google Sign-In. Skip unless there is a specific use case.

---

## RECOMMENDED SCHEMA MIGRATION (pseudocode)

```sql
-- Step 1: Add new columns (all nullable, backward-compatible)
ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL,
  ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',
  ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 2: Add unique index on google_id (sparse/partial — allow multiple NULLs)
CREATE UNIQUE INDEX idx_users_google_id ON users(google_id)
  WHERE google_id IS NOT NULL;

-- Step 3: Backfill auth_provider for all existing users
UPDATE users SET auth_provider = 'local' WHERE auth_provider IS NULL OR auth_provider = '';

-- Step 4: Optionally backfill email_verified for users who completed email verification
-- UPDATE users SET email_verified = TRUE WHERE email_verification_completed_at IS NOT NULL;
```

---

## FRONTEND MODEL IMPACT ASSESSMENT

### No frontend model changes are required.

The reason: the additions above (`googleId`, `authProvider`, `emailVerified`) are
**backend-internal fields** that the frontend does not need to read, display, or store.

- `googleId` — backend internal identifier; never exposed to the frontend.
- `authProvider` — backend routing logic; not needed in the frontend.
- `emailVerified` → already maps to `UserDto.isVerified?` (already present).
- `profilePictureUrl` → already maps to `UserDto.avatarUrl?` (already present).

The backend response shape remains identical to the current `LoginResponse` and `UserDto`.
The frontend will display the user's Google profile picture automatically via the
existing `avatarUrl` binding.

---

## FUTURE CONSIDERATION: MULTI-PROVIDER ACCOUNTS

If in the future you want to allow users to link both Google AND email/password to
the same account, consider a separate `user_auth_providers` table:

```sql
CREATE TABLE user_auth_providers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    VARCHAR(20) NOT NULL,   -- 'local', 'google', 'microsoft', etc.
  provider_id VARCHAR(255) NOT NULL,  -- googleId, or email for local
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);
```

This is not required for the initial Google Sign-In implementation described in
this document. Implement only if account linking is a confirmed product requirement.
