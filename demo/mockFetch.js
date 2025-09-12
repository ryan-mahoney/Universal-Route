// mockFetch.js
export function installMockFetch({ latency = 120 } = {}) {
  // simple in-memory routes
  const staticPages = {
    "/": { title: "Home", pageData: { blurb: "Welcome to the demo." } },
    "/about": {
      title: "About",
      pageData: { blurb: "This is a mock backend." },
    },
  };
  const userRoute = /^\/users\/([^/]+)$/;

  globalThis.fetch = async (reqUrl) => {
    const u = new URL(reqUrl, location.origin);
    const path = u.pathname; // ignore the ?uuid param we add
    let status = 200;
    let data = staticPages[path];

    if (!data) {
      const m = path.match(userRoute);
      if (m) {
        const id = m[1];
        data = { title: `User ${id}`, pageData: { id, role: "tester" } };
      }
    }
    if (!data) {
      status = 404;
      data = { title: "Not Found", pageData: { path } };
    }

    // simulate network
    await new Promise((r) => setTimeout(r, latency));

    return {
      status,
      json: async () => data,
    };
  };
}
