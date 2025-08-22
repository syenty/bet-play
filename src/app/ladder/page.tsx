"use client";

import { useState, useMemo, ChangeEvent, useEffect } from "react";
import Link from "next/link";

const MAX_PLAYERS = 100;
const MIN_PLAYERS = 2;

export default function LadderGamePage() {
  const [numPlayers, setNumPlayers] = useState<number>(4);
  const [playerCountInput, setPlayerCountInput] = useState<string>("4");
  const [players, setPlayers] = useState<string[]>(Array(4).fill(""));
  const [setupStep, setSetupStep] = useState<"count" | "names">("count");
  const [outcomes, setOutcomes] = useState<string[]>(Array(4).fill(""));
  const [isGameReady, setIsGameReady] = useState(false);
  const [rungs, setRungs] = useState<boolean[][]>([]);
  const [results, setResults] = useState<number[] | null>(null);
  const [revealedPlayers, setRevealedPlayers] = useState<boolean[]>([]);
  const [paths, setPaths] = useState<string[] | null>(null);

  // 참가 인원(numPlayers) 상태가 변경될 때 입력 필드(playerCountInput) 값을 동기화합니다.
  useEffect(() => {
    setPlayerCountInput(String(numPlayers));
  }, [numPlayers]);

  // 사용자가 입력 필드에 타이핑할 때 호출됩니다.
  const handlePlayerCountInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayerCountInput(e.target.value);
  };

  const goToNameStep = () => {
    const count = parseInt(playerCountInput, 10);

    if (isNaN(count) || count < MIN_PLAYERS || count > MAX_PLAYERS) {
      alert(`참가 인원은 ${MIN_PLAYERS}명에서 ${MAX_PLAYERS}명 사이로 입력해주세요.`);
      setPlayerCountInput(String(numPlayers)); // 유효하지 않은 값이면 이전 값으로 되돌립니다.
      return;
    }

    // 유효한 값이면 상태를 업데이트하고 다음 단계로 넘어갑니다.
    if (count !== numPlayers) {
      setNumPlayers(count);
      setPlayers(Array(count).fill(""));
      setOutcomes(Array(count).fill(""));
    }
    setSetupStep("names");
  };

  const goToCountStep = () => {
    setSetupStep("count");
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
      handleNameChange(index, "outcome", "X");
    }
  };

  const generateLadder = () => {
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
    setRevealedPlayers(Array(numPlayers).fill(false));
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

  const handlePlayerResultClick = (index: number) => {
    if (!results) {
      calculateResults();
    }
    setRevealedPlayers((prev) => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });
  };

  const revealAllResults = () => {
    if (!results) {
      calculateResults();
    }
    setRevealedPlayers(Array(numPlayers).fill(true));
  };

  const resetGame = () => {
    setIsGameReady(false);
    setResults(null);
    setPaths(null);
    setSetupStep("count");
    setRevealedPlayers([]);
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
          paths.map(
            (path, i) =>
              revealedPlayers[i] && (
                <path
                  key={`p-${i}`}
                  d={path}
                  fill="none"
                  stroke={["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6", "#ec4899"][i % 6]}
                  strokeWidth="4"
                />
              )
          )}
      </svg>
    );
  }, [isGameReady, rungs, numPlayers, paths, revealedPlayers]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gray-900 p-4 pt-12 sm:p-8 text-white">
      <h1 className="mb-8 text-4xl font-bold sm:text-5xl">사다리 게임</h1>

      {!isGameReady ? (
        <div className="w-full max-w-4xl">
          {setupStep === "count" ? (
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-6">
                <label htmlFor="numPlayers" className="mb-2 block font-bold">
                  참가 인원 (2~100명):
                </label>
                <input
                  type="number"
                  id="numPlayers"
                  value={playerCountInput}
                  onChange={handlePlayerCountInputChange}
                  min={MIN_PLAYERS}
                  max={MAX_PLAYERS}
                  className="w-full rounded bg-gray-700 p-2 text-white"
                />
              </div>
              <button
                onClick={goToNameStep}
                className="w-full rounded-lg bg-blue-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-blue-600"
              >
                다음
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">참가자</h3>
                  {players.map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`참가자 ${i + 1}`}
                      value={players[i]}
                      onChange={(e) => handleNameChange(i, "player", e.target.value)}
                      className="mb-2 w-full rounded bg-gray-700 p-2 text-white"
                    />
                  ))}
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">결과</h3>
                  {outcomes.map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`결과 ${i + 1}`}
                      value={outcomes[i]}
                      onChange={(e) => handleNameChange(i, "outcome", e.target.value)}
                      onClick={() => handleOutcomeClick(i)}
                      className="mb-2 w-full rounded bg-gray-700 p-2 text-white"
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={goToCountStep}
                  className="w-full rounded-lg bg-gray-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-gray-600"
                >
                  이전
                </button>
                <button
                  onClick={generateLadder}
                  className="w-full rounded-lg bg-blue-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-blue-600"
                >
                  사다리 생성하기
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div
            className="flex w-full justify-around max-w-[calc(100px*10)] mb-2"
            style={{ width: `${numPlayers * 100}px` }}
          >
            {players.map((player, i) => (
              <button
                key={i}
                onClick={() => handlePlayerResultClick(i)}
                disabled={revealedPlayers[i]}
                className="w-[100px] truncate rounded-md py-2 text-center font-semibold transition-colors duration-200 hover:bg-blue-500 disabled:cursor-default disabled:bg-blue-700"
                title={player || `참가자 ${i + 1}`}
              >
                {player || `참가자 ${i + 1}`}
              </button>
            ))}
          </div>

          {ladderSVG}

          <div
            className="flex w-full justify-around max-w-[calc(100px*10)] mt-2"
            style={{ width: `${numPlayers * 100}px` }}
          >
            {Array.from({ length: numPlayers }).map((_, i) => {
              // i는 결과의 위치(열) 인덱스입니다.
              // 이 결과 위치에 도달하는 플레이어의 시작 인덱스를 찾습니다.
              const playerIndex = results ? results.indexOf(i) : -1;
              const isPlayerRevealed = playerIndex !== -1 && revealedPlayers[playerIndex];

              const resultText =
                isPlayerRevealed && results ? outcomes[i] || `결과 ${i + 1}` : "???";
              const titleText =
                isPlayerRevealed && results
                  ? `${players[playerIndex] || `참가자 ${playerIndex + 1}`}의 결과: ${
                      outcomes[i] || `결과 ${i + 1}`
                    }`
                  : `결과 ${i + 1}`;
              return (
                <div key={i} className="h-6 w-[100px] text-center font-semibold" title={titleText}>
                  <span className="inline-block w-full truncate">{resultText}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={revealAllResults}
              disabled={revealedPlayers.every(Boolean)}
              className="rounded-lg bg-green-500 px-6 py-3 text-xl font-bold text-white transition-colors duration-300 hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              전체 결과 보기
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
    </main>
  );
}
