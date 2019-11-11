import { deployContract } from '~/utils/solidity/deployContract';
import { Environment } from '~/utils/environment/Environment';
import { Contracts } from '~/Contracts';

export const deployGivethBridgeAdapter = async (
  environment: Environment,
  args,
) => {
  const address = await deployContract(
    environment,
    Contracts.GivethBridgeAdapter,
    [args],
  );

  return address;
};
