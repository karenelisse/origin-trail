# Origin Trail

V0 backend API for resolving product provenance using AI.

## Setup

1. Replace `OPENAI_API_KEY=replace-me` in `src/config/.env`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Check `http://localhost:3000/health`.

## Resolve a product

```bash
curl -X POST http://localhost:3000/api/products/resolve \
  -H "Content-Type: application/json" \
  -d '{"name":"Tim Tam Original","brand":"Arnott'\''s"}'
```

## API definition

`origin-trail.yaml` is an OpenAPI 3.1 description of the V0 API.
