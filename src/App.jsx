import { useEffect, useMemo, useRef, useState } from "react";
import { letters, moments } from "./data/letters";

const STORAGE_KEY = "open-when-opened-letters";
const CONFETTI_COLORS = ["#f28cae", "#f7b267", "#6bbfd8", "#8fd694", "#9d8df1", "#f3e88b"];
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

export default function App() {
  const backgroundPhotos = ["/photos/us-1.jpg", "/photos/us-2.jpg", "/photos/us-3.jpg", "/photos/us-4.jpg"];
  const [openedIds, setOpenedIds] = useState([]);
  const [activeLetterId, setActiveLetterId] = useState(null);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [displayPhotos, setDisplayPhotos] = useState([]);
  const confettiTimeoutRef = useRef(null);

  const theme = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayOfYear = Math.floor((now - startOfYear) / msPerDay);
    return DAILY_THEMES[dayOfYear % DAILY_THEMES.length];
  }, []);

  useEffect(() => {
    setOpenedIds(loadOpenedLetters());
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
    },
    []
  );

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

  const closeModal = () => setActiveLetterId(null);
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
      className="app-shell"
      style={{
        "--bg-base": theme.base,
        "--card": theme.card,
        "--card-border": theme.border,
        "--accent": theme.accent,
        "--accent-deep": theme.accentDeep,
        "--status-bg": theme.statusBg,
        "--overlay-start": theme.overlayStart,
        "--overlay-end": theme.overlayEnd
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
      <div className="bg-overlay" aria-hidden="true" />

      <main className="page">
        <section className="hero">
          <p className="hero-kicker">For You</p>
          <h1>Jar Of Notes</h1>
          <p className="hero-subtitle">Basically, the notes thingy but digitized</p>
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
            return (
              <button
                key={letter.id}
                className={`letter-card ${isOpened ? "is-opened" : ""}`}
                onClick={() => openLetter(letter.id)}
                type="button"
              >
                <span className="wax-seal" aria-hidden="true">❤</span>
                <h2>{letter.title}</h2>
                <p>{letter.preview}</p>
                <span className="letter-status">{isOpened ? "Opened" : "Unopened"}</span>
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
    </div>
  );
}
