import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ComponentType,
  type Context,
  type MouseEvent,
} from "react";
import type { BrowserHistory } from "history";
import history from "./history";
import helper, {
  type PreparedRoute,
  type RouteMatchResult,
  type RoutesInput,
} from "./helper";

export type LinkTo =
  | string
  | {
      pathname: string;
      search?: string;
      hash?: string;
    };

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: LinkTo;
  replace?: boolean;
  state?: unknown;
}

interface StoreContextValue {
  state: Record<string, any>;
  dispatch: ((action: Record<string, unknown>) => void) | false;
  pageRefresher?: unknown;
}

const appHistory: BrowserHistory | null = history;

export const navigate = (to: LinkTo, options: NavigateOptions = {}): void => {
  const { replace = false, state } = options;
  if (replace) appHistory!.replace(to, state);
  else appHistory!.push(to, state);
};

const toHref = (to: LinkTo): string => {
  if (typeof to === "string") return to;
  const { pathname, search = "", hash = "" } = to;
  if (typeof pathname !== "string" || pathname.length === 0) {
    throw new TypeError("Location object 'pathname' must be a non-empty string");
  }
  return `${pathname}${search}${hash}`;
};

const isHttpLikeHref = (href: string): boolean => {
  if (href.startsWith("//")) return false;
  if (
    href.startsWith("/") ||
    href.startsWith("./") ||
    href.startsWith("../") ||
    href.startsWith("?") ||
    href.startsWith("#")
  ) {
    return true;
  }
  const protocolMatch = href.match(/^([a-zA-Z][a-zA-Z\d+.-]*):/);
  if (!protocolMatch) return true;
  const protocol = protocolMatch[1].toLowerCase();
  if (protocol !== "http" && protocol !== "https") return false;
  if (typeof window === "undefined" || !window.location) return false;
  try {
    return new URL(href, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
};

const toClientPath = (to: LinkTo, href: string): LinkTo => {
  if (typeof to !== "string") return to;
  if (!/^https?:/i.test(href)) return to;
  try {
    const url = new URL(href, window.location.href);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return to;
  }
};

const shouldHandleClientNavigation = (
  event: MouseEvent<HTMLAnchorElement>,
  anchorProps: { target?: string; download?: string; href: string },
): boolean => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return false;
  }
  const { target, download, href } = anchorProps;
  if (download !== undefined) return false;
  if (target && target !== "_self") return false;
  return isHttpLikeHref(href);
};

export const Link: React.FC<LinkProps> = ({
  to,
  replace = false,
  state,
  onClick,
  ...rest
}) => {
  const href = toHref(to);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>): void => {
    if (onClick) onClick(e);
    if (!shouldHandleClientNavigation(e, { ...rest, href })) return;
    e.preventDefault();
    const nextTo = toClientPath(to, href);
    if (replace) appHistory!.replace(nextTo, state);
    else appHistory!.push(nextTo, state);
  };

  return <a href={href} onClick={handleClick} {...rest} />;
};

const matchRoute = (
  routes: RoutesInput | PreparedRoute[],
  pathname: string,
): RouteMatchResult => helper.match(routes, pathname);

export const createRouter = (
  routes: RoutesInput,
  storeContext?: Context<StoreContextValue>,
): React.FC<Record<string, any>> => {
  const Router: React.FC<Record<string, any>> = (props) => {
    const appState: StoreContextValue =
      (storeContext && useContext(storeContext)) || { state: props, dispatch: false };

    const { pageRefresher } = appState;
    const { state, dispatch } = appState;

    const preparedRoutes = useMemo(() => helper.prepare(routes), [routes]);

    const currentFromHistory =
      (history?.location?.pathname || "") + (history?.location?.search || "");

    const initialLocation = (state && state.location) || currentFromHistory;
    const lastLocRef = useRef(initialLocation);
    const [loc, setLoc] = useState(initialLocation);

    useEffect(() => {
      if (!history || typeof history.listen !== "function") return;

      const unlisten = history.listen(({ location, action }) => {
        const nextLoc = (location.pathname || "") + (location.search || "");
        if (nextLoc !== lastLocRef.current) {
          lastLocRef.current = nextLoc;
          setLoc(nextLoc);
          if (typeof dispatch === "function") {
            dispatch({
              type: "LOCATION_CHANGED",
              location: nextLoc,
              meta: { action },
            });
          }
        }
      });

      return () => {
        if (typeof unlisten === "function") unlisten();
      };
    }, [dispatch]);

    const activePathname = (loc || "").split("?")[0];
    const matched = useMemo(
      () => matchRoute(preparedRoutes, activePathname),
      [preparedRoutes, activePathname],
    );

    const Component: ComponentType<any> = matched?.Component || (() => null);
    const routeParams = matched?.params || {};

    return (
      <Component
        {...state}
        {...routeParams}
        dispatch={dispatch}
        pageRefresher={pageRefresher}
      />
    );
  };

  return Router;
};

export default createRouter;
