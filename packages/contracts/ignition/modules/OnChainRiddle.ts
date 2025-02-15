import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OnChainRiddleModule = buildModule("OnChainRiddle", (m) => {
  const riddle = m.contract("OnChainRiddle");

  return { riddle };
});

export default OnChainRiddleModule; 