/* eslint-disable no-plusplus */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useNavigate } from 'react-router-dom';

import { sparcle } from '../utils';
import { GetParams } from '../utils/Onboard';
import { ABI, ADDRESS } from '../contract';
import { AddNewEvent } from './EventListener';

const emptyAccount = '0x0000000000000000000000000000000000000000';

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');

  const [battleGround, setBattleGround] = useState('bg-astral');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [gameData, setGameData] = useState({ players: [], pendingBattles: [], activeBattle: null });
  const [playerCreated, setPlayerCreated] = useState(false);
  const [showAlert, setShowAlert] = useState({ status: false, type: 'info', message: '' });
  const [battleName, setBattleName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updateGameData, setUpdateGameData] = useState(0);
  const [waitBattle, setWaitBattle] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [playerOneCurrentHealth, setPlayerOneCurrentHealth] = useState(0);
  const [playerTwoCurrentHealth, setPlayerTwoCurrentHealth] = useState(0);

  // set battleground to localstorgae
  useEffect(() => {
    const isBattleground = localStorage.getItem('battleground');

    if (isBattleground) setBattleGround(isBattleground);
    else localStorage.setItem('battleground', battleGround);
  }, []);

  async function resetParams() {
    const currentStep = await GetParams();
    setStep(currentStep.step);
  }

  useEffect(() => {
    resetParams();
    window?.ethereum?.on('chainChanged', () => {
      resetParams();
    });
    window?.ethereum?.on('accountsChanged', () => {
      resetParams();
    });
  }, []);

  const player1Ref = useRef();
  const player2Ref = useRef();

  const navigate = useNavigate();

  // get battle card coords
  const getCoords = (cardRef) => {
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();

    const el = {
      pageX: left + width / 2,
      pageY: top + height / 2.25,
    };

    return el;
  };

  const updateCurrentWalletAddress = async () => {
    const accounts = await window?.ethereum?.request({ method: 'eth_requestAccounts' });

    if (accounts) setWalletAddress(accounts[0]);
  };

  //* Set the wallet address to the state
  useEffect(() => {
    updateCurrentWalletAddress();

    window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress);
  }, []);

  //* Set the smart contract and provider to the state
  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);
      const signer = newProvider.getSigner();
      const newContract = new ethers.Contract(ADDRESS, ABI, signer);

      setProvider(newProvider);
      setContract(newContract);
    };

    setSmartContractAndProvider();
  }, []);

  function createListeners() {
    // New Player event listener
    const NewPlayerEventFilter = contract.filters.NewPlayer();
    AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
      console.log('NewPlayerEvent', args);

      if (walletAddress === args.owner) {
        setShowAlert({
          status: true,
          type: 'success',
          message: 'Player has been successfully registered',
        });

        setPlayerCreated(true);
      }
    });

    // New Battle event listener
    const NewBattleEventFilter = contract.filters.NewBattle();
    AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
      console.log('NewBattleEvent', args);
      if (walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase()) {
        navigate(`/battle/${args.battleName}`);
      }

      setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
    });

    // New Game Token event listener
    const NewGameTokenEvent = contract.filters.NewGameToken();
    AddNewEvent(NewGameTokenEvent, provider, ({ args }) => {
      console.log('NewGameTokenEvent', args.owner, walletAddress);

      if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
        setShowAlert({
          status: true,
          type: 'success',
          message: 'Player game token has been successfully generated',
        });

        navigate('/create-battle');
      }
    });

    // Battle Move event listener
    const BattleMoveEvent = contract.filters.BattleMove();
    AddNewEvent(BattleMoveEvent, provider, ({ args }) => {
      console.log('Battle move event', args);
    });

    // Round ended event listener
    const RoundEndedEvent = contract.filters.RoundEnded();
    AddNewEvent(RoundEndedEvent, provider, ({ args }) => {
      console.log('RoundEndedEvent', args, { walletAddress });

      for (let i = 0; i < args.damagedPlayers.length; i++) {
        if (args.damagedPlayers[i] !== emptyAccount) {
          if (args.damagedPlayers[i] === walletAddress) sparcle(getCoords(player1Ref));
          else sparcle(getCoords(player2Ref));
        }
      }

      setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
    });

    // Battle Ended event listener
    const BattleEndedEvent = contract.filters.BattleEnded();
    AddNewEvent(BattleEndedEvent, provider, ({ args }) => {
      if (walletAddress.toLowerCase() === args.winner.toLowerCase()) {
        setShowAlert({ status: true, type: 'success', message: 'You won!' });
      } else {
        setShowAlert({ status: true, type: 'failure', message: 'You lost!' });
      }

      setTimeout(() => {
        navigate('/create-battle');
      }, 5000);
    });
  }

  //* Activate event listeners for the smart contract
  useEffect(() => {
    if (step === -1 && contract) createListeners();
  }, [step]);

  //* Set the game data to the state
  useEffect(() => {
    const fetchGameData = async () => {
      if (contract) {
        const fetchedBattles = await contract.getAllBattles();
        const pendingBattles = fetchedBattles.filter((battle) => battle.battleStatus === 0);
        let activeBattle = null;

        fetchedBattles.forEach((battle) => {
          if (battle.players.find((player) => player.toLowerCase() === walletAddress.toLowerCase())) {
            if (battle.winner.startsWith('0x00')) {
              activeBattle = battle;
            }
          }
        });

        setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle });
      }
    };

    fetchGameData();
  }, [contract, updateGameData]);

  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: 'info', message: '' });
      }, [5000]);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason?.slice('execution reverted: '.length).slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: 'failure',
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

  return (
    <GlobalContext.Provider
      value={{
        getCoords,
        player1Ref,
        player2Ref,
        battleGround,
        setBattleGround,
        contract,
        gameData,
        walletAddress,
        updateCurrentWalletAddress,
        playerCreated,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        errorMessage,
        setErrorMessage,
        setPlayerCreated,
        waitBattle,
        setWaitBattle,
        isWaitingForOpponent,
        setIsWaitingForOpponent,
        playerOneCurrentHealth,
        setPlayerOneCurrentHealth,
        playerTwoCurrentHealth,
        setPlayerTwoCurrentHealth,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
