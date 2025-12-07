import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI = [
  "function addOrUpdateClaim(bytes32,string)",
  "function getClaim(bytes32) view returns (tuple(bytes32,string,uint256,address,bool))",
  "function claimExists(bytes32) view returns (bool)",
  "event ClaimAdded(bytes32 indexed,string,address)",
  "event ClaimUpdated(bytes32 indexed,string,address)"
];

class BlockchainClient {
  constructor() {
    if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
      throw new Error("❌ Missing ENV variables (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS)");
    }

    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.wallet);

    console.log("📡 Connected to Sepolia + Contract:", CONTRACT_ADDRESS);
  }

  toBytes32(hashHex) {
    if (!hashHex) {
      throw new Error("❌ Hash is missing");
    }

    const clean = hashHex.replace(/^0x/, "");

    if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
      throw new Error("❌ Invalid SHA-256 hash. Must be 64 hex characters.");
    }

    return "0x" + clean;
  }

  async addOrUpdateClaim(hashHex, ipfsCid) {
  const hash32 = this.toBytes32(hashHex);

  const tx = await this.contract.addOrUpdateClaim(hash32, ipfsCid);
  console.log("⛓️ TX sent:", tx.hash);

  const receipt = await tx.wait();

  const gasUsed = BigInt(receipt.gasUsed.toString());

  let effectiveGasPrice = receipt.effectiveGasPrice;

  if (!effectiveGasPrice) {
    const block = await this.provider.getBlock(receipt.blockNumber);
    const baseFee = block.baseFeePerGas ?? 0n;

    const maxPriorityFee = tx.maxPriorityFeePerGas ?? 0n;
    const maxFee = tx.maxFeePerGas ?? 0n;

    const calculated = baseFee + maxPriorityFee;
    effectiveGasPrice = calculated < maxFee ? calculated : maxFee;
  }

  const gasPrice = BigInt(effectiveGasPrice.toString());

  const txCostWei = gasUsed * gasPrice;
  const txCostEth = ethers.formatEther(txCostWei);

  console.log("✅ Claim confirmed in block:", receipt.blockNumber.toString());
  console.log("⛽ Gas Used:", gasUsed.toString());
  console.log("💰 Effective Gas Price (Wei):", gasPrice.toString());
  console.log("💰 Tx Cost (ETH):", txCostEth);

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber.toString(),
    gasUsed: gasUsed.toString(),
    gasPrice: gasPrice.toString(),
    txCostEth
  };
}


  async getClaim(hashHex) {
    const hash32 = this.toBytes32(hashHex);
    const claim = await this.contract.getClaim(hash32);

    return {
      contentHash: claim[0],
      ipfsCid: claim[1],
      timestamp: Number(claim[2]),
      submitter: claim[3],
      exists: claim[4]
    };
  }

  async claimExists(hashHex) {
    const hash32 = this.toBytes32(hashHex);
    return await this.contract.claimExists(hash32);
  }
}

export default new BlockchainClient();
