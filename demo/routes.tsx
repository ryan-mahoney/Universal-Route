import React from "react";
import { Link } from "../src/index.ts";

export const Home = (props: {}) => {
  return (
    <div style={{ padding: 24 }}>
      <h1>Home</h1>
      <p>This is a tiny demo using the modernized router.</p>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users/42">User 42</Link>
        <Link to="/about/dogs/hounds/buster">About Buster</Link>
      </nav>
      <pre style={{ background: "#f6f8fa", padding: 12, marginTop: 16 }}>
        {JSON.stringify({ state: props }, null, 2)}
      </pre>
    </div>
  );
};

export const About = (props: {}) => {
  return (
    <div style={{ padding: 24 }}>
      <h1>About</h1>
      <p>Try navigating with modifier keys to open in a new tab.</p>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users/123">User 123</Link>
        <Link to="/about/dogs/hounds/buster">About Buster</Link>
      </nav>
      <pre style={{ background: "#f6f8fa", padding: 12, marginTop: 16 }}>
        {JSON.stringify({ state: props }, null, 2)}
      </pre>
    </div>
  );
};

export const AboutDogs = ({ params }: { params: string }) => {
  return (
    <div style={{ padding: 24 }}>
      <h1>About Dogs</h1>
      <p>Params: {params}</p>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users/123">User 123</Link>
      </nav>
    </div>
  );
};

export const User = ({ id }: { id: string }) => {
  return (
    <div style={{ padding: 24 }}>
      <h1>User</h1>
      <p>
        User ID: <strong>{id}</strong>
      </p>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </div>
  );
};

const routesMap = {
  "/": Home,
  "/about": About,
  "/users/:id": User,
  "/about/dogs/:params+": AboutDogs,
};

export default routesMap;
