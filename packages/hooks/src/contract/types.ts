import { Address } from "viem";
import { OnChainRiddle$Type } from "./OnChainRiddle";

export interface BaseContractConfig {
  address: Address;
  enabled?: boolean;
}

export type OnChainRiddleAbi = OnChainRiddle$Type["abi"];
