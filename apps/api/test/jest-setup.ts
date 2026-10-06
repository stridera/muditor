if (process.env.MUDITOR_DB_STUB === undefined) {
  process.env.MUDITOR_DB_STUB = '1';
}

// Auth fails fast without a signing secret; give tests a deterministic one.
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'jest-test-jwt-secret';
}
