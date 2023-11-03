import coffee from "./contracts/BuyMeACoffee.sol/BuyMeACoffee.json";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

export default function Home() {
  const contractAddress = "0x12412349717dCD916712220ee18fB6915aE0cc8C";
  const contractABI = coffee.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState("");

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  const onMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("connected account", +account);
      } else {
        console.log("Please connect wallet");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Please connect wallet");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.provider.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const coffeeTxn = await contract.buyCoffee(
          name ? name : "name",
          message ? message : "message",
          { value: ethers.utils.parseEther("0.001") }
        );
        await coffeeTxn.wait();

        console.log("Purchased completed!");

        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMemos = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const memos = await contract.getMemos();
        setMemos(memos);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let contract;
    isWalletConnected();
    getMemos();

    const onNewMemo = (from, timestamp, name, message) => {
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          name,
          message,
        },
      ]);
    };

    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);

      contract.on("newMemo", onNewMemo);

      return () => {
        if (contract) {
          contract.off("newMemo", onNewMemo);
        }
      };
    }
  }, []);

  return (
    <div>
      <main>
        <h1>Buy me a coffee</h1>
        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>Name</label>
                <br />
                <input
                  id="name"
                  type="text"
                  placeholder="name"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label>Message</label>
                <br />
                <textarea
                  rows={3}
                  id="message"
                  placeholder="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
              </div>
              <div>
                <button onClick={buyCoffee}>Send 1 Coffee for 0.001ETH</button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <button onClick={connectWallet}>Connect Wallet</button>
          </div>
        )}
      </main>

      {currentAccount && <h1>Memos received</h1>}

      {currentAccount &&
        memos.map((memo, index) => {
          return (
            <div key={index}>
              <p>{memo.message}</p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          );
        })}
    </div>
  );
}
