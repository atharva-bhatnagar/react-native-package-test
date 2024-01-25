import {backend, createActor} from '../../src/declarations/backend/index';
import {AuthClient} from '@dfinity/auth-client';
import {HttpAgent, fromHex} from '@dfinity/agent';
import {
  DelegationIdentity,
  Ed25519PublicKey,
  ECDSAKeyIdentity,
  DelegationChain,
} from '@dfinity/identity';

let actor = backend;
var url = new URL(window.location.href);
let authClient;
var params = new URLSearchParams(url.search);

const loginButton = document.getElementById('login');
loginButton.onclick = async e => {
  e.preventDefault();
  let publicKey = params.get('publicKey');
  let appPublicKey = Ed25519PublicKey.fromDer(fromHex(publicKey));
  var middleKeyIdentity = await ECDSAKeyIdentity.generate();
  authClient = await AuthClient.create({identity: middleKeyIdentity});
  await new Promise(resolve => {
    authClient.login({
      identityProvider:
        process.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app'
          : `http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai`,
      onSuccess: resolve,
    });
  });

  const middleIdentity = authClient.getIdentity();
  let middleToApp = await DelegationChain.create(
    middleKeyIdentity,
    appPublicKey,
    new Date(Date.now() + 15 * 60 * 1000),
    {previous: middleIdentity.getDelegation()},
  );

  let delegationChain = middleToApp;

  var delegationString = JSON.stringify(delegationChain.toJSON());

  const encodedDelegation = encodeURIComponent(delegationString);

  var url = `rentspace://auth?delegation=${encodedDelegation}`;
  window.open(url, '_self');

  return false;
};
const redirectBtn = document.getElementById('open');
redirectBtn.onclick = () => {
  const identity = authClient.getIdentity();

  var delegationString = JSON.stringify(identity.getDelegation().toJSON());

  const encodedDelegation = encodeURIComponent(delegationString);

  var url = `rentspace://auth?delegation=${encodedDelegation}`;
  window.open(url, '_self');
  return false;
};
