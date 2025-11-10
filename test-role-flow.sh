#!/bin/bash

API_URL="http://localhost:4000/graphql"

echo "=== Testing Character Role Recalculation Flow ==="
echo ""

# Step 1: Register a new user
echo "1. Creating new test user..."
TIMESTAMP=$(date +%s)
SHORT_ID=${TIMESTAMP: -8}
USERNAME="flowtest${SHORT_ID}"
EMAIL="flowtest${SHORT_ID}@test.local"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { register(input: { username: \\\"$USERNAME\\\", email: \\\"$EMAIL\\\", password: \\\"Test12345\\\" }) { accessToken user { id username email role } } }\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.register.accessToken')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.register.user.id')
INITIAL_ROLE=$(echo "$REGISTER_RESPONSE" | jq -r '.data.register.user.role')

echo ""
echo "✓ User created: $USERNAME (ID: $USER_ID)"
echo "✓ Initial role: $INITIAL_ROLE"
echo ""

# Step 2: Verify initial role is PLAYER
if [ "$INITIAL_ROLE" != "PLAYER" ]; then
  echo "❌ ERROR: Initial role should be PLAYER, got $INITIAL_ROLE"
  exit 1
fi

# Step 3: Link a level 105 character (TestGodChar)
echo "2. Linking level 105 character (TestGodChar)..."
LINK_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation { linkCharacter(data: { characterName: \"TestGodChar\", characterPassword: \"admin123\" }) { id name level } }"
  }')

echo "$LINK_RESPONSE" | jq '.'

# Check if linking succeeded
if echo "$LINK_RESPONSE" | jq -e '.errors' > /dev/null; then
  echo "⚠️  Character linking failed (might be already linked)"
  ERROR_MSG=$(echo "$LINK_RESPONSE" | jq -r '.errors[0].message')
  echo "   Error: $ERROR_MSG"

  if [[ "$ERROR_MSG" == *"already linked"* ]]; then
    echo ""
    echo "3. Unlinking character first..."
    # Get character ID
    CHAR_ID=$(docker exec fierymud-postgres psql -U muditor -d fierydev -t -c "SELECT id FROM \"Characters\" WHERE name = 'TestGodChar'" | tr -d '[:space:]')

    # Unlink the character
    docker exec fierymud-postgres psql -U muditor -d fierydev -c "UPDATE \"Characters\" SET user_id = NULL WHERE name = 'TestGodChar';" > /dev/null

    echo "✓ Character unlinked, retrying..."
    echo ""

    # Retry linking
    LINK_RESPONSE=$(curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "query": "mutation { linkCharacter(data: { characterName: \"TestGodChar\", characterPassword: \"admin123\" }) { id name level } }"
      }')

    echo "$LINK_RESPONSE" | jq '.'
  fi
fi

CHAR_LEVEL=$(echo "$LINK_RESPONSE" | jq -r '.data.linkCharacter.level // empty')

if [ -n "$CHAR_LEVEL" ]; then
  echo ""
  echo "✓ Character linked: TestGodChar (Level $CHAR_LEVEL)"
  echo ""
fi

# Step 4: Verify role was automatically updated to GOD
echo "3. Verifying role was automatically updated..."
ME_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "query { me { id username role } }"
  }')

echo "$ME_RESPONSE" | jq '.'

UPDATED_ROLE=$(echo "$ME_RESPONSE" | jq -r '.data.me.role')

echo ""
if [ "$UPDATED_ROLE" = "GOD" ]; then
  echo "✅ SUCCESS! Role automatically updated from PLAYER → GOD"
else
  echo "❌ ERROR: Expected role to be GOD, got $UPDATED_ROLE"
  exit 1
fi

echo ""
echo "=== User Flow Summary ==="
echo "1. ✓ New user registered with PLAYER role"
echo "2. ✓ Linked level 105 character (TestGodChar)"
echo "3. ✓ Role automatically recalculated to GOD"
echo ""
echo "Frontend Integration:"
echo "- Login at: http://localhost:3000/login"
echo "- Username: $USERNAME"
echo "- Password: Test12345"
echo "- View profile: http://localhost:3000/profile"
echo "- View characters: http://localhost:3000/dashboard/characters"
echo ""
