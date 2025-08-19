"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function ReactionSpeedPage() {
  // 'waiting': 초기 화면
  // 'ready': 초록색을 기다리는 상태
  // 'active': 클릭해야 하는 상태
  // 'tooSoon': 너무 빨리 클릭한 상태
  // 'result': 결과 표시 상태
  const [status, setStatus] = useState<"waiting" | "ready" | "active" | "tooSoon" | "result">(
    "waiting"
  );
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = () => {
    setStatus("ready");
    setReactionTime(null);

    // 기존 타이머가 있다면 제거
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 1~3초 후 'active' 상태로 변경
    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setStatus("active");
    }, Math.random() * 2000 + 1000);
  };

  const handleClick = () => {
    switch (status) {
      case "waiting":
      case "result":
      case "tooSoon":
        start();
        break;
      case "ready": // 너무 빨리 클릭했을 때
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        setStatus("tooSoon");
        break;
      case "active": // 제때 클릭했을 때
        const endTime = performance.now();
        setReactionTime(Math.round(endTime - startTimeRef.current));
        setStatus("result");
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        break;
    }
  };

  const renderContent = () => {
    switch (status) {
      case "waiting":
        return {
          bgColor: "bg-gray-700",
          title: "반응 속도 테스트",
          subtitle: "화면을 클릭해서 시작하세요",
        };
      case "ready":
        return {
          bgColor: "bg-red-500",
          title: "준비...",
          subtitle: "화면이 초록색으로 바뀌면 클릭하세요",
        };
      case "active":
        return { bgColor: "bg-green-500", title: "클릭!", subtitle: "" };
      case "tooSoon":
        return {
          bgColor: "bg-yellow-500",
          title: "너무 빨랐어요!",
          subtitle: "다시 시도하려면 클릭하세요",
        };
      case "result":
        return {
          bgColor: "bg-blue-500",
          title: `${reactionTime} ms`,
          subtitle: "다시 시도하려면 클릭하세요",
        };
    }
  };

  const { bgColor, title, subtitle } = renderContent();

  return (
    <main className="flex h-screen flex-col items-center justify-center text-white">
      <div
        className={`flex h-full w-full flex-grow cursor-pointer flex-col items-center justify-center p-8 text-center transition-colors duration-200 ${bgColor}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter" ? handleClick() : undefined)}
      >
        <h1 className="text-6xl font-bold">{title}</h1>
        {subtitle && <p className="mt-4 text-2xl">{subtitle}</p>}
      </div>
      <div className="absolute bottom-8">
        <Link
          href="/"
          className="rounded bg-gray-800 px-6 py-3 font-bold text-white no-underline transition-colors hover:bg-gray-950"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
