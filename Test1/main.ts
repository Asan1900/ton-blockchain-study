import { getHttpEndpoint } from "@orbs-network/ton-access";
import { mnemonicToWalletKey } from "ton-crypto";
import { TonClient, WalletContractV4, fromNano, internal } from "ton";

async function main() {
    const mnemonic = "nominee decorate category dose wool tribe result monitor hungry seminar clever panda three target wheat cupboard net road future joy fence seven top claim";
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

    const endpoint = await getHttpEndpoint({network: "testnet"});
    const client = new TonClient({ endpoint });

    console.log(wallet.address)
    console.log(await client.isContractDeployed(wallet.address))

    if (!await client.isContractDeployed(wallet.address)) {
        return console.log("wallet is not deployed")
    }

    
    // 0.05 EQDnw8YGsU1zneqeCdxcwL-jeQwLRJ5ksyXNdOsm9WKBfB5O
    const balance = await client.getBalance(wallet.address);
    console.log("balance: ", fromNano(balance))

    const walletContract = client.open(wallet)
    const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
       secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: "EQCQO1XhfcnkQ7I3RnZk5knWFiaq9wIV9vGrJ-5FI2L33whO",
                value: "0.5", 
                body: "Hello", 
                bounce: false,
            })
       ]
    });

    let currentSeqno = seqno;
    while(currentSeqno == seqno){
       console.log("waiting transaction is confirmed...");
        await sleep(1500);
        currentSeqno = await walletContract.getSeqno();
    }
    console.log("transaction confirmed");
}

main()

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
