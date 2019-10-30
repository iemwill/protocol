import {
  Environment,
  LogLevels,
  Tracks,
  Deployment,
} from '~/utils/environment/Environment';
import {
  constructEnvironment,
  defaultOptions,
} from '~/utils/environment/constructEnvironment';
import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { default as Web3Eth } from 'web3-eth';
import { default as Web3Accounts } from 'web3-eth-accounts';

//import { donateGivethETH } from '~/contracts/exchanges/transactions/donateGivethETH';
//import { donateGivethERC20 } from '~/contracts/exchanges/transactions/donateGivethERC20';

const { cliLogger } = require('~/utils/environment/cliLogger');
const fs = require('fs');

//Load deployment
const _deployment: Deployment = JSON.parse(
  fs.readFileSync(
    'deployments/configs/ropsten-testing/001-givethModuleBeta-1.0.7.json',
    'utf8',
  ),
);

//Create Web3 provider and account with private Key from keystore file.
const _provider = new Web3Eth.providers.WebsocketProvider(
  process.env.JSON_RPC_ENDPOINT,
);
const web3Accounts = new Web3Accounts(_provider);
/*const account = web3Accounts.decrypt(
	JSON.parse(fs.readFileSync(process.env.KEYSTORE_FILE, 'utf8')),
	process.env.KEYSTORE_PASSWORD
);*/

//Prepare wallet attributes
const address = web3Accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
const signTransaction = unsignedTransaction =>
  web3Accounts
    .signTransaction(unsignedTransaction, process.env.PRIVATE_KEY)
    .then(t => t.rawTransaction);
const signMessage = message =>
  web3Accounts.sign(message, process.env.PRIVATE_KEY);

//Create wallet
const _wallet = {
  address,
  signMessage,
  signTransaction,
};

//Create Environment
const environment: Environment = constructEnvironment({
  endpoint: process.env.JSON_RPC_ENDPOINT,
  provider: _provider,
  logger: cliLogger,
  deployment: _deployment,
  options: defaultOptions,
  wallet: _wallet,
  track: Tracks.TESTING,
});

//Logger Settings
const debug = environment.logger(
  'Midas-Technologies-AG/protocol:test-giveth',
  LogLevels.INFO,
);
debug('construct Environment was successfull');

//Create test Fund
const createTestFund = async (environment: Environment) => {
  const fund = await setupFund(environment, 'test-giveth');
  debug('setup Fund was successfull');
  return fund;
};
const testFund = createTestFund(environment);

//Using testFund
debug('Hub address is:', testFund);

export { testFund };
