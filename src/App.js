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
import {
  Container,
  Navbar, Nav, Row, Col, Dropdown,
  Table,
  Card,
} from "react-bootstrap";

import { authContext, useAuth, useProvideAuth } from './auth.js';

import { useAuth0 } from "@auth0/auth0-react";

import { useApi } from './api.js';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={() => loginWithRedirect()}>Auth0 Login</button>;
};

const LogoutButton = () => {
  const { logout } = useAuth0();
  return <button onClick={() => logout({ returnTo: window.location.origin })}>Auth0 Logout</button>;
};

export default function App() {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
    <Router>
      <Navbar bg="light">
      <Navbar.Brand href="/">Wiregarden</Navbar.Brand>
      <Nav activeKey="/" className="mr-auto">
        <Nav.Link as={Link} to="/">Home</Nav.Link>
      </Nav>
      <Auth0Nav />
      <Nav>
      {auth.token != null ? (
      <>
        <Nav.Link as={Link} onClick={auth.logout}>Logout</Nav.Link>
      </>
      ) : (
      <>
        <Nav.Link as={Link} to="/login">Login</Nav.Link>
      </>
      )}
      </Nav>
      </Navbar>
      <Switch>
        <Route exact path="/">
        {auth.token != null ? (<Subscriptions />) : (<Home />)}
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
      </Switch>
    </Router>
    </authContext.Provider>
  );
}

function Auth0Nav() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  if (isLoading) {
    return <Nav>Loading...</Nav>;
  }
  if (isAuthenticated) {
    return <Nav><Dropdown as={Nav.Item}>
      <Dropdown.Toggle as={Nav.Link}>
        <img height={32} width="auto" src={user.picture} alt={user.name} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header>Signed in as {user.name}</Dropdown.Header>
        <Dropdown.Item><LogoutButton /></Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown></Nav>;
  } else {
    return <Nav><LoginButton /></Nav>;
  }
}

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
  const user = useApi({method: 'GET', url: '/api/v1/user', asJson: true});
  const subs = useApi({method: 'GET', url: '/api/v1/subscription', asJson: true});
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
      <h3>Subscriptions for {user.response.name}</h3>
      <Container fluid><Row noGutters>
        <Col sm={12} md={4} lg={4} xl={3}>
        <Nav>
        {subs.response.subscriptions.map((sub) => {
          return <Nav.Item key={sub.id} onClick={(e) => {setSubscription(sub);}}><Subscription sub={sub} /></Nav.Item>
        })}
        </Nav>
        </Col>
        <Col sm={12} md={8} lg={8} xl={9}>
      {subToken !== null ? (
      <authContext.Provider value={{token: subToken}}>
        <Devices />
      </authContext.Provider>
      ) : (<></>)}
        </Col>
      </Row></Container>
      </SubscriptionContext.Provider>
    );
  }
}

function Subscription(props) {
  const sub = props.sub;
  const selected = useContext(SubscriptionContext);
  const variant = (selected !== null && selected.id === sub.id) ? "primary" : "";
  return <Container>
    <Card border={variant}>
    <Card.Body>
      <Card.Title>{sub.plan.name}</Card.Title>
      <Card.Text>
        <dl className="dl-horizontal">
          <dt>ID</dt><dd>{sub.id}</dd>
          <dt>Created</dt><dd>{sub.created}</dd>
          <dt>Plan</dt><dd><pre>{JSON.stringify(sub.plan, null, '  ')}</pre></dd>
        </dl>
      </Card.Text>
    </Card.Body>
  </Card>
  </Container>
}

function Devices() {
  const sub = useContext(SubscriptionContext);
  const token = useContext(authContext);
  const devices = useApi({method: 'GET', url: '/api/v1/device', asJson: true, cond: token});
  return (
    <Container fluid>
      <h2>Networks</h2>
      {devices.response == null ? (
      <p>Loading...</p>
      ) : (
      devicesByNetwork(devices.response.devices).map((n) => {
      return <>
      <h3>{n.networkName}</h3>
      <Table size="sm" responsive striped border={true} hover><thead>
      <tr><th>Subnet</th><td>{n.subnet}</td></tr>
      <tr><th>Device</th><th>Address</th><th>Public key</th><th>Rendezvous</th></tr>
      </thead><tbody>
      {n.devices.map((d) => {
        return <tr key={d.device.id}><td>{d.device.name}</td><td>{d.device.addr}</td><td>{d.device.publicKey}</td><td>{d.device.endpoint}</td></tr>;
      })}
      </tbody></Table>
      </>
      })
      )}
    </Container>
  );
}

function devicesByNetwork(devices) {
  if (devices == null) {
    devices = [];
  }
  const grouped = devices.reduce((acc, value) => {
    if (!acc[value.network.name]) {
      acc[value.network.name] = [];
    }
    acc[value.network.name].push(value);
    return acc;
  }, {});
  var result = [];
  for (var key in grouped) {
    var network = {networkName: key, subnet: grouped[key][0].network.address, devices: grouped[key]};
    network.devices.sort((a, b) => {return a.device.name < b.device.name});
    result.push(network);
  }
  result.sort((a, b) => {return a.networkName < b.networkName});
  return result;
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
