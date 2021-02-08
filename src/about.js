import {
  Container,
} from "react-bootstrap";

export function About() {
  return <Container>
    <h2>General</h2>
    <h3>What is Wiregarden?</h3>
    <p>Wiregarden is several things:
      <ul>
        <li>An <i>API service</i>, which keeps track of a model of your network
            and propagates that model to all the devices on that network.</li>
        <li>An <i>agent</i> installed onto each device. The agent tracks
            network topology with the API and operates wireguard to apply changes in
            network configuration.</li>
      </ul>
    </p>
    <h3>What is the status of Wiregarden?</h3>
    <p>Wiregarden is currently in "tech preview". A public service is
       available, to which users can sign up and use immediately. The tech
       preview is available at no cost.
    </p>
    <h3>Is Wiregarden stable? Is it production ready?</h3>
    <p>I rely on Wiregarden to connect to my own infrastructure securely. I
       built Wiregarden because I wanted a service just like this, and was not happy with
       any of the alternatives.
    </p>
    <p>Free access to a tech preview comes with no guarantee of SLA or uptime.
       However I have skin-in-the-game to provide a good experience, improve the
       service, and launch a commercial offering. I don't want to lose access to my
       devices any more than you do :)
    </p>
    <h3>I'm having a problem with Wiregarden or have a question.</h3>
    <p>Please <a href="https://github.com/wiregarden-io/wiregarden/issues">open
       a Github issue</a> or <a href="mailto:support@wiregarden.io">email</a> if
       it's more of a private matter or security disclosure.
    </p>
    <h3>Is Wiregarden a VPN?</h3>
    <p>In the strict sense of the meaning of that acronym, Wiregarden creates VPNs.</p>
    <h3>Does the world really need yet another VPN?</h3>
    <p>Wiregarden is designed for a specific use case:&nbsp;
       Easy-to-build <i>private</i> internal networks over existing network substrate.
       That substrate may be the public internet. However, obscuring or hiding your
       network identity on the public internet is not its intended purpose. There are
       plenty of other Wireguard VPNs that are designed for providing public network
       egress, and to scale for this purpose. For example, Mozilla or Cloudflare.
    </p>
    <h3>How is Wiregarden different from other private networking solutions then?</h3>
    <p>
      <ul>
        <li>All the source code will be available, including the API service.
            Zero-trust is a great networking ideal; it should also include not placing too
            much trust in one SaaS or vendor.</li>
        <li>A fair pricing model is still being worked out, but I've decided
            against artificial limits on the number of devices per user, even for free
            users. Free users may be rate-limited.</li>
        <li>No special protocols. The agent transparently operates Wireguard,
            using standard commands and configuration files.</li>
      </ul>
    </p>
    <h3>Can I deploy my own Wiregarden API server?</h3>
    <p>Not quite yet, but hopefully soon. I'd like to observe and improve the
       public tech preview instance before making it generally available.
    </p>
    <p>You won't need to talk to a salesperson to do it.</p>
    <h3>When will there be support for more operating systems (macOS, Windows, BSD, etc)</h3>
    <p>Linux is the leading operating system on servers, clouds and embedded
       devices, so it has priority. Still considering options to
       integrate other OSes with Wiregarden, without getting too mired in OS-specific
       networking details.</p>

    { /* TODO: Link to survey */ }

    <h2>Security & Privacy</h2>
    <h3>What does Wiregarden know about my network and devices?</h3>
    <p>The network model stores information about each device, so that it can be replicated to all the others:
      <ul>
        <li>Network and device name (which you assign).</li>
        <li>Private RFC1918 subnet address, which is automatically assigned.</li>
        <li>Public keys of devices. Private keys never leave your device.</li>
        <li>Public endpoint of the rendezvous device used by all the other devices on the network.</li>
      </ul>
    </p>
    <h3>Can the Wiregarden API service see my traffic? Does it keep any logs?</h3>
    <p>Your traffic never transits the Wiregarden service infrastructure. The wiregarden API server stores a
       model of your network topology, so that it can be relayed to all your devices.
       The only activity logged is API activity:
       <ul>
         <li>Polling for network topology changes.</li>
         <li>Pub-sub notifications of network topology changes.</li>
       </ul>
    </p>
    <p>API server usage is monitored to help improve and scale the product.
       Some user identity must be stored to help support the service, but I'm
       otherwise not interested in who you are, as much as the patterns of usage in
       aggregate.
    </p>
    <p>Sign-in with Github is provided for convenience, but it isn't
       mandatory. Feel free to sign up with an isolated email. I don't need your
       social graph :)
    </p>
    <h3>Is Wiregarden "zero-trust" networking?</h3>
    <p>Zero-trust networking is really about defining access policies that
       build trust based on identity, rather than by virtue of being able to connect
       to a network. Wiregarden's network model, by building off of Wireguard,
       naturally identifies devices by their public key identity.
    </p>
    <p>I would say Wiregarden is zero-trust compatible, and could be used to
       build zero-trust policies. I would be especially interested to hear more about
       your needs here.
    </p>

    <h2>Source code</h2>
    <h3>Is the source to Wiregarden available?</h3>
    <p>Yes! <a href="https://github.com/wiregarden-io">wiregarden-io on Github</a>.</p>
    <h3>Is Wiregarden open-source?</h3>
    <p>Wiregarden is released under a Business Source License, which will
       convert to the open source Apache Public License 2.0 after some time. The
       source is available. It would be unreasonable to expect users to install and use
       network security software without providing the source.
    </p>
    <p>I do not believe open-source licenses provide enough protection for small
       innovators. The BSL is a fair compromise; it levels the playing field to allow
       the author to profit from the project, while still preventing bad
       outcomes like proprietary lock-in and abandonware if it fails to become a
       sustainable business.
    </p>
    <h3>Will the source to the API server be available?</h3>
    <p>Yes, once the API server is generally available.</p>
  </Container>;
}
