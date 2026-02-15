import { useEffect, useMemo, useRef, useState } from "react";
import { letters, moments } from "./data/letters";

const STORAGE_KEY = "open-when-opened-letters";
const CONFETTI_COLORS = ["#f28cae", "#f7b267", "#6bbfd8", "#8fd694", "#9d8df1", "#f3e88b"];
const NIGHT_THEME = {
  base: "#0d1422",
  card: "rgba(35, 44, 71, 0.54)",
  border: "rgba(131, 146, 187, 0.48)",
  accent: "#88aef6",
  accentDeep: "#c0d3ff",
  statusBg: "rgba(104, 127, 179, 0.45)",
  overlayStart: "rgba(25, 34, 58, 0.36)",
  overlayEnd: "rgba(14, 20, 33, 0.66)"
};
const DAILY_THEMES = [
  {
    base: "#f5e9ef",
    card: "rgba(255, 244, 248, 0.48)",
    border: "rgba(227, 176, 195, 0.6)",
    accent: "#cb6b8f",
    accentDeep: "#934767",
    statusBg: "rgba(255, 213, 228, 0.72)",
    overlayStart: "rgba(255, 227, 237, 0.22)",
    overlayEnd: "rgba(255, 246, 250, 0.12)"
  },
  {
    base: "#efeaf9",
    card: "rgba(245, 241, 255, 0.46)",
    border: "rgba(194, 181, 233, 0.62)",
    accent: "#8563c9",
    accentDeep: "#5f4597",
    statusBg: "rgba(224, 214, 252, 0.72)",
    overlayStart: "rgba(226, 216, 255, 0.22)",
    overlayEnd: "rgba(247, 244, 255, 0.1)"
  },
  {
    base: "#e9f6f3",
    card: "rgba(239, 252, 248, 0.46)",
    border: "rgba(164, 214, 200, 0.66)",
    accent: "#3c9b89",
    accentDeep: "#2c6c62",
    statusBg: "rgba(204, 240, 229, 0.74)",
    overlayStart: "rgba(207, 243, 232, 0.2)",
    overlayEnd: "rgba(241, 253, 249, 0.1)"
  },
  {
    base: "#f9efe6",
    card: "rgba(255, 247, 236, 0.5)",
    border: "rgba(230, 198, 163, 0.66)",
    accent: "#bf7d46",
    accentDeep: "#8f5830",
    statusBg: "rgba(246, 223, 197, 0.74)",
    overlayStart: "rgba(255, 227, 192, 0.2)",
    overlayEnd: "rgba(255, 250, 242, 0.1)"
  },
  {
    base: "#e8effa",
    card: "rgba(239, 245, 255, 0.48)",
    border: "rgba(174, 194, 230, 0.64)",
    accent: "#4b78bf",
    accentDeep: "#34538a",
    statusBg: "rgba(213, 228, 252, 0.74)",
    overlayStart: "rgba(206, 221, 248, 0.2)",
    overlayEnd: "rgba(246, 250, 255, 0.11)"
  }
];

