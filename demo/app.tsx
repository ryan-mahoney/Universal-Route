import React, { createContext, useReducer } from "react";
import { createRoot } from "react-dom/client";

// ⬇️ mock backend
import { installMockFetch } from "./mockFetch";
installMockFetch();

import { createRouter } from "../src";
import routesMap from "./routes";
import reducer, { initialState } from "./reducer";

// --- Store is REQUIRED ---
type DemoStoreContextValue = {
  state: Record<string, unknown>;
  dispatch: React.Dispatch<Record<string, unknown>> | false;
};

export const StateContext = createContext<DemoStoreContextValue>({
  state: initialState,
  dispatch: false,
});

const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

// Router now takes (routes, storeContext)
const AppRouter = createRouter(routesMap, StateContext);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing #root element in demo/index.html");
}

const root = createRoot(rootElement);
root.render(
  <StateProvider>
    <AppRouter />
  </StateProvider>,
);
