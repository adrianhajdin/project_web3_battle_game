import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { alertIcon } from '../assets';
import CustomButton from './CustomButton';
import { useGlobalContext } from '../context';

const gameRules = [
  'Card with the same defense and attack point will cancel out each other.',
  "Attack points from the attacking card will deduct the opposing hero's(player) health points.",
  'If P1 did not defend(), P1 playerHealth -= P2’s Card attackStrength',
  'If P1 defends, attackDamage = P2’s card attackStrength - P1’s card defenseStrength',
  'If defends, player gains 3 Mana',
  'If attacks, player spends 3 Mana',
];

const GameInfo = () => {
  const navigate = useNavigate();
  const [toggleSidebar, setToggleSidebar] = useState(false);

  const { contract, gameData, setErrorMessage, setShowAlert } = useGlobalContext();

  const handleBattleExit = async () => {
    const battleName = gameData.activeBattle.name;

    try {
      await contract.quitBattle(battleName);

      setShowAlert({ status: true, type: 'success', message: `You're quitting the ${battleName}` });
    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }
  };

  return (
    <>
      <div className={styles.gameInfoIconBox}>
        <div
          className={`${styles.gameInfoIcon} ${styles.flexCenter}`}
          onClick={() => setToggleSidebar(true)}
        >
          <img
            src={alertIcon}
            alt="info"
            className={styles.gameInfoIconImg}
          />
        </div>
      </div>

      <div className={`${styles.gameInfoSidebar} ${toggleSidebar ? 'translate-x-0' : 'translate-x-full'} ${styles.glassEffect} ${styles.flexBetween} backdrop-blur-3xl`}>
        <div className="flex flex-col">
          <div className={styles.gameInfoSidebarCloseBox}>
            <div
              className={`${styles.flexCenter} ${styles.gameInfoSidebarClose}`}
              onClick={() => setToggleSidebar(false)}
            >X
            </div>
          </div>

          <h3 className={styles.gameInfoHeading}>Game Rules:</h3>

          <div className="mt-3">
            {gameRules.map((rule, index) => (
              <p key={`game-rule-${index}`} className={styles.gameInfoText}><span className="font-bold">{index + 1}</span>. {rule}</p>
            ))}
          </div>
        </div>

        <div className={`${styles.flexBetween} mt-10 gap-4 w-full`}>
          <CustomButton title="Change Battleground" handleClick={() => navigate('/battleground')} />
          <CustomButton title="Exit Battle" handleClick={() => handleBattleExit()} />
        </div>
      </div>
    </>
  );
};

export default GameInfo;