function loadOpenedLetters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOpenedLetters(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function createConfettiPieces() {
  return Array.from({ length: 36 }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.26}s`,
    duration: `${1.7 + Math.random() * 1.1}s`,
    drift: `${-110 + Math.random() * 220}px`,
    rotate: `${Math.random() * 620 - 310}deg`,
    size: `${7 + Math.random() * 9}px`,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length]
  }));
}

function shufflePhotosWithTilt(photos) {
  const shuffled = [...photos];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.map((photo) => ({
    ...photo,
    tilt: `${(Math.random() * 12 - 6).toFixed(2)}deg`
  }));
}

function playCelebrationChime() {
  try {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;

    const context = new AudioContextConstructor();
    const notes = [523.25, 659.25, 783.99];
    const start = context.currentTime;

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const noteStart = start + index * 0.12;

      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.0001, noteStart);
      gainNode.gain.exponentialRampToValueAtTime(0.18, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.24);
    });

    window.setTimeout(() => {
      context.close();
    }, 900);
  } catch {
    // no-op
  }
}

function createStars() {
  return Array.from({ length: 44 }, (_, index) => ({
    id: `star-${index}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${1 + Math.random() * 2.4}px`,
    delay: `${Math.random() * 3.8}s`,
    duration: `${2.2 + Math.random() * 3.2}s`,
    layer: index % 2 === 0 ? "near" : "far"
  }));
}

function createHeartBurstPieces() {
  const hearts = ["❤", "💗", "💖", "💞"];
  return Array.from({ length: 22 }, (_, index) => ({
    id: `${Date.now()}-heart-${index}`,
    icon: hearts[index % hearts.length],
    left: `${40 + Math.random() * 20}%`,
    delay: `${Math.random() * 0.22}s`,
    duration: `${1.8 + Math.random() * 1.1}s`,
    drift: `${-110 + Math.random() * 220}px`,
    size: `${13 + Math.random() * 13}px`,
    rotate: `${Math.random() * 50 - 25}deg`
  }));
}

export default function App() {
  const backgroundPhotos = ["/photos/us-1.jpg", "/photos/us-2.jpg", "/photos/us-3.jpg", "/photos/us-4.jpg"];
  const [openedIds, setOpenedIds] = useState([]);
  const [activeLetterId, setActiveLetterId] = useState(null);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [heartBurstPieces, setHeartBurstPieces] = useState([]);
  const [displayPhotos, setDisplayPhotos] = useState([]);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const confettiTimeoutRef = useRef(null);
  const heartBurstTimeoutRef = useRef(null);
  const keyBufferRef = useRef("");
  const stars = useMemo(() => createStars(), []);

  const theme = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayOfYear = Math.floor((now - startOfYear) / msPerDay);
    return DAILY_THEMES[dayOfYear % DAILY_THEMES.length];
  }, []);
  const letterOfWeekId = useMemo(() => {
    if (letters.length === 0) return null;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekOfYear = Math.floor((daysSinceStart + startOfYear.getDay()) / 7);
    return letters[weekOfYear % letters.length].id;
  }, []);
  const atlantaFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
        timeZoneName: "short"
      }),
    []
  );
  const sanFranciscoFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "America/Los_Angeles",
        timeZoneName: "short"
      }),
    []
  );
  const isNightMode = useMemo(() => {
    const hour = currentTime.getHours();
    return hour >= 21 || hour < 6;
  }, [currentTime]);
  const shellTheme = isNightMode ? NIGHT_THEME : theme;

  useEffect(() => {
    setOpenedIds(loadOpenedLetters());
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const activeLetter = useMemo(
    () => letters.find((letter) => letter.id === activeLetterId) || null,
    [activeLetterId]
  );

  useEffect(() => {
    if (!activeLetter?.photos?.length) {
      setDisplayPhotos([]);
      return;
    }

    setDisplayPhotos(shufflePhotosWithTilt(activeLetter.photos));
  }, [activeLetter]);

  useEffect(
    () => () => {
      if (confettiTimeoutRef.current) {
        window.clearTimeout(confettiTimeoutRef.current);
      }
      if (heartBurstTimeoutRef.current) {
        window.clearTimeout(heartBurstTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;

      const targetTag = event.target?.tagName;
      if (targetTag === "INPUT" || targetTag === "TEXTAREA") return;

      keyBufferRef.current = `${keyBufferRef.current}${event.key.toLowerCase()}`.slice(-12);
      if (keyBufferRef.current.endsWith("hug")) {
        setHeartBurstPieces(createHeartBurstPieces());
        if (heartBurstTimeoutRef.current) {
          window.clearTimeout(heartBurstTimeoutRef.current);
        }
        heartBurstTimeoutRef.current = window.setTimeout(() => {
          setHeartBurstPieces([]);
        }, 2200);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const triggerCelebration = () => {
    setConfettiPieces(createConfettiPieces());
    playCelebrationChime();

    if (confettiTimeoutRef.current) {
      window.clearTimeout(confettiTimeoutRef.current);
    }

    confettiTimeoutRef.current = window.setTimeout(() => {
      setConfettiPieces([]);
    }, 2400);
  };

  const openLetter = (letterId) => {
    if (letterId !== letterOfWeekId) return;

    const isFirstOpen = !openedIds.includes(letterId);
    setActiveLetterId(letterId);

    if (isFirstOpen) {
      triggerCelebration();
    }

    setOpenedIds((prev) => {
      if (prev.includes(letterId)) return prev;
      const next = [...prev, letterId];
      saveOpenedLetters(next);
      return next;
    });
  };

  const closeModal = () => {
    setActiveLetterId(null);
  };
  const resetOpenedLetters = () => {
    setOpenedIds([]);
    saveOpenedLetters([]);
  };

  const reshufflePolaroids = () => {
    if (!activeLetter?.photos?.length) return;
    setDisplayPhotos(shufflePhotosWithTilt(activeLetter.photos));
  };

  return (
    <div
      className={`app-shell ${isNightMode ? "is-night" : ""}`}
      style={{
        "--bg-base": shellTheme.base,
        "--card": shellTheme.card,
        "--card-border": shellTheme.border,
        "--accent": shellTheme.accent,
        "--accent-deep": shellTheme.accentDeep,
        "--status-bg": shellTheme.statusBg,
        "--overlay-start": shellTheme.overlayStart,
        "--overlay-end": shellTheme.overlayEnd
      }}
    >
      <div className="bg-slideshow" aria-hidden="true">
        {backgroundPhotos.map((photo, index) => (
          <div
            key={photo}
            className="bg-slide"
            style={{ backgroundImage: `url(${photo})`, animationDelay: `${index * 10}s` }}
          />
        ))}
      </div>
      <div className={`night-sky ${isNightMode ? "is-visible" : ""}`} aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star.id}
            className={`night-star is-${star.layer}`}
            style={{
              "--left": star.left,
              "--top": star.top,
              "--size": star.size,
              "--delay": star.delay,
              "--duration": star.duration
            }}
          />
        ))}
      </div>
      <div className="bg-overlay" aria-hidden="true" />

      <main className="page">
        <section className="hero">
          <p className="hero-kicker">For You</p>
          <h1>Jar Of Notes</h1>
          <p className="hero-subtitle">Basically, the notes thingy but digitized</p>
          <div className="time-panel" aria-label="Current time in Atlanta and San Francisco">
            <div className="time-card">
              <p className="time-city">Atlanta</p>
              <p className="time-value">{atlantaFormatter.format(currentTime)}</p>
            </div>
            <div className="time-card">
              <p className="time-city">San Francisco</p>
              <p className="time-value">{sanFranciscoFormatter.format(currentTime)}</p>
            </div>
          </div>
          {letterOfWeekId && (
            <p className="hero-day-note">
              Letter of the week: {letters.find((letter) => letter.id === letterOfWeekId)?.title}
            </p>
          )}
          <div className="hero-actions">
            <button
              className="reset-button"
              type="button"
              onClick={resetOpenedLetters}
              disabled={openedIds.length === 0}
            >
              Reset All to Unopened
            </button>
          </div>
        </section>

        <section className="letter-grid" aria-label="Open when letters">
          {letters.map((letter) => {
            const isOpened = openedIds.includes(letter.id);
            const isLetterOfTheWeek = letter.id === letterOfWeekId;
            return (
              <button
                key={letter.id}
                className={`letter-card ${isOpened ? "is-opened" : ""} ${isLetterOfTheWeek ? "is-today" : "is-locked"}`}
                onClick={() => openLetter(letter.id)}
                type="button"
                disabled={!isLetterOfTheWeek}
                aria-disabled={!isLetterOfTheWeek}
              >
                <span className="wax-seal" aria-hidden="true">❤</span>
                <h2>{letter.title}</h2>
                <p>{isLetterOfTheWeek ? letter.preview : "Locked until another week."}</p>
                <span className="letter-status">
                  {isLetterOfTheWeek ? (isOpened ? "Opened" : "This Week") : "Locked"}
                </span>
              </button>
            );
          })}
        </section>

        <section className="moments-section" aria-label="Our moments timeline">
          <p className="moments-kicker">Our Moments</p>
          <h2>Little timeline of us</h2>
          <div className="moments-list">
            {moments.map((moment) => (
              <article className="moment-item" key={moment.date + moment.title}>
                <p className="moment-date">{moment.date}</p>
                <h3>{moment.title}</h3>
                <p>{moment.note}</p>
              </article>
            ))}
          </div>
        </section>

        {activeLetter && (
          <div className="modal-backdrop" role="presentation" onClick={closeModal}>
            <article
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="letter-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button className="modal-close" onClick={closeModal} type="button" aria-label="Close letter">
                ×
              </button>

              <div className="modal-content">
                <p className="modal-kicker">Open note</p>
                <h3 id="letter-title">{activeLetter.title}</h3>

                <p className="modal-note">{activeLetter.note}</p>

                {displayPhotos.length > 0 && (
                  <section className="photo-strip" aria-label="Letter photos">
                    <div className="photo-strip-head">
                      <p>Polaroid Shuffle Mode</p>
                      <button className="shuffle-button" type="button" onClick={reshufflePolaroids}>
                        Shuffle Photos
                      </button>
                    </div>

                    {displayPhotos.map((photo, index) => (
                      <figure
                        key={`${photo.src}-${photo.tilt}-${index}`}
                        className="polaroid"
                        style={{ "--tilt": photo.tilt }}
                      >
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                      </figure>
                    ))}
                  </section>
                )}

                {activeLetter.promise && (
                  <p className="promise">
                    <strong>Promise:</strong> {activeLetter.promise}
                  </p>
                )}
              </div>
            </article>
          </div>
        )}
      </main>

      <div className={`confetti-layer ${confettiPieces.length > 0 ? "is-active" : ""}`} aria-hidden="true">
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              "--left": piece.left,
              "--delay": piece.delay,
              "--duration": piece.duration,
              "--drift": piece.drift,
              "--spin": piece.rotate,
              "--size": piece.size,
              "--piece-color": piece.color
            }}
          />
        ))}
      </div>
      <div className={`heart-burst-layer ${heartBurstPieces.length > 0 ? "is-active" : ""}`} aria-hidden="true">
        {heartBurstPieces.map((piece) => (
          <span
            key={piece.id}
            className="heart-burst-piece"
            style={{
              "--left": piece.left,
              "--delay": piece.delay,
              "--duration": piece.duration,
              "--drift": piece.drift,
              "--size": piece.size,
              "--rotate": piece.rotate
            }}
          >
            {piece.icon}
          </span>
        ))}
      </div>
    </div>
  );
}
