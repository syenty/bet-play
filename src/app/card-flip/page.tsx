"use client";

import { useState } from "react";
import Link from "next/link";

// Card 타입 정의
type Card = {
  id: number;
  isWinner: boolean;
  isFlipped: boolean;
};

// Fisher-Yates 셔플 알고리즘
const shuffleArray = (array: Card[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function CardFlipPage() {
  const [totalCardsInput, setTotalCardsInput] = useState("12");
  const [winnerCountInput, setWinnerCountInput] = useState("1");
  const [cards, setCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<"setup" | "playing" | "finished">("setup");
  const [message, setMessage] = useState("");

  // 카드를 생성하고 섞는 함수
  const startGame = () => {
    const totalCards = parseInt(totalCardsInput, 10);
    const winnerCount = parseInt(winnerCountInput, 10);

    if (isNaN(totalCards) || totalCards < 2 || totalCards > 30) {
      setMessage("전체 카드 수는 2에서 30 사이의 숫자여야 합니다.");
      return;
    }

    if (isNaN(winnerCount) || winnerCount < 1 || winnerCount > totalCards) {
      setMessage(`당첨 카드 수는 1에서 ${totalCards} 사이의 숫자여야 합니다.`);
      return;
    }

    setMessage("");
    const newCards: Card[] = [];
    for (let i = 0; i < totalCards; i++) {
      newCards.push({
        id: i,
        isWinner: i < winnerCount, // 먼저 당첨 카드를 만들고
        isFlipped: false,
      });
    }

    setCards(shuffleArray(newCards)); // 섞어서 배치
    setGameState("playing");
  };

  // 카드 클릭 처리 함수
  const handleCardClick = (id: number) => {
    if (gameState !== "playing") return;

    const clickedCard = cards.find((card) => card.id === id);
    if (!clickedCard || clickedCard.isFlipped) return;

    // 클릭한 카드 뒤집기
    const updatedCards = cards.map((card) =>
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);

    // --- 게임 종료 조건 확인 ---
    const winnerCards = updatedCards.filter((card) => card.isWinner);
    const allWinnersFound = winnerCards.length > 0 && winnerCards.every((card) => card.isFlipped);

    if (allWinnersFound) {
      // 모든 당첨 카드를 찾았으면 즉시 게임 종료
      setGameState("finished");
      setMessage("모든 당첨 카드를 찾았습니다! 🎉");
      // 잠시 후 나머지 카드도 모두 공개하여 확인시켜 줍니다.
      setTimeout(() => {
        setCards((currentCards) => currentCards.map((card) => ({ ...card, isFlipped: true })));
      }, 800);
    } else if (updatedCards.every((card) => card.isFlipped)) {
      // 모든 카드를 뒤집었을 때 (당첨 카드를 다 못찾은 경우)
      setGameState("finished");
      setMessage("모든 카드를 확인했습니다!");
    }
  };

  // 모든 카드를 즉시 공개하는 함수
  const revealAllCards = () => {
    setGameState("finished");
    setMessage("전체 결과입니다!");
    // 모든 카드를 뒤집힌 상태로 업데이트
    setCards((currentCards) => currentCards.map((card) => ({ ...card, isFlipped: true })));
  };

  // 게임을 설정 화면으로 리셋하는 함수
  const resetGame = () => {
    setGameState("setup");
    setCards([]);
    setMessage("");
  };

  // 카드 그리드 스타일 동적 생성
  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fill, minmax(100px, 1fr))`,
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-800 p-4 text-white">
      <h1 className="mb-6 text-4xl font-bold">카드 뒤집기 제비뽑기</h1>

      {/* --- 설정 화면 --- */}
      {gameState === "setup" && (
        <div className="w-full max-w-sm rounded-lg bg-gray-700 p-6 shadow-lg">
          <div className="mb-4">
            <label htmlFor="totalCards" className="mb-2 block font-semibold">
              전체 카드 수 (2-30)
            </label>
            <input
              id="totalCards"
              type="number"
              min="2"
              max="30"
              value={totalCardsInput}
              onChange={(e) => setTotalCardsInput(e.target.value)}
              className="w-full rounded bg-gray-800 p-2 text-white"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="winnerCount" className="mb-2 block font-semibold">
              당첨 카드 수
            </label>
            <input
              id="winnerCount"
              type="number"
              min="1"
              value={winnerCountInput}
              onChange={(e) => setWinnerCountInput(e.target.value)}
              className="w-full rounded bg-gray-800 p-2 text-white"
            />
          </div>
          <button
            onClick={startGame}
            className="w-full rounded-lg bg-blue-600 py-3 text-xl font-bold transition hover:bg-blue-700"
          >
            게임 시작
          </button>
          {message && <p className="mt-4 text-center text-red-400">{message}</p>}
        </div>
      )}

      {/* --- 게임 화면 --- */}
      {gameState !== "setup" && (
        <div className="flex w-full max-w-4xl flex-col items-center">
          <div className="grid w-full gap-4" style={gridStyle}>
            {cards.map((card) => (
              <div
                key={card.id}
                className="h-36 [perspective:1000px]"
                onClick={() => handleCardClick(card.id)}
              >
                <div
                  className={`relative h-full w-full cursor-pointer rounded-lg shadow-md transition-transform duration-700 [transform-style:preserve-3d] ${
                    card.isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* 카드 앞면 (뒤집히기 전) */}
                  <div className="absolute flex h-full w-full items-center justify-center rounded-lg bg-indigo-500 [backface-visibility:hidden]">
                    <span className="text-5xl font-bold">?</span>
                  </div>
                  {/* 카드 뒷면 (뒤집힌 후) */}
                  <div
                    className={`absolute flex h-full w-full items-center justify-center rounded-lg [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                      card.isWinner ? "bg-yellow-400" : "bg-gray-600"
                    }`}
                  >
                    <span className="text-2xl font-bold">{card.isWinner ? "당첨" : "꽝"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- 결과 및 컨트롤 --- */}
          <div className="mt-8 flex h-24 flex-col items-center justify-center">
            {gameState === "playing" && (
              <button
                onClick={revealAllCards}
                className="rounded-lg bg-yellow-500 px-6 py-2 text-lg font-bold transition hover:bg-yellow-600"
              >
                결과 확인
              </button>
            )}
            {gameState === "finished" && (
              <div className="text-center">
                <p className="mb-4 text-3xl font-bold">{message}</p>
                <button
                  onClick={resetGame}
                  className="mt-4 rounded-lg bg-green-600 px-6 py-2 text-lg font-bold transition hover:bg-green-700"
                >
                  다시하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Link
        href="/"
        className="absolute bottom-8 rounded bg-gray-700 px-6 py-2 font-bold no-underline hover:bg-gray-600"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
