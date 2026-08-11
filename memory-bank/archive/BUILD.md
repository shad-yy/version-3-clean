# Build Notes

## "self is not defined" during `npm run build`

Next.js 14 server bundle (webpack runtime) can reference the browser global `self`, which does not exist in Node. If the build fails at "Collecting page data" with:

```
ReferenceError: self is not defined
    at Object.<anonymous> (...\.next\server\vendors.js:1:1)
```

you can run the build with a Node preload that polyfills `self`:

```bash
node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build
```

To make this the default, in `package.json` set:

```json
"build": "node -r ./polyfill-self.cjs node_modules/next/dist/bin/next build"
```

If you then see a different error (e.g. in `webpack-runtime.js`), it may be an environment or Next.js version issue; consider upgrading Next.js or checking [Next.js discussions](https://github.com/vercel/next.js/discussions) for similar reports.
