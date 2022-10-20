import React from 'react';

import styles from '../styles';

const ActionButton = ({ imgUrl, handleClick, restStyles }) => (
  <div
    className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${restStyles} `}
    onClick={handleClick}
  >
    <img src={imgUrl} alt="action_img" className={styles.gameMoveIcon} />
  </div>
);

export default ActionButton;
