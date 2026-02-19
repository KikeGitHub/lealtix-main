Widget build and usage

1. Install required dev dependency for building elements as a single bundle (recommended):

   npm i -D ngx-build-plus

2. Build the widget bundle (after installing):

   npm run build:widget

   This will produce `dist/widget/main.js` (single bundle if build tooling supports it).

3. Host the `main.js` on a CDN or static server and provide tenants a snippet:

   <script src="https://cdn.example.com/widget/main.js"></script>
   <offer-widget widget-token="<TOKEN>" api-base="https://api.example.com"></offer-widget>

4. Backend expectations:
- Endpoint POST `/widget/register` that validates the token (JWT) and stores the payload.
- CORS configured or validate Origin header.

Notes:
- Depending on Angular CLI version you may need `ngx-build-plus` and a custom builder to produce a single-file bundle.
