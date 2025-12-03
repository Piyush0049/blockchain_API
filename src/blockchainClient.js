import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI = [
  "function addOrUpdateClaim(bytes32 _contentHash, string calldata _ipfsCid) external",
  "function getClaim(bytes32 _contentHash) external view returns (tuple(bytes32 contentHash, string ipfsCid, uint256 timestamp, address submitter, bool exists))",
  "function claimExists(bytes32 _contentHash) external view returns (bool)",
  "event ClaimAdded(bytes32 indexed contentHash, string ipfsCid, address indexed submitter)",
  "event ClaimUpdated(bytes32 indexed contentHash, string ipfsCid, address indexed submitter)"
];

class BlockchainClient {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.wallet);
  }

  toBytes32(hashHex) {
    return "0x" + hashHex;
  }

  async addOrUpdateClaim(hashHex, ipfsCid) {
    const hash32 = this.toBytes32(hashHex);

    const tx = await this.contract.addOrUpdateClaim(hash32, ipfsCid);
    console.log("⛓️  TX sent:", tx.hash);

    await tx.wait();
    console.log("✅ On-chain claim stored/updated");

    return tx.hash;
  }

  async getClaim(hashHex) {
    const hash32 = this.toBytes32(hashHex);
    return await this.contract.getClaim(hash32);
  }

  async claimExists(hashHex) {
    const hash32 = this.toBytes32(hashHex);
    return await this.contract.claimExists(hash32);
  }
}

export default new BlockchainClient();
