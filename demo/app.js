import React from "react";
import { createRoot } from "react-dom/client";

// ⬇️ install mock backend first
import { installMockFetch } from "./mockFetch.js";
installMockFetch();

import { createRouter } from "../src/index.js";
import routesMap from "./routes.js";
import reducer, { initialState } from "./reducer.js";

const AppRouter = createRouter(routesMap, reducer, initialState);

const root = createRoot(document.getElementById("root"));
root.render(<AppRouter />);
