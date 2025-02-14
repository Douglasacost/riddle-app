import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OnChainRiddleModule = buildModule("OnChainRiddleModule", (m) => {

  const riddle = m.contract("OnchainRiddle", []);

  return { riddle };
});

export default OnChainRiddleModule; 