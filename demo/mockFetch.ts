type MockPage = {
  title: string;
  pageData: Record<string, unknown>;
};

type InstallMockFetchOptions = {
  latency?: number;
};

const toUrlString = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

export function installMockFetch({ latency = 120 }: InstallMockFetchOptions = {}): void {
  // simple in-memory routes
  const staticPages: Record<string, MockPage> = {
    "/": { title: "Home", pageData: { blurb: "Welcome to the demo." } },
    "/about": {
      title: "About",
      pageData: { blurb: "This is a mock backend." },
    },
  };
  const userRoute = /^\/users\/([^/]+)$/;

  globalThis.fetch = async (reqUrl: RequestInfo | URL): Promise<Response> => {
    const u = new URL(toUrlString(reqUrl), location.origin);
    const path = u.pathname; // ignore the ?uuid param we add
    let status = 200;
    let data: MockPage | undefined = staticPages[path];

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

    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
}
