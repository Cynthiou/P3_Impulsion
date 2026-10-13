import { useEffect, useState } from "react";

// Je convertis l'heure actuelle en secondes
const convertNowToSeconds = () => {
  return Math.floor(Date.now() / 1000);
};

const useRestTimer = () => {
  // L'heure actuelle et l'heure de fin du repos
  const [now, setNow] = useState(convertNowToSeconds());
  const [restEndsAt, setRestEndsAt] = useState(0);

  // L'horloge : chaque seconde, elle met à jour l'heure actuelle
  useEffect(() => {
    const updateClock = () => {
      setNow(convertNowToSeconds());
    };

    const interval = setInterval(updateClock, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Le temps restant : heure de fin moins maintenant, jamais négatif
  let secondsLeft = restEndsAt - now;

  if (secondsLeft < 0) {
    secondsLeft = 0;
  }

  // « Fait » : le repos finit dans « seconds » secondes
  const startRest = (seconds: number) => {
    const currentSeconds = convertNowToSeconds();

    setRestEndsAt(currentSeconds + seconds);
    setNow(currentSeconds);
  };

  // « +30 s » : je repousse la fin du repos de 30 secondes
  const addThirtySeconds = () => {
    if (secondsLeft > 0) {
      setRestEndsAt(restEndsAt + 30);
    }
  };

  // « Passer le repos » : plus de repos en cours
  const skipRest = () => {
    setRestEndsAt(0);
  };

  return { secondsLeft, startRest, addThirtySeconds, skipRest };
};

export default useRestTimer;
