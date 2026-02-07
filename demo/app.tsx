import React, { createContext, useReducer } from "react";
import { createRoot } from "react-dom/client";

// ⬇️ mock backend
import { installMockFetch } from "./mockFetch.ts";
installMockFetch();

import { createRouter } from "../src/index.ts";
import routesMap from "./routes.tsx";
import reducer, { initialState } from "./reducer.ts";

// --- Store is REQUIRED ---
export const StateContext = createContext(null);

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

// Router now takes (routes, storeContext)
const AppRouter = createRouter(routesMap, StateContext);

const root = createRoot(document.getElementById("root"));
root.render(
  <StateProvider>
    <AppRouter />
  </StateProvider>
);
