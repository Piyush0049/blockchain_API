import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  console.log("📦 Deploying ClaimRegistry contract...");

  const ClaimRegistry = await ethers.getContractFactory("ClaimRegistry");
  console.log("⏳ Contract factory loaded...");

  const contract = await ClaimRegistry.deploy();
  console.log("⛓️  Deployment tx sent:", contract.deploymentTransaction().hash);

  await contract.waitForDeployment();
  console.log("🎉 Contract deployed!");

  console.log("📍 Contract address:", await contract.getAddress());
}

main().catch((err) => {
  console.error("❌ Deployment failed:");
  console.error(err);
  process.exit(1);
});
