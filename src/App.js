import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useLocation,
  useHistory,
} from "react-router-dom";

import './App.css';

import { authContext, useAuth, useProvideAuth } from './auth.js';

import { useApi } from './api.js';

export default function App() {
  const auth = useProvideAuth();
  console.log(auth);
  return (
    <authContext.Provider value={auth}>
    <Router>
      <div>
        <ul>
          <li><Link to="/">Home</Link></li>
          {auth.token != null ? (
        <>
          <li><Link to="/networks">Networks</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li><Link to="/" onClick={auth.logout}>Logout</Link></li>
        </>
        ) : (
        <>
          <li><Link to="/login">Login</Link></li>
        </>
        )}
        </ul>
        <hr />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/networks">
            <Networks />
          </Route>
          <Route exact path="/admin">
            <Admin />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
    </authContext.Provider>
  );
}

function Home() {
  const resp = useApi('GET', '/api/debug/status', null);
  return (
    <div>
      <h2>Wiregarden console</h2>
      <p>This is the home console for wiregarden.</p>
      <p>{resp.loading ? <span>Loading...</span> : <span>Boing! Boing! The current time is... {resp.response.Server.LocalTime}</span>}</p>
    </div>
  );
}

function Networks() {
  return (
    <div>
      <h2>Networks</h2>
      <p>TODO: manage networks here</p>
    </div>
  );
}

function Admin() {
  return (
    <div>
      <h2>Admin</h2>
      <p>TODO: manage subscriptions, users, sharing, etc.</p>
    </div>
  );
}

function useInput(initialValue){
  const [value,setValue] = useState(initialValue);
  function handleChange(e){
    setValue(e.target.value);
  }
  return [value,handleChange];
}

function Login() {
  const [input, setInput] = useInput('');
  const auth = useAuth();
  let history = useHistory();
  let location = useLocation();
  let { from } = location.state || { from: { pathname: "/" } };
  function handleLogin(e) {
    e.preventDefault();
    if (input != "") {
      auth.setToken(input);
      history.replace(from);
    } else {
      // TODO: flash message
    }
  }
  return (
    <form>
      <div><textarea placeholder="User Token" value={input} onChange={setInput} /></div>
      <div><button onClick={handleLogin}>Login</button></div>
    </form>
  );
}
