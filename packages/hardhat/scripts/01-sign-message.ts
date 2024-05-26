import { Wallet, getDefaultProvider } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const [, to] = await ethers.getSigners();

  const provider = getDefaultProvider("http://localhost:8545");
  const wallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

  const signer = wallet.connect(provider);

  console.log("Signer address:", signer.address);
  console.log("To address:", to.address);

  const verifyContract = await ethers.getContractAt("YourContract", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

  const message = "hello";
  const nonce = 1;

  const messageHash = await verifyContract.getMessageHash(to.address, 100n, message, nonce);

  console.log("Message hash:", messageHash);

  const ethSignedMessageHash = await verifyContract.getEthSignedMessageHash(messageHash);

  console.log("Eth signed message hash:", ethSignedMessageHash);

  const signature = await signer.signMessage(messageHash);

  console.log("Signature:", signature);

  const verified = await verifyContract.verify(signer.address, to.address, 100n, message, nonce, signature);

  console.log("Verified:", verified);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
