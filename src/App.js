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
} from "react-router-dom";

import logo from './logo.svg';
import './App.css';

const authContext = createContext();

export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {
  const [token, setToken] = useState(localStorage.getItem('userToken'));
  useEffect(() => {
    if (token != null) {
      localStorage.setItem('userToken', token);
    } else {
      localStorage.removeItem('userToken');
    }
  })
  function logout() {
    setToken(null);
    localStorage.removeItem('userToken');
  }
  return {
    token,
    setToken,
    logout,
  };
}

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
          <li>wtf: {auth.token}</li>
          <li><Link to="/networks">Networks</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li><Link to="" onClick={auth.logout}>Logout</Link></li>
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
  return (
    <div>
      <h2>Wiregarden console</h2>
      <p>This is the home console for wiregarden.</p>
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
  function handleLogin(e) {
    e.preventDefault();
    auth.setToken(input);
  }
  return (
    <form>
      <input placeholder="User Token" type="textarea" value={input} onChange={setInput} />
      <button onClick={handleLogin}>Login</button>
    </form>
  );
}
