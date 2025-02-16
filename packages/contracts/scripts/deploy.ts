import { ethers, network } from 'hardhat';

async function main() {
  const CONTRACT_NAME = "OnChainRiddle";
  const ARGS: any[] = [];
  console.log(`Deploying ${CONTRACT_NAME} contract to ${network.name}`);
  const contract = await ethers.deployContract(CONTRACT_NAME, ARGS, {});
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`${CONTRACT_NAME} deployed to ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
