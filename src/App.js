import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
  useHistory,
} from "react-router-dom";
import {
  Container,
  Button,
  Navbar, Nav, Row, Col, Dropdown,
  Table,
  Card,
  Spinner,
  Jumbotron,
  Carousel,
} from "react-bootstrap";

import { authContext, useAuth } from './auth.js';

import { useAuth0 } from "@auth0/auth0-react";

import { useApi } from './api.js';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return <Button variant="primary" onClick={() => loginWithRedirect()}>Login</Button>;
};

export default function App() {
  const { isAuthenticated } = useAuth0();
  return (
    <Router>
      <Navbar bg="light">
      <Navbar.Brand as={Link} to="/">Wiregarden</Navbar.Brand>
      <Nav activeKey="/" className="mr-auto">
        {isAuthenticated ? (<Nav.Link as={Link} to="/about">About</Nav.Link>):(<></>)}
        <Nav.Link as={Link} to="/install">Install</Nav.Link>
      </Nav>
      <Auth0Nav />
      </Navbar>
      <Switch>
        <Route exact path="/">{isAuthenticated ? (<Subscriptions />):(<About />)}</Route>
        <Route exact path="/about"><About /></Route>
        <Route exact path="/console"><Subscriptions /></Route>
        <Route exact path="/login">
          <TokenLogin />
        </Route>
        <Route exact path="/install">
          <Install />
        </Route>
      </Switch>
    </Router>
  );
}

function Auth0Nav() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  if (isLoading) {
    return <Nav><Loading /></Nav>;
  }
  if (isAuthenticated) {
    return <Nav><Dropdown as={Nav.Item}>
      <Dropdown.Toggle as={Nav.Link}>
        <img height={32} width="auto" src={user.picture} alt={user.name} />
      </Dropdown.Toggle>
      <Dropdown.Menu align="right">
        <Dropdown.Header>Signed in as {user.name}</Dropdown.Header>
        <Dropdown.Item as="button" onClick={() => logout({ returnTo: window.location.origin })}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown></Nav>;
  } else {
    return <Nav><LoginButton /></Nav>;
  }
}

function Loading() {
  return <Spinner animation="border" role="status">
    <span className="sr-only">Loading...</span>
  </Spinner>;
}

function About() {
  return <Container fluid>
    <Carousel>
      <Carousel.Item>
        <Jumbotron>
          <h3>Grow your own private networks with Wiregarden</h3>
          <p>Wiregarden makes it easy to get started building your own private networks, secured by <a href="https://www.wireguard.com/" target="_">Wireguard</a>.</p>
        </Jumbotron>
      </Carousel.Item>
      <Carousel.Item>
        <Jumbotron>
          <h3>Stay connected, stay updated, automatically</h3>
          <p>Wiregarden operates <a href="https://www.wireguard.com/" target="_">Wireguard</a> to keep all your devices connected.</p>
        </Jumbotron>
      </Carousel.Item>
    </Carousel>
  </Container>;
}

const SubscriptionContext = createContext("subscription");

function Subscriptions() {
  const { isLoading } = useAuth0();
  const subs = useApi({method: 'GET', url: '/api/v1/subscription', asJson: true});
  const [selected,setSelected] = useState(null);
  const [subToken,setSubToken] = useState(null);
  function setSubscription(s) {
    setSelected(s);
    setSubToken((s !== null) ? s.tokens[0].token : null);
  }
  // TODO: apply setSubscription in a useEffect hook?
  useEffect(() => {
    if (selected === null && !isLoading && !subs.loading && subs.response != null) {
      for (var i in subs.response.subscriptions) {
        setSubscription(subs.response.subscriptions[i]);
        return;
      }
    }
    return () => { setSelected(null); setSubToken(null); };
  });
  if (isLoading || subs.loading) {
    return <Loading />;
  } else if (subs.response != null) {
    return (
      <SubscriptionContext.Provider value={selected}>
      <Container fluid><Row noGutters>
        <Col sm={12} md={4} lg={4} xl={3}>
        <h3>Subscriptions</h3>
        <Nav>
        {subs.response.subscriptions.map((sub) => {
          return <Nav.Item key={sub.id} onClick={(e) => {setSubscription(sub);}}><Subscription sub={sub} /></Nav.Item>
        })}
        </Nav>
        </Col>
        <Col sm={12} md={8} lg={8} xl={9}>
      {subToken !== null ? (
      <authContext.Provider value={{token: subToken}}>
        <Networks />
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
      <Card.Text as="div">
        <small>
          <code>{sub.id}</code><br/>
          <span>Created {sub.created}</span><br/>
          <pre><code>{JSON.stringify(sub.plan, null, '  ')}</code></pre>
        </small>
      </Card.Text>
    </Card.Body>
  </Card>
  </Container>
}

function Networks() {
  const token = useContext(authContext);
  const devices = useApi({method: 'GET', url: '/api/v1/device', asJson: true, cond: token});
  return (
    <Container fluid>
      <h2>Networks</h2>
      <DevicesByNetwork devices={devices} />
    </Container>
  );
}

function DevicesByNetwork(props) {
  if (props.devices.loading) {
    return <Loading />;
  } else if (props.devices.response == null) {
    return <></>;
  }
  if (props.devices.response.devices == null) {
    return <>
      <p>No devices found. Try adding some?</p>
      <GettingStarted />
    </>;
  }
  return devicesByNetwork(props.devices.response.devices).map((n) => {
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
    </>;
    });
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

function GettingStarted() {
  const token = useContext(authContext);
  return <>
    <p><Link to="/install">Install Wiregarden</Link> and start a network on a device that will be network-accessible to all the others.</p>
    <p className="border"><code> sudo env WIREGARDEN_SUBSCRIPTION={token.token} wiregarden up --network my-net --endpoint my-public-ip:my-public-port</code></p>
    <p>Then add other devices to your network.</p>
    <p className="border"><code> sudo env WIREGARDEN_SUBSCRIPTION={token.token} wiregarden up --network my-net</code></p>
  </>
}

function useInput(initialValue){
  const [value,setValue] = useState(initialValue);
  function handleChange(e){
    setValue(e.target.value);
  }
  return [value,handleChange];
}

function TokenLogin() {
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

function Install() {
  return <Container fluid>
    <h2>Install Wiregarden</h2>
    <p>Wiregarden is currently only supported on Linux.</p>

    <h3>Quick install on Ubuntu LTS</h3>
    <p>This script installs Wireguard and Wiregarden.</p>
    <p><code>curl --proto '=https' --tlsv1.2 -sSLf https://wiregarden.io/dist/install | bash</code></p>

    <h3>Other Linux</h3>
    <p><a href="https://www.wireguard.com/install/">Install Wireguard</a> for your Linux distribution.</p>
    <p>Download the <a href="https://github.com/wiregarden-io/wiregarden/releases/latest">latest Wiregarden binary release</a>. Install into your <code>$PATH</code> as <code>wiregarden</code>.</p>
    <p>Install the systemd service agent with <code>sudo wiregarden daemon install</code>.</p>
  </Container>;
}
