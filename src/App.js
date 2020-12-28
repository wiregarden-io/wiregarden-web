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
  Nav,
  Row,
  Col,
  Table,
  ListGroup,
} from "react-bootstrap";

import './App.css';

import { authContext, useAuth, useProvideAuth } from './auth.js';

import { useApi } from './api.js';

export default function App() {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
    <Router>
      <Nav activeKey="/">
        <Nav.Link as={Link} to="/">Home</Nav.Link>
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
      <hr />
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
  const whoami = useApi({method: 'GET', url: '/api/v1/whoami', asJson: false});
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
      <Container fluid><Row noGutters={true} md={10}>
        <Col md={3}>
        <h2>Subscriptions for {user.response.name}</h2>
        <Nav>
        {subs.response.subscriptions.map((sub) => {
          return <Nav.Item key={sub.id} onClick={(e) => {setSubscription(sub);}}><Subscription sub={sub} /></Nav.Item>
        })}
        </Nav>
        </Col>
        <Col md="auto">
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
  const className = (selected !== null && selected.id === sub.id) ? "selected" : "not-selected";
  return <Container className={className}>
    <h3>{sub.plan.name}</h3>
    <ListGroup>
      <ListGroup.Item>{sub.id}</ListGroup.Item>
      <ListGroup.Item>Created at {sub.created}</ListGroup.Item>
      <ListGroup.Item><pre>{JSON.stringify(sub.plan, null, '  ')}</pre></ListGroup.Item>
    </ListGroup>
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
      <Table size="sm" responsive="sm" striped border hover><thead>
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
