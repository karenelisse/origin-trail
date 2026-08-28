# Origin Trail

Origin Trail is a product-provenance API.

## V0.1

This version adds web-search-backed provenance research, sources for production/brand/parent-company claims, cleaner nullable strings, and formal backend geography.

## Setup

Copy the env template:

```bash
cp src/config/.env.example src/config/.env
```

Add your OpenAI API key to `src/config/.env`, then:

```bash
npm install
npm run dev
```

Default server: `http://localhost:8008`

### Resolve a product

`POST /api/products/resolve`

```json
{
  "name": "Tim Tam Original",
  "brand": "Arnott's"
}
```

`src/config/.env` is intentionally ignored by Git. Do not commit API keys.

The backend returns formal geographic facts. Consumer-facing display choices, including treating Hawaii, Puerto Rico, or Guam as distinct top-level UI regions, belong in the frontend rather than canonical API data.
