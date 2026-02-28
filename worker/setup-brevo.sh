#!/usr/bin/env bash
# One-time Brevo setup: creates contact lists and attributes.
# Usage: BREVO_API_KEY=xkeysib-... bash worker/setup-brevo.sh

set -euo pipefail

if [ -z "${BREVO_API_KEY:-}" ]; then
  echo "Error: BREVO_API_KEY env var is required."
  echo "Usage: BREVO_API_KEY=xkeysib-... bash worker/setup-brevo.sh"
  exit 1
fi

API="https://api.brevo.com/v3"
AUTH_HEADER="api-key: $BREVO_API_KEY"
CT="Content-Type: application/json"

# --- Create contact lists ---

echo "=== Creating contact lists ==="

# Fetch existing lists so we can skip duplicates (Brevo allows duplicate names)
EXISTING_LISTS=$(curl -s -X GET "$API/contacts/lists?limit=50&offset=0" -H "$AUTH_HEADER")

for LIST_NAME in "Consumer" "Retailer" "Nonprofit"; do
  # Check if a list with this name already exists
  if echo "$EXISTING_LISTS" | grep -q "\"name\":\"$LIST_NAME\""; then
    EXISTING_ID=$(echo "$EXISTING_LISTS" | grep -oE "\"id\":[0-9]+,\"name\":\"$LIST_NAME\"" | head -1 | grep -o '[0-9]*' | head -1)
    echo "  List '$LIST_NAME' already exists → ID: $EXISTING_ID, skipping."
    continue
  fi

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API/contacts/lists" \
    -H "$AUTH_HEADER" -H "$CT" \
    -d "{\"name\":\"$LIST_NAME\",\"folderId\":1}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "201" ]; then
    LIST_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo "  Created list '$LIST_NAME' → ID: $LIST_ID"
  else
    echo "  Warning: $LIST_NAME → HTTP $HTTP_CODE: $BODY"
  fi
done

# --- Create contact attributes ---

echo ""
echo "=== Creating contact attributes ==="

ATTRIBUTES=(
  SIGNUP_SOURCE
  UTM_SOURCE
  UTM_MEDIUM
  UTM_CAMPAIGN
  UTM_CONTENT
  ZIP_CODE
  CONTACT_NAME
  STORE_NAME
  LOCATION
  ROLE
  ROLE_OTHER
  MESSAGE
  SOURCE_CONTEXT
  ORG_NAME
  ORG_TYPE
  ORG_TYPE_OTHER
  CAMPAIGN_SIZE
)

for ATTR in "${ATTRIBUTES[@]}"; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API/contacts/attributes/normal/$ATTR" \
    -H "$AUTH_HEADER" -H "$CT" \
    -d '{"type":"text"}')

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "204" ]; then
    echo "  Created attribute: $ATTR"
  elif echo "$BODY" | grep -qi "must be unique\|already exist"; then
    echo "  Attribute $ATTR already exists, skipping."
  else
    echo "  Warning: $ATTR → HTTP $HTTP_CODE: $BODY"
  fi
done

# --- Print list IDs for .env ---

echo ""
echo "=== Fetching list IDs for your .env ==="

LISTS_RESPONSE=$(curl -s -X GET "$API/contacts/lists?limit=50&offset=0" \
  -H "$AUTH_HEADER")

echo "$LISTS_RESPONSE" | grep -oE '"id":[0-9]+,"name":"[^"]*"' | while read -r LINE; do
  ID=$(echo "$LINE" | grep -o '"id":[0-9]*' | cut -d: -f2)
  NAME=$(echo "$LINE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  case "$NAME" in
    Consumer) echo "  PUBLIC_CONSUMER_LIST_ID=$ID" ;;
    Retailer) echo "  PUBLIC_RETAILER_LIST_ID=$ID" ;;
    Nonprofit) echo "  PUBLIC_NONPROFIT_LIST_ID=$ID" ;;
  esac
done

echo ""
echo "Done! Copy the list IDs above into your .env file."
