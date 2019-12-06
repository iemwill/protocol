import * as R from 'ramda';

import { appendDecimals, toBI } from '@melonproject/token-math';
import { randomString } from '~/utils/helpers/randomString';
import { beginSetup } from '~/contracts/factory/transactions/beginSetup';
import { completeSetup } from '~/contracts/factory/transactions/completeSetup';
import { createAccounting } from '~/contracts/factory/transactions/createAccounting';
import { createFeeManager } from '~/contracts/factory/transactions/createFeeManager';
import { createParticipation } from '~/contracts/factory/transactions/createParticipation';
import { createPolicyManager } from '~/contracts/factory/transactions/createPolicyManager';
import { createShares } from '~/contracts/factory/transactions/createShares';
import { createTrading } from '~/contracts/factory/transactions/createTrading';
import { createVault } from '~/contracts/factory/transactions/createVault';
import { getRoutes } from '~/contracts/fund/hub/calls/getRoutes';
import { Environment, LogLevels } from '~/utils/environment/Environment';
import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';

const DAY_IN_SECONDS = 60 * 60 * 24;

const setupFund = async (environment: Environment, name?) => {
  const fundName = name ? name : `test-fund-${randomString()}`;

  const debug = environment.logger(
    'melon:protocol:tests:setupFund',
    LogLevels.DEBUG,
  );

  debug('Setting up testfund', fundName);

  const { exchangeConfigs, melonContracts } = environment.deployment;

  const weth = getTokenBySymbol(environment, 'WETH');
  const mln = getTokenBySymbol(environment, 'MLN');
  const dai = getTokenBySymbol(environment, 'DAI');
  const fees = [
    {
      feeAddress: melonContracts.fees.managementFee.toLowerCase(),
      feePeriod: toBI(DAY_IN_SECONDS * 45),
      feeRate: appendDecimals(weth, 0.002),
    },
    {
      feeAddress: melonContracts.fees.performanceFee.toLowerCase(),
      feePeriod: toBI(DAY_IN_SECONDS * 90),
      feeRate: appendDecimals(weth, 0.02),
    },
  ];

  await beginSetup(environment, melonContracts.version, {
    defaultTokens: [weth, mln, dai],
    exchangeConfigs,
    fees,
    fundName,
    manager: environment.wallet.address,
    quoteToken: weth,
  });
  await createAccounting(environment, melonContracts.version);
  await createFeeManager(environment, melonContracts.version);
  await createParticipation(environment, melonContracts.version);
  await createPolicyManager(environment, melonContracts.version);
  await createShares(environment, melonContracts.version);
  await createTrading(environment, melonContracts.version);
  await createVault(environment, melonContracts.version);
  const hubAddress = await completeSetup(environment, melonContracts.version);
  const routes = await getRoutes(environment, hubAddress);

  expect(R.keys(routes)).toEqual(
    expect.arrayContaining([
      'accountingAddress',
      'feeManagerAddress',
      'participationAddress',
      'policyManagerAddress',
      'priceSourceAddress',
      'registryAddress',
      'sharesAddress',
      'tradingAddress',
      'vaultAddress',
      'versionAddress',
    ]),
  );

  return { ...routes, hubAddress };
};

export { setupFund };
