import React, { ComponentType, AnchorHTMLAttributes, Context } from 'react';
import { BrowserHistory, MemoryHistory } from 'history';

interface RouteDefinition {
    path: string;
    Component?: ComponentType<any>;
    element?: ComponentType<any>;
    render?: ComponentType<any>;
    reducerKey?: string;
}
type RouteMapValue = ComponentType<any> | [ComponentType<any>] | [ComponentType<any>, string] | {
    Component?: ComponentType<any>;
    element?: ComponentType<any>;
    render?: ComponentType<any>;
    reducerKey?: string;
};
type RouteMap = Record<string, RouteMapValue>;
type RoutesInput = RouteDefinition[] | RouteMap;
interface PreparedRoute {
    path: string;
    Component: ComponentType<any>;
    reducerKey?: string;
    matcher: (pathname: string) => {
        params: Record<string, string>;
    } | null;
}
interface RouteMatchResult {
    Component: ComponentType<any>;
    params: Record<string, string>;
    reducerKey?: string;
}
declare const _default: {
    prepare: (routes?: RoutesInput) => PreparedRoute[];
    match: (routes: RoutesInput | PreparedRoute[], pathname: string) => RouteMatchResult;
};

type LinkTo = string | {
    pathname: string;
    search?: string;
    hash?: string;
};
interface NavigateOptions {
    replace?: boolean;
    state?: unknown;
}
interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    to: LinkTo;
    replace?: boolean;
    state?: unknown;
}
interface StoreContextValue {
    state: Record<string, any>;
    dispatch: ((action: Record<string, unknown>) => void) | false;
    pageRefresher?: unknown;
}
declare const navigate: (to: LinkTo, options?: NavigateOptions) => void;
declare const Link: React.FC<LinkProps>;
declare const createRouter: (routes: RoutesInput, storeContext?: Context<StoreContextValue>) => React.FC<Record<string, any>>;

declare const appHistory: BrowserHistory | null;
declare const makeMemoryHistory: (initialEntries?: string[]) => MemoryHistory;

interface ProgressAPI {
    start(): void;
    done(): void;
}
interface HandleHistoryChangeOptions {
    history?: BrowserHistory | null;
    fetchImpl?: ((url: string, init?: RequestInit) => Promise<Response>) | null;
    setTitle?: (title: string) => void;
    progress?: ProgressAPI;
}
declare function handleHistoryChange(dispatch: (action: {
    type: string;
    data: Record<string, unknown>;
}) => void, { history, fetchImpl, setTitle, progress, }?: HandleHistoryChangeOptions): () => void;

interface ScrollPosition {
    x: number;
    y: number;
}
declare const getScrollPosition: () => ScrollPosition;
declare const setScrollToSessionStorage: () => void;
declare const setScrollForKey: (key: string, pos?: ScrollPosition) => void;
declare function getScrollFromSessionStorage(key: "*"): Record<string, ScrollPosition>;
declare function getScrollFromSessionStorage(key: string): ScrollPosition | null;

export { Link, type LinkProps, type LinkTo, type NavigateOptions, type PreparedRoute, type RouteDefinition, type RouteMap, type RouteMatchResult, type RoutesInput, type ScrollPosition, appHistory, createRouter, getScrollFromSessionStorage, getScrollPosition, handleHistoryChange, makeMemoryHistory, navigate, _default as routesHelper, setScrollForKey, setScrollToSessionStorage };
