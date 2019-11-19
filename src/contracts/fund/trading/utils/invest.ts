import { register } from '~/contracts/fund/policies/transactions/register';
import { requestInvestment } from '~/contracts/fund/participation/transactions/requestInvestment';
import { executeRequest } from '~/contracts/fund/participation/transactions/executeRequest';
import { FunctionSignatures } from '~/contracts/fund/trading/utils/FunctionSignatures';
import { calcGav } from '~/contracts/fund/accounting/calls/calcGav';
import { getToken } from '~/contracts/dependencies/token/calls/getToken';
import { getFundHoldings } from '~/contracts/fund/accounting/calls/getFundHoldings';
import { approve } from '~/contracts/dependencies/token/transactions/approve';

import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { createQuantity } from '@melonproject/token-math';

import { LogLevels } from '~/utils/environment/Environment';

export const invest = async (_environment, _tokenSymbol, _amount) => {
  const info = _environment.logger(
    'Midas-Technologies-AG/protocol:test-givethModule:INVEST:',
    LogLevels.INFO,
  );
  info('Start invest().');

  const { melonContracts } = _environment.deployment;
  const { policies } = melonContracts;

  // TODO: pass in policies(Copied from generalWalkthrough.test.ts)
  await register(_environment, _environment.routes.policyManagerAddress, {
    method: FunctionSignatures.makeOrder,
    policy: policies.priceTolerance,
  });
  await register(_environment, _environment.routes.policyManagerAddress, {
    method: FunctionSignatures.takeOrder,
    policy: policies.priceTolerance,
  });
  await register(_environment, _environment.routes.policyManagerAddress, {
    method: FunctionSignatures.requestInvestment,
    policy: policies.userWhitelist,
  });
  info(
    'GAV empty',
    await calcGav(_environment, _environment.routes.accountingAddress),
  );

  const token = getTokenBySymbol(_environment, _tokenSymbol);
  const investmentAmount = createQuantity(token, _amount);
  const fundToken = await getToken(
    _environment,
    _environment.routes.sharesAddress,
  );

  await approve(_environment, {
    howMuch: investmentAmount,
    spender: _environment.routes.participationAddress,
  });
  await requestInvestment(
    _environment,
    _environment.routes.participationAddress,
    {
      investmentAmount,
      requestedShares: createQuantity(fundToken, 1),
    },
  );
  await executeRequest(_environment, _environment.routes.participationAddress);
  info(
    'Executed request',
    await calcGav(_environment, _environment.routes.accountingAddress),
  );

  return await getFundHoldings(
    _environment,
    _environment.routes.accountingAddress,
  );
};
