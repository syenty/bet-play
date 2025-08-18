"use client";

import { useState, useMemo, ChangeEvent } from "react";
import Link from "next/link";

const MAX_PLAYERS = 100;
const MIN_PLAYERS = 2;

export default function LadderGamePage() {
  const [numPlayers, setNumPlayers] = useState<number>(4);
  const [players, setPlayers] = useState<string[]>(Array(4).fill(""));
  const [outcomes, setOutcomes] = useState<string[]>(Array(4).fill(""));
  const [isGameReady, setIsGameReady] = useState(false);
  const [rungs, setRungs] = useState<boolean[][]>([]);
  const [results, setResults] = useState<number[] | null>(null);
  const [paths, setPaths] = useState<string[] | null>(null);

  const handlePlayerCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    let count = parseInt(e.target.value, 10);
    if (isNaN(count) || count < MIN_PLAYERS) {
      count = MIN_PLAYERS;
    }
    if (count > MAX_PLAYERS) {
      count = MAX_PLAYERS;
    }
    setNumPlayers(count);
    setPlayers(Array(count).fill(""));
    setOutcomes(Array(count).fill(""));
    resetGame();
  };

  const handleNameChange = (index: number, type: "player" | "outcome", value: string) => {
    if (type === "player") {
      const newPlayers = [...players];
      newPlayers[index] = value;
      setPlayers(newPlayers);
    } else {
      const newOutcomes = [...outcomes];
      newOutcomes[index] = value;
      setOutcomes(newOutcomes);
    }
  };

  const handleOutcomeClick = (index: number) => {
    if (outcomes[index] === "") {
      handleNameChange(index, "outcome", "당첨");
    }
  };

  const generateLadder = () => {
    if (players.some((p) => p === "") || outcomes.some((o) => o === "")) {
      alert("모든 참가자와 결과의 이름을 입력해주세요.");
      return;
    }

    const ladderHeight = 15;
    const newRungs: boolean[][] = Array(ladderHeight)
      .fill(null)
      .map(() => Array(numPlayers - 1).fill(false));

    for (let i = 0; i < ladderHeight; i++) {
      for (let j = 0; j < numPlayers - 1; j++) {
        // 25% 확률로 가로선 추가, 단, 바로 왼쪽에 가로선이 없을 경우에만
        if (Math.random() < 0.25 && (j === 0 || !newRungs[i][j - 1])) {
          newRungs[i][j] = true;
        }
      }
    }
    setRungs(newRungs);
    setIsGameReady(true);
    setResults(null);
    setPaths(null);
  };

  const calculateResults = () => {
    const playerOutcomes: number[] = [];
    const pathData: string[] = [];
    const colWidth = 100;
    const stepHeight = 30;
    const padding = 40;

    for (let i = 0; i < numPlayers; i++) {
      let currentPosition = i;
      let path = `M ${i * colWidth + colWidth / 2},${padding}`;

      for (let j = 0; j < rungs.length; j++) {
        path += ` L ${currentPosition * colWidth + colWidth / 2},${
          padding + (j + 0.5) * stepHeight
        }`;
        if (currentPosition < numPlayers - 1 && rungs[j][currentPosition]) {
          currentPosition++;
          path += ` L ${currentPosition * colWidth + colWidth / 2},${
            padding + (j + 0.5) * stepHeight
          }`;
        } else if (currentPosition > 0 && rungs[j][currentPosition - 1]) {
          currentPosition--;
          path += ` L ${currentPosition * colWidth + colWidth / 2},${
            padding + (j + 0.5) * stepHeight
          }`;
        }
        path += ` L ${currentPosition * colWidth + colWidth / 2},${padding + (j + 1) * stepHeight}`;
      }
      playerOutcomes[i] = currentPosition;
      pathData[i] = path;
    }
    setResults(playerOutcomes);
    setPaths(pathData);
  };

  const resetGame = () => {
    setIsGameReady(false);
    setResults(null);
    setPaths(null);
  };

  const ladderSVG = useMemo(() => {
    if (!isGameReady) return null;

    const ladderHeight = rungs.length;
    const width = numPlayers * 100;
    const height = ladderHeight * 30 + 80;
    const colWidth = 100;
    const stepHeight = 30;
    const padding = 40;

    return (
      <svg width={width} height={height} className="bg-gray-800 rounded-lg">
        {/* Vertical Lines */}
        {Array(numPlayers)
          .fill(0)
          .map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * colWidth + colWidth / 2}
              y1={padding}
              x2={i * colWidth + colWidth / 2}
              y2={height - padding}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        {/* Rungs */}
        {rungs.map((row, i) =>
          row.map(
            (hasRung, j) =>
              hasRung && (
                <line
                  key={`h-${i}-${j}`}
                  x1={j * colWidth + colWidth / 2}
                  y1={padding + (i + 0.5) * stepHeight}
                  x2={(j + 1) * colWidth + colWidth / 2}
                  y2={padding + (i + 0.5) * stepHeight}
                  stroke="white"
                  strokeWidth="2"
                />
              )
          )
        )}
        {/* Paths */}
        {paths &&
          paths.map((path, i) => (
            <path
              key={`p-${i}`}
              d={path}
              fill="none"
              stroke={["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6", "#ec4899"][i % 6]}
              strokeWidth="4"
              strokeDasharray="10,5"
              className="animate-path-draw"
            />
          ))}
      </svg>
    );
  }, [isGameReady, rungs, numPlayers, paths]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-white">
      <h1 className="mb-8 text-5xl font-bold">사다리 게임</h1>

      {!isGameReady ? (
        <div className="w-full max-w-4xl">
          <div className="mb-6">
            <label htmlFor="numPlayers" className="block mb-2 font-bold">
              참가 인원 (2~100명):
            </label>
            <input
              type="number"
              id="numPlayers"
              value={numPlayers}
              onChange={handlePlayerCountChange}
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">참가자</h3>
              {players.map((_, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`참가자 ${i + 1}`}
                  value={players[i]}
                  onChange={(e) => handleNameChange(i, "player", e.target.value)}
                  className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
                />
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">결과</h3>
              {outcomes.map((_, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`결과 ${i + 1}`}
                  value={outcomes[i]}
                  onChange={(e) => handleNameChange(i, "outcome", e.target.value)}
                  onClick={() => handleOutcomeClick(i)}
                  className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
                />
              ))}
            </div>
          </div>
          <button
            onClick={generateLadder}
            className="w-full rounded-lg bg-blue-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-blue-600"
          >
            사다리 생성하기
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div
            className="flex w-full justify-around max-w-[calc(100px*10)] mb-2"
            style={{ width: `${numPlayers * 100}px` }}
          >
            {players.map((player, i) => (
              <div key={i} className="w-[100px] text-center font-semibold truncate" title={player}>
                {player}
              </div>
            ))}
          </div>

          {ladderSVG}

          <div
            className="flex w-full justify-around max-w-[calc(100px*10)] mt-2"
            style={{ width: `${numPlayers * 100}px` }}
          >
            {outcomes.map((outcome, i) => (
              <div key={i} className="w-[100px] text-center font-semibold truncate" title={outcome}>
                {results ? outcomes[results.indexOf(i)] : "???"}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={calculateResults}
              disabled={!!results}
              className="rounded-lg bg-green-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              결과 보기
            </button>
            <button
              onClick={resetGame}
              className="rounded-lg bg-yellow-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-yellow-600"
            >
              다시하기
            </button>
          </div>
        </div>
      )}

      <div className="mt-12">
        <Link href="/">
          <button className="rounded-lg bg-gray-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-gray-600">
            메인으로 돌아가기
          </button>
        </Link>
      </div>

      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-path-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s linear forwards;
        }
      `}</style>
    </main>
  );
}
