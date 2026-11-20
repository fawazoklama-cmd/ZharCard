# ZharCard Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity & Role Integrity**: No user may create a profile with `role == "admin"`, modify their own `role`, or impersonate another `uid` / `creatorId` / `sellerId` / `userId`.
2. **PII Isolation**: User email addresses and notification preferences live strictly under `/users/{userId}/private/{docId}` and are readable only by the owner (`request.auth.uid == userId`) or verified admin.
3. **Official vs Custom Card Separation**: Non-admin users may never create or modify cards with `isOfficial == true` or `moderationStatus == "approved"`.
4. **Server-Authoritative Economy & RNG**: Pack openings require a valid `serverSignature` and non-negative cost; client updates cannot spoof `createdAt`, mutate immutable owner/seller fields, or modify terminal battle/trade states (`status == "finished"`, `status == "completed"`, `status == "cancelled"`).
5. **Query Isolation (Anti-Scraping)**: `allow list` rules on private/user-scoped collections (`pack_openings`, `battles`, `battle_history`, `transactions`, `reports`) evaluate `resource.data.userId == request.auth.uid` (or `playerId` / `reporterId`) without performing `get()`/`exists()` inside list rules.
6. **Path & Size Hardening**: Every document ID path variable passes `isValidId(id)` (`^[a-zA-Z0-9_-]+$`, `<= 128` chars), every string has explicit `.size()` bounds, and every timestamp uses `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Role Escalation on Create**: `{ uid: "attacker", username: "hack", role: "admin", coins: 999999, level: 99, exp: 0, createdAt: serverTime, updatedAt: serverTime }` -> Denied (`role != "user"`).
2. **Role Escalation on Update**: Update `/users/attacker` with `{ role: "admin", updatedAt: serverTime }` -> Denied (`affectedKeys` cannot include `role`).
3. **Shadow Ghost Field Injection**: Create `/users/attacker` with `{ ...validUser, isAdmin: true, vipTier: 99 }` -> Denied (`hasOnly` rejects ghost keys).
4. **Official Card Spoof**: Non-admin creates `/cards/fake_legend` with `{ isOfficial: true, moderationStatus: "approved", creatorId: "attacker" }` -> Denied (`isOfficial == false` required for non-admins).
5. **PII Cross-Read**: Signed-in User B reads `/users/userA/private/info` -> Denied (only owner or admin).
6. **Impersonated Inventory Write**: User A writes `/card_inventory/userB_card1` with `{ userId: "userB", ... }` -> Denied (`userId == request.auth.uid`).
7. **Terminal Battle Tampering**: Update `/battles/b1` where `existing().status == "finished"` -> Denied (terminal state locked).
8. **Terminal Trade Hijack**: Update `/trades/t1` where `existing().status == "completed"` -> Denied (terminal state locked).
9. **Self-Trade Exploitation**: Buyer accepts own trade listing (`/trades/t1` where `existing().sellerId == request.auth.uid` and `buyerId == request.auth.uid`) -> Denied (`sellerId != request.auth.uid` for buy/offer action).
10. **Unverified Admin Email Spoof**: Request with `email == "fawazoklama@gmail.com"` and `email_verified == false` tries to write `/packs/starter` -> Denied (`email_verified == true` mandated).
11. **ID Poisoning**: Create `/cards/../../etc/passwd_giant_1500_char_string` -> Denied (`isValidId` fails).
12. **Client Timestamp Forgery**: Create `/pack_openings/po1` with backdated `createdAt` (`!= request.time`) -> Denied (`incoming().createdAt == request.time`).
