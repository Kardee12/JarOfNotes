import { useEffect, useMemo, useState } from "react";

const GRID_SIZE = 12;
const INITIAL_SNAKE = [
  { x: 5, y: 6 },
  { x: 4, y: 6 },
  { x: 3, y: 6 }
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const BEST_SCORE_KEY = "heart-snake-best-score";

function randomFood(snake) {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };

    const blocked = snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y);
    if (!blocked) return candidate;
  }
}

function isOppositeDirection(current, next) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

export default function HeartSnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 8, y: 6 });
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const savedBest = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
    if (savedBest > 0) {
      setBestScore(savedBest);
    }
  }, []);

  const updateDirection = (nextDirection) => {
    setDirection((prev) => (isOppositeDirection(prev, nextDirection) ? prev : nextDirection));
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(randomFood(INITIAL_SNAKE));
    setScore(0);
    setIsGameOver(false);
    setIsRunning(false);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const nextByKey = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }
      };
      const nextDirection = nextByKey[event.key];
      if (!nextDirection) return;

      event.preventDefault();
      if (isGameOver) return;
      setIsRunning(true);
      updateDirection(nextDirection);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isGameOver]);

  useEffect(() => {
    if (!isRunning || isGameOver) return;

    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];
        const nextHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        };

        const hitWall =
          nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;
        if (hitWall) {
          setIsRunning(false);
          setIsGameOver(true);
          return currentSnake;
        }

        const hitSelf = currentSnake.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);
        if (hitSelf) {
          setIsRunning(false);
          setIsGameOver(true);
          return currentSnake;
        }

        const ateFood = nextHead.x === food.x && nextHead.y === food.y;
        const nextSnake = [nextHead, ...currentSnake];

        if (!ateFood) {
          nextSnake.pop();
        } else {
          setScore((prev) => {
            const next = prev + 1;
            if (next > bestScore) {
              setBestScore(next);
              localStorage.setItem(BEST_SCORE_KEY, String(next));
            }
            return next;
          });
          setFood(randomFood(nextSnake));
        }

        return nextSnake;
      });
    }, 150);

    return () => window.clearInterval(timer);
  }, [direction, food, isGameOver, isRunning, bestScore]);

  const cells = useMemo(() => {
    const snakeSet = new Set(snake.map((segment) => `${segment.x}-${segment.y}`));
    const headId = `${snake[0].x}-${snake[0].y}`;

    return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
      const x = index % GRID_SIZE;
      const y = Math.floor(index / GRID_SIZE);
      const id = `${x}-${y}`;

      const isFood = x === food.x && y === food.y;
      const isHead = id === headId;
      const isSnake = snakeSet.has(id);

      return { id, isFood, isHead, isSnake };
    });
  }, [food.x, food.y, snake]);

  return (
    <aside className="snake-card" aria-label="Heart Snake game">
      <div className="snake-header">
        <h2>Heart Snake</h2>
        <p>Use arrow keys. Eat hearts. Don&apos;t crash.</p>
      </div>

      <div className="snake-stats">
        <span>Score: {score}</span>
        <span>Best: {bestScore}</span>
      </div>

      <div className="snake-board" role="application" aria-label="Snake board">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className={`snake-cell ${cell.isSnake ? "is-snake" : ""} ${cell.isHead ? "is-head" : ""}`}
          >
            {cell.isFood ? "💗" : ""}
          </div>
        ))}
      </div>

      {isGameOver && <p className="snake-status">Game over. Tap restart.</p>}

      <div className="snake-controls">
        <button
          type="button"
          onClick={() => {
            if (isGameOver) return;
            setIsRunning((prev) => !prev);
          }}
          className="snake-button"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button type="button" onClick={resetGame} className="snake-button is-secondary">
          Restart
        </button>
      </div>

      <div className="snake-dpad" aria-label="Direction controls">
        <button type="button" className="snake-arrow" onClick={() => updateDirection({ x: 0, y: -1 })}>↑</button>
        <div className="snake-arrow-row">
          <button type="button" className="snake-arrow" onClick={() => updateDirection({ x: -1, y: 0 })}>←</button>
          <button type="button" className="snake-arrow" onClick={() => updateDirection({ x: 1, y: 0 })}>→</button>
        </div>
        <button type="button" className="snake-arrow" onClick={() => updateDirection({ x: 0, y: 1 })}>↓</button>
      </div>
    </aside>
  );
}
