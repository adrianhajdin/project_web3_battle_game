import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { CustomButton, PageHOC } from '../components';
import styles from '../styles';

const JoinBattle = () => {
  const navigate = useNavigate();
  const { contract, gameData, setShowAlert, setBattleName, setErrorMessage, walletAddress } = useGlobalContext();

  useEffect(() => {
    if (gameData?.activeBattle?.battleStatus === 1) navigate(`/battle/${gameData.activeBattle.name}`);
  }, [gameData]);

  const handleClick = async (battleName) => {
    setBattleName(battleName);

    try {
      await contract.joinBattle(battleName);

      setShowAlert({ status: true, type: 'success', message: `Joining ${battleName}` });
    } catch (error) {
      setErrorMessage(error);
    }
  };

  return (
    <>
      <h2 className={styles.joinHeadText}>Available Battles:</h2>

      <div className={styles.joinContainer}>
        {gameData.pendingBattles.length
          ? gameData.pendingBattles
            .filter((battle) => !battle.players.includes(walletAddress) && battle.battleStatus !== 1)
            .map((battle, index) => (
              <div key={battle.name + index} className={styles.flexBetween}>
                <p className={styles.joinBattleTitle}>{index + 1}. {battle.name}</p>
                <CustomButton
                  title="Join"
                  handleClick={() => handleClick(battle.name)}
                />
              </div>
            )) : (
              <p className={styles.joinLoading}>Reload the page to see new battles</p>
          )}
      </div>

      <p className={styles.infoText} onClick={() => navigate('/create-battle')}>
        Or create a new battle
      </p>
    </>
  );
};

export default PageHOC(
  JoinBattle,
  <>Join <br /> a Battle</>,
  <>Join already existing battles</>,
);
