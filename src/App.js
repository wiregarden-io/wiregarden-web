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
} from "react-router-dom";
import {
  Container,
  Button,
  Navbar, Nav, Row, Col, Dropdown,
  Table,
  Card,
  Spinner,
} from "react-bootstrap";

import { authContext } from './auth.js';

import { useAuth0 } from "@auth0/auth0-react";

import { useApi } from './api.js';

import diagram from './wiregarden-dia.svg';

import { About } from './about.js';

const noSnap = navigator.userAgent !== 'ReactSnap';

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
      <Nav className="mr-auto">
        {isAuthenticated ? (<Nav.Link as={Link} to="/networks">Networks</Nav.Link>) : (<></>)}
        <Nav.Link as={Link} to="/install">Install</Nav.Link>
        <Nav.Link as={Link} to="/about">About</Nav.Link>
        <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
      </Nav>
      <Auth0Nav />
      </Navbar>
      <Switch>
        <Route exact path="/"><Welcome /></Route>
        <Route exact path="/networks"><Subscriptions /></Route>
        <Route exact path="/install"><Install /></Route>
        <Route exact path="/about"><About /></Route>
        <Route exact path="/contact"><Contact /></Route>
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

function Welcome() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  return <Container><Row className="align-items-center">
  <Col sm={6}>
    <h3>Grow your own networks. Connect your devices.</h3>
     {isAuthenticated ? (
      <p>Welcome back {user.nickname || user.name}, let's <Link to="/networks">manage your networks</Link>!</p>
     ) : (
      <>
        <p>Wiregarden makes it easy to build private networks secured by <a href="https://www.wireguard.com/" target="_">Wireguard</a>.</p>
        <p><Link onClick={() => loginWithRedirect()}>Login</Link> and <Link to="/install">install</Link> to get started!</p>
      </>
     )}
  </Col>
  <Col sm={6}>
      <div><img alt="illustrated wiregarden network" height={768} src={diagram} /></div>
  </Col>
  </Row></Container>;
}

const SubscriptionContext = createContext("subscription");

function Subscriptions() {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const subs = useApi({method: 'GET', url: '/api/v1/subscription', asJson: true});
  const [selected,setSelected] = useState(null);
  const [subToken,setSubToken] = useState(null);
  function setSubscription(s) {
    setSelected(s);
    setSubToken((s !== null) ? s.tokens[0].token : null);
  }
  // Clear selection on unload
  useEffect(() => {
    return () => { setSelected(null); setSubToken(null); };
  }, [isAuthenticated]);
  if (!isAuthenticated && noSnap) {
    loginWithRedirect({redirectUri: window.location.origin + '/install'});
    return;
  }
  if (isLoading || subs.loading) {
    return <Loading />;
  } else if (subs.response != null) {
    // Select first subscription if none selected
    if (selected === null && subs.response.subscriptions.length > 0) {
       setSubscription(subs.response.subscriptions[0]);
    }
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
      <hr />
      <h3>Add devices</h3>
      <GettingStarted />
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
      <p>No devices found.</p>
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

function GettingStarted(props) {
  const token = useContext(authContext);
  const { isAuthenticated } = useAuth0();
  var tokenDisplay;
  if (token !== undefined) {
    tokenDisplay = token.token
  } else {
    tokenDisplay = <i><Link to="/networks">{isAuthenticated ? <>View Networks</> : <>Login</>}</Link>_to_get_your_token</i>
  }
  return <>
    <p>{props.fromInstall ? (<>Start a network</>) : (<>
      <Link to="/install">Install Wiregarden</Link> and start a network
    </>)} on a device that will be network-accessible to all the others.</p>
    <p className="border"><code> sudo env WIREGARDEN_SUBSCRIPTION={tokenDisplay} wiregarden up --network my-net --endpoint my-public-ip:my-public-port</code></p>
    <p>Add other devices to the network.</p>
    <p className="border"><code> sudo env WIREGARDEN_SUBSCRIPTION={tokenDisplay} wiregarden up --network my-net</code></p>
  </>
}

function Install() {
  return <Container>
    <h2>Install Wiregarden</h2>
    <p>Wiregarden is currently only supported on Linux.</p>

    <h3>1. Download the <a href="https://github.com/wiregarden-io/wiregarden/releases/latest">latest Wiregarden binary release</a> for your platform.</h3>
    <h3>2. Install into your <code>$PATH</code> as <code>wiregarden</code>.</h3>
    <p><code>sudo cp wiregarden_linux_amd64 /usr/local/bin/wiregarden</code></p>
    <p><code>sudo chmod +x /usr/local/bin/wiregarden</code></p>
    <h3>3. One-time setup</h3>
    <p>Install Wireguard dependencies and the systemd service agent: <code>sudo wiregarden setup</code></p>
    <h2>Add devices</h2>
    <GettingStarted fromInstall={true} />
  </Container>;
}

function Contact() {
  return <Container>
    <h2>Contact</h2>
    <p><a href="https://github.com/wiregarden-io">wiregarden-io on Github</a></p>
    <p><a href="mailto:support@wiregarden.io">Email support@wiregarden.io</a></p>
  </Container>;
}
