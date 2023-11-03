import abi from "./contracts/BuyMeACoffee.sol/BuyMeACoffee.json";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x12412349717dCD916712220ee18fB6915aE0cc8C";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
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
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "name",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className=" w-3/5 bg-slate-300 mx-20 my-10 border-2 border-black">
      <main>
        <h1 className="bg-blue-100 border-2 border-black py-2 font-medium flex justify-center">
          Buy Me a Coffee!
        </h1>

        {currentAccount ? (
          <div>
            <form>
              <div className="flex my-3">
                <label className="font-medium rounded-l mx-3 px-5 border-2 border-black">
                  Name
                </label>
                <br />

                <input
                  id="name"
                  type="text"
                  className="border-2 border-black mx-1 rounded-r"
                  placeholder="name"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div className="formgroup border-2 border-black mx-3">
                <label className="">Send Me a message</label>
                <br />

                <textarea
                  rows={3}
                  className="px-10"
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
              </div>
              <div>
                <button
                  type="button"
                  className="bg-blue-500 border-2 border-black rounded-lg my-3 mx-3 px-3 hover:bg-blue-400 hover:text-white"
                  onClick={buyCoffee}
                >
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-3 flex justify-center">
            <button
              className="bg-blue-500 hover:bg-black text-white mx-10 px-5 rounded-xl border-2 border-black"
              onClick={connectWallet}
            >
              Connect your wallet
            </button>
          </div>
        )}
      </main>

      {currentAccount && (
        <h1 className="bg-purple-700 text-white flex justify-center py-2 font-bold">
          Memos received
        </h1>
      )}

      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              className="py-3 my-2 flex justify-center space-x-4 bg-purple-300"
              key={idx}
            >
              <p className="font-bold">"{memo.message}"</p>
              <p className="font-medium ">
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          );
        })}
    </div>
  );
}
