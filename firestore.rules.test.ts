import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

test('firestore.rules enforces global default deny catch-all first', () => {
  assert.match(rulesContent, /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/);
});

test('firestore.rules isolates PII under users/{userId}/private', () => {
  assert.match(rulesContent, /match \/private\/\{docId\}/);
  assert.match(rulesContent, /allow get: if isValidId\(userId\) && isValidId\(docId\) && \(isOwner\(userId\) \|\| isAdmin\(\)\)/);
});

test('firestore.rules prevents self-assignment of admin role and non-admin official cards', () => {
  assert.match(rulesContent, /\(incoming\(\)\.role == 'user' \|\| isAdmin\(\)\)/);
  assert.match(rulesContent, /incoming\(\)\.isOfficial == false/);
  assert.match(rulesContent, /incoming\(\)\.moderationStatus == 'pending'/);
});

test('firestore.rules enforces terminal state lock on battles and trades and prevents self-trade', () => {
  assert.match(rulesContent, /existing\(\)\.status == 'active'/);
  assert.match(rulesContent, /existing\(\)\.status in \['open', 'offered'\]/);
  assert.match(rulesContent, /existing\(\)\.sellerId != request\.auth\.uid/);
});

test('firestore.rules enforces verified email for admin bootstrap and write mutations', () => {
  assert.match(rulesContent, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesContent, /isValidId\(id\)/);
});
