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
  return (
    <authContext.Provider value={auth}>
    <Router>
      <div>
        <ul>
          <li><Link to="/">Home</Link></li>
          {auth.token != null ? (
        <>
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
          {auth.token != null ? (<Subscriptions />) : (<Home />)}
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

//  const resp = useApi('GET', '/api/debug/status', true);
      //<p>{resp.loading ? <span>Loading...</span> : <span>Boing! Boing! The current time is... {resp.response.Server.LocalTime}</span>}</p>
      //
function Home() {
  return (
    <div>
      <h2>Wiregarden console</h2>
      <p>This is the home console for wiregarden.</p>
    </div>
  );
}

const SubscriptionContext = createContext("subscription");

function Subscriptions() {
  const user = useApi('GET', '/api/v1/user', true);
  const subs = useApi('GET', '/api/v1/subscription', true);
  const whoami = useApi('GET', '/api/v1/whoami', false);
  const [selected,setSelected] = useState(null);
  const [subToken,setSubToken] = useState(null);
  function setSubscription(s) {
    setSelected(s);
    setSubToken((s !== null) ? s.tokens[0].token : null);
  }
  if ((user.response == null) || (subs.response == null)) {
    return "Loading..."
  } else {
    return (
      <SubscriptionContext.Provider value={selected}>
      <div>
        <h2>Subscriptions for {user.response.name}</h2>
        <p>{JSON.stringify(subs.response.subscriptions)}</p>
        <ul>
        {subs.response.subscriptions.map((sub) => {
          return <li key={sub.id}><nav onClick={(e) => {setSubscription(sub);}}><Subscription sub={sub} /></nav></li>
        })}
        </ul>
      </div>
      {subToken !== null ? (
      <authContext.Provider value={{token: subToken}}>
        <Networks />
      </authContext.Provider>
      ) : (<></>)}
      </SubscriptionContext.Provider>
    );
  }
}

function Subscription(props) {
  const sub = props.sub;
  const selected = useContext(SubscriptionContext);
  const className = (selected !== null && selected.id === sub.id) ? "selected" : "not-selected";
  return <div className={className}>
    <h3>{sub.plan.name}</h3>
    <table><tbody>
      <tr><th>Created</th><td>{sub.created}</td></tr>
      <tr><th>ID</th><td>{sub.id}</td></tr>
      <tr><th>Plan</th><td>{JSON.stringify(sub.plan)}</td></tr>
    </tbody></table>
  </div>
}

function Networks() {
  const sub = useContext(SubscriptionContext);
  const token = useContext(authContext);
  const networks = useApi('GET', '/api/v1/device', true);
  console.log("sub", sub.id, "token", token, "networks", networks);
  return (
    <div>
      <h2>Networks</h2>
      {networks.response == null ? (
      <p>Loading...</p>
      ) : (
      <p>{JSON.stringify(networks)}</p>
      )}
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
    if (input !== "") {
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
