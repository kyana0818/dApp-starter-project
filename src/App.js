import React, {useEffect, useState} from 'react';
import './App.css';
import { ethers } from 'ethers';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [messageValue, setMessageValue] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [jackpotValue, setJackpotValue] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const contractAddress = '0xA2077381D38ACAfe965dB6c693343d61F3825ecF';
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log(`Ethereum object doesn't exist!`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getJackpot = async () => {
      const {ethereum} = window;

      try {
          if (ethereum) {
              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer = provider.getSigner();
              const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
              const jackpot = await wavePortalContract.getJackpot();

              setJackpotValue(ethers.utils.formatEther(jackpot));
          } else {
            console.log(`Ethereum object doesn't exist!`);
          }
      } catch (error) {
          console.log(error);
      }
  };

  useEffect(() => {
      let wavePortalContract;
      const {ethereum} = window;

      const onJackpot = (from, jackpotV, result) => {
          console.log('Jackpot value:', jackpotV);
          console.log('Win:', result);
          setJackpotValue(ethers.utils.formatEther(jackpotV));
      }

      if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          

          wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
          wavePortalContract.on('Jackpot', onJackpot);
      }

      return () => {
        if (wavePortalContract) {
            wavePortalContract.on('Jackpot', onJackpot);
        }
      };

  }, []);

//   useEffect(() => {
//     let wavePortalContract;
//     const {ethereum} = window;

//     const onNewWave = (from, timestamp, message) => {
//       console.log('NewWave', from, timestamp, message);
//       setAllWaves(prevState => [
//         ...prevState,
//         {
//           address: from,
//           timestamp: new Date(timestamp * 1000),
//           message: message,
//         }
//       ]);

//     };

//     if (ethereum) {
//       const provider = new ethers.providers.Web3Provider(ethereum);
//       const signer = provider.getSigner();

//       wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
//       wavePortalContract.on('NewWave', onNewWave);
//     }

//     return () => {
//       if (wavePortalContract) {
//         wavePortalContract.off('NewWave', onNewWave);
//       }
//     };
//   }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have metamask!');
      } else {
        console.log('We have the ethereum object', ethereum);
      }
      const accounts = await ethereum.request({method: "eth_accounts"});
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', ethereum);
        setCurrentAccount(account);
        getAllWaves();
        getJackpot();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if(!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log('Connected:', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
        let contractBalance = await provider.getBalance(
          wavePortalContract.address
        );
        console.log('Contract balance:', ethers.utils.formatEther(contractBalance));
        const waveTxn = await wavePortalContract.wave(messageValue, {
          gasLimit: 300000
        });
        console.log('Mining...', waveTxn.hash);
        await waveTxn.wait();
        console.log('Mined --', waveTxn.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
        let contractBalance_post = await provider.getBalance(wavePortalContract.address);

        if (contractBalance_post < contractBalance) {
          console.log('User won ETH!');
        } else {
          console.log(`User didn't win ETH.`);
        }
        console.log(
          'Contract balance after wave:', ethers.utils.formatEther(contractBalance_post)
        )

        console.log('Signer:', signer);
      } else {
        console.log(`Ethereum object doesn't exist!`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const jackpot = async (e) => {
      try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const wavePortalContract = new ethers.Contract(
              contractAddress,
              contractABI,
              signer
            );
            const waveTxn = await wavePortalContract.playJackpot({
                value: ethers.utils.parseEther(betAmount),
                gasLimit: 300000
            })
            console.log('Mining...', waveTxn.hash);
            await waveTxn.wait();
            console.log('Mined --', waveTxn.hash);
          }
      } catch (error) {
          console.log(error);
      }
    window.aaa = e;
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hand-wave">👋</span>WELCOME!
        </div>
        <div className="bio">
          大量のETH獲得のチャンス！！
        </div>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="jackpotContainer">
            <div className="jackpotContent">
                <div className="jackpotHeader">
                    <p>JACKPOT</p>
                </div>
                <div className="jackpotBody">
                    <div className="jackpotDisplayArea">
                        <input className='jackpotDisplay' value={jackpotValue} disabled/>
                    </div>
                </div>
            </div>
        </div>
        {/* {currentAccount && (
          <button className="waveButton">
            Wallet Connected
          </button>
        )} */}
        
        {currentAccount && (
          <div className='betArea'>
            {/* <div className='betAmountContainer'>
              <input
                type='number'
                className='betAmount'
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
              />
            </div> */}
            
            <p className='betLaber'>BET:</p>
            <div className="jackpotDisplayArea betAmountContainer">
              <input type="number" className='jackpotDisplay betAmount' value={betAmount} onChange={e => setBetAmount(e.target.value)}/>
            </div>
            <div className='betSubmitArea'>
              <button onClick={jackpot} className='jackpotButton'>ジャックポット！！！</button>
            </div>
          </div>
        )}
        
        {/* {currentAccount && (
          <button className="waveButton" onClick={jackpot}>
            Wave to Me
          </button>
        )}
        {currentAccount && (

          <textarea
            name="messageArea"
            placeholder="メッセージはこちら"
            type="text"
            value={messageValue}
            onChange={e => setMessageValue(e.target.value)}
          />
        )}
        {currentAccount && (
          allWaves.slice(0).reverse().map((wave, index) => {
            return (
              <div key={index} style={{
                backgroundColor: "#f8f8f8",
                marginTop: '16px',
                padding: '8px'
              }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })
        )} */}
      </div>
    </div>
  )
};

export default App;
