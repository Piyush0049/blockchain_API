import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Load environment variables
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ABI of your deployed contract
const ABI = [
  "function storeClaim(string claimHash, string metadata) public",
  "function getClaim(address user, string claimHash) public view returns (string metadata)",
  "event ClaimStored(address indexed user, string claimHash, string metadata)"
];

class BlockchainClient {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.wallet);
  }

  // Store hashed content on blockchain
  async storeClaim(claimHash, metadata) {
    const tx = await this.contract.storeClaim(claimHash, metadata);
    console.log("⛓️ Blockchain TX sent:", tx.hash);
    await tx.wait();
    console.log("✅ Claim stored on-chain");
    return tx.hash;
  }

  // Retrieve metadata from blockchain
  async getClaim(claimHash) {
    const result = await this.contract.getClaim(this.wallet.address, claimHash);
    return result;
  }
}

export default new BlockchainClient();
