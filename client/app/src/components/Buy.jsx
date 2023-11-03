import React, {useState, useEffect} from 'react'
import {ethers} from "ethers"

const Buy = () => {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const onNameChange = (event) => {
        setName(event.target.value);
      };
    
      const onMessageChange = (event) => {
        setMessage(event.target.value);
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
              name ? name : "anon",
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
  return (
    <div>
      
    </div>
  )
}

export default Buy



