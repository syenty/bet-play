"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const MAX_OPTIONS = 100;
const MIN_OPTIONS = 2;

// Helper to get color for a slice
const getColor = (index: number) => {
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];
  return colors[index % colors.length];
};

export default function RouletteGamePage() {
  const [options, setOptions] = useState<string[]>([
    "옵션 1",
    "옵션 2",
    "옵션 3",
    "옵션 4",
    "옵션 5",
    "옵션 6",
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, `옵션 ${options.length + 1}`]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > MIN_OPTIONS) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const startSpin = () => {
    if (isSpinning || options.some((opt) => opt.trim() === "")) {
      alert("모든 옵션을 입력해주세요.");
      return;
    }

    setResult(null);
    setIsSpinning(true);

    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 to 9 full spins
    const winningIndex = Math.floor(Math.random() * options.length);
    const anglePerSlice = 360 / options.length;
    const winningAngle = winningIndex * anglePerSlice;

    // Add a random offset within the slice to make it more random
    const randomOffset = (Math.random() - 0.5) * anglePerSlice * 0.8;

    // The pointer is at the top (270 degrees), so we need to adjust
    const targetRotation = randomSpins * 360 + (270 - winningAngle - randomOffset);

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(options[winningIndex]);
    }, 5000); // Corresponds to the transition duration in CSS
  };

  const wheelSVG = useMemo(() => {
    const numOptions = options.length;
    const anglePerSlice = 360 / numOptions;
    const radius = 150;
    const textRadius = radius * 0.7;

    return (
      <g transform="translate(175, 175)">
        {options.map((option, i) => {
          const startAngle = i * anglePerSlice;
          const endAngle = startAngle + anglePerSlice;

          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);

          const x1 = radius * Math.cos(startRad);
          const y1 = radius * Math.sin(startRad);
          const x2 = radius * Math.cos(endRad);
          const y2 = radius * Math.sin(endRad);

          const largeArcFlag = anglePerSlice > 180 ? 1 : 0;

          const pathData = `M 0,0 L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

          const textAngle = startAngle + anglePerSlice / 2;
          const textRad = (textAngle - 90) * (Math.PI / 180);
          const textX = textRadius * Math.cos(textRad);
          const textY = textRadius * Math.sin(textRad);

          return (
            <g key={i}>
              <path d={pathData} fill={getColor(i)} />
              <text
                x={textX}
                y={textY}
                transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {option.length > 10 ? `${option.substring(0, 9)}...` : option}
              </text>
            </g>
          );
        })}
      </g>
    );
  }, [options]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-white">
      <h1 className="mb-4 text-5xl font-bold">룰렛 게임</h1>

      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute top-[-10px] z-10 text-5xl text-yellow-400">▼</div>
        <div className="h-[350px] w-[350px] overflow-hidden rounded-full border-4 border-yellow-400 shadow-lg">
          <svg
            width="350"
            height="350"
            viewBox="0 0 350 350"
            className="transition-transform duration-[5000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {wheelSVG}
          </svg>
        </div>
      </div>

      {result && !isSpinning && (
        <div className="my-4 text-center">
          <p className="text-xl">결과:</p>
          <p className="text-4xl font-bold text-yellow-400">{result}</p>
        </div>
      )}

      <button
        onClick={startSpin}
        disabled={isSpinning}
        className="mb-8 rounded-lg bg-green-500 px-10 py-4 text-2xl font-bold text-white transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:hover:scale-100"
      >
        {isSpinning ? "돌아가는 중..." : "돌리기!"}
      </button>

      <div className="w-full max-w-lg">
        <h3 className="mb-2 text-xl font-semibold">
          옵션 ({options.length}/{MAX_OPTIONS})
        </h3>
        <div className="max-h-60 overflow-y-auto pr-2">
          {options.map((option, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                className="flex-grow rounded bg-gray-700 p-2 text-white"
                disabled={isSpinning}
              />
              <button
                onClick={() => removeOption(i)}
                className="rounded bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700 disabled:bg-gray-600"
                disabled={isSpinning || options.length <= MIN_OPTIONS}
              >
                -
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          className="mt-2 w-full rounded bg-blue-500 py-2 font-bold text-white hover:bg-blue-600 disabled:bg-gray-600"
          disabled={isSpinning || options.length >= MAX_OPTIONS}
        >
          옵션 추가
        </button>
      </div>

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
