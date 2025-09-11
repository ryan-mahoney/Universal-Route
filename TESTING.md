# Test Suite for Universal Router (Jest)

This adds an exhaustive Jest test suite for the ESM React router modules:

- `router.js` — Link, navigate, createRouter and RouterView behavior
- `handleHistoryChange.js` — navigation side-effects (fetch, abort, status handling, title, scroll restore)
- `helper.js` — route preparation and matching
- `scroll.js` — sessionStorage-backed scroll state helpers
- `history.js` — test-friendly memory history
- `index.js` — re-exports

## Files created

- `jest.config.cjs`
- `babel.config.cjs`
- `test/setupTests.js`
- `__mocks__/nprogress.js`
- `__mocks__/uuid.js`
- `__tests__/helper.test.js`
- `__tests__/scroll.test.js`
- `__tests__/router.test.jsx`
- `__tests__/handleHistoryChange.test.js`
- `__tests__/index.test.js`
- `__tests__/history.test.js`

## Suggested dev dependencies

```
npm i -D jest babel-jest @babel/preset-env @babel/preset-react @testing-library/react @testing-library/jest-dom history uuid nprogress
```

Then run:

```
npx jest --coverage
```

> Note: If your project uses `"type": "module"`, this configuration keeps tests working via `babel-jest`. The source remains ESM and imports `.js` files directly.