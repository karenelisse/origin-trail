# Origin Trail

Origin Trail is a fun side project I'm building to answer a surprisingly annoying question:

**Where did this product actually come from?**

A brand might be based in one country, owned by a company in another, and manufacture its products somewhere else entirely. Food makes it even messier, because where something was grown might be somewhere else again.

Origin Trail tries to untangle that.

Given a product, it researches and returns information about:

- the product and brand
- who manufactured it
- where it was manufactured
- where it was grown, when relevant
- where the brand is headquartered
- who ultimately owns the brand
- where that parent company is headquartered
- the sources supporting those claims
- how confident it is in the result

## The idea

This started as a small project because I wanted an easier way to understand where the things I buy actually come from. I try to buy local where I can, and I'm also conscious about buying from, or deliberately not buying from, certain countries.

The backend is only one part of the idea. Eventually I'd like to play around with a few different ways of using the data:

- scanning a barcode while shopping
- searching for a product by name
- using a browser extension to identify products while shopping online
- letting users set their own preferences about where and who they want to buy from

The important bit is that Origin Trail doesn't decide whether a product is "good" or "bad." It provides the information and lets the person using it decide what matters to them.

This is very much a side project. I'm building it because it's interesting, because I want to use it, and because it's a good excuse to play with some technology.

## How it works

The API uses OpenAI and web search to research a product and return structured product data. Yep, part of the reason I built it this way was because I wanted to play around with AI integrations, including how much useful information I could get without burning through tokens.

Where possible, results include sources supporting manufacturing, brand and parent company information, as well as a confidence level when the available information isn't definitive.

The backend keeps geography factual and structured:

```json
{
  "country": "United States",
  "stateRegion": "Hawaii",
  "cityTown": "Honolulu"
}
```

How that gets displayed is left to the frontend. This means places like Hawaiʻi, Puerto Rico and Guam can be treated as distinct regions in the UI while keeping the underlying data consistent.

## Tech

### TypeScript, Node.js and Express

The API is written in TypeScript and runs on Node.js with Express. TypeScript is what I work with most, so it was an easy choice for a small API where I wanted to spend my time experimenting with the product rather than learning a new language or framework just for the sake of it.

### OpenAI Responses API

Product information can be surprisingly difficult to pin down, particularly when the brand, manufacturer and parent company are all different.

I'm using the OpenAI Responses API with web search to research those relationships and return structured data with supporting sources.

This was also an excuse to play around with AI integrations, structured outputs, prompt design and how much useful information I could get without burning through unnecessary tokens.

### Zod

Zod validates the data coming into and out of the API.

It's particularly useful here because the same schema can define what I expect from OpenAI's structured output while also giving me the corresponding TypeScript types. This keeps the runtime validation and TypeScript definitions in sync rather than maintaining both separately.

### OpenAPI

The API has an OpenAPI specification so the endpoints and their expected inputs and outputs have a machine-readable definition.

As Origin Trail grows, I'd also like to use this as the contract between the backend and its different clients rather than having the frontend, browser extension and any future apps each make their own assumptions about the API.

## What's next?

Things I'd like to add as I keep playing with it:

- a frontend
- barcode lookup and scanning
- a browser extension
- authentication
- user preferences
- caching and a database

## Running locally

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp src/config/.env.example src/config/.env
```

Add your OpenAI API key and choose a model:

```env
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-5.6-luna
PORT=8008
```

Then:

```bash
npm run dev
```

By default the API runs on port `8008`.

Yes, I picked 8008 on purpose.

## API

### Health

```http
GET /health
```

### Resolve a product

```http
POST /api/products/resolve
```

Example:

```json
{
  "name": "Tim Tam Original",
  "brand": "Arnott's"
}
```

Origin Trail researches the product and returns structured origin information with supporting sources where they can be reliably identified.

## API keys

`src/config/.env` is intentionally ignored by Git.

Do not commit your OpenAI API key.

Seriously. Don't.