import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { Alert } from '../components';
import { battlegrounds } from '../assets';
import { useGlobalContext } from '../context';

const Battleground = () => {
  const navigate = useNavigate();
  const { setBattleGround, setShowAlert, showAlert } = useGlobalContext();

  const handleBattleChoice = (ground) => {
    setBattleGround(ground.id);

    localStorage.setItem('battleground', ground.id);

    setShowAlert({ status: true, type: 'info', message: `${ground.name} is battle ready!` });

    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  return (
    <div className={`${styles.flexCenter} ${styles.battlegroundContainer}`}>
      {showAlert.status && <Alert type={showAlert.type} message={showAlert.message} />}

      <h1 className={`${styles.headText} text-center`}>
        Choose your
        <span className="text-siteViolet"> Battle </span>
        Ground
      </h1>

      <div className={`${styles.flexCenter} ${styles.battleGroundsWrapper}`}>
        {battlegrounds.map((ground) => (
          <div
            key={ground.id}
            className={`${styles.flexCenter} ${styles.battleGroundCard}`}
            onClick={() => handleBattleChoice(ground)}
          >
            <img src={ground.image} alt="saiman" className={styles.battleGroundCardImg} />

            <div className="info absolute">
              <p className={styles.battleGroundCardText}>{ground.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Battleground;
