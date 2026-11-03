"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SHOWCASE_DEALS } from "./showcase/showcaseData";
import { ShowcaseStage } from "./showcase/types";
import { ShowcaseTopControls } from "./showcase/ShowcaseTopControls";
import { ShowcaseChatStream } from "./showcase/ShowcaseChatStream";
import { ShowcaseDealPanel } from "./showcase/ShowcaseDealPanel";

export function HeroShowcaseCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stageMap, setStageMap] = useState<Record<string, ShowcaseStage>>({});
  const [replyMap, setReplyMap] = useState<Record<string, boolean>>({ "deal-1": true });
  const [assignMap, setAssignMap] = useState<Record<string, boolean>>({ "deal-1": true });
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeDeal = SHOWCASE_DEALS[currentIndex];
  const currentStage = stageMap[activeDeal.id] ?? activeDeal.initialStage;
  const isReplyVisible = replyMap[activeDeal.id] ?? false;
  const isAssigned = assignMap[activeDeal.id] ?? false;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_DEALS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_DEALS.length) % SHOWCASE_DEALS.length);
  }, []);

  // Automatic deal rotation every 6 seconds when autoplay is enabled
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNext]);

  const handleSelectStage = (stage: ShowcaseStage) => {
    setStageMap((prev) => ({ ...prev, [activeDeal.id]: stage }));
  };

  const handleToggleReply = () => {
    setReplyMap((prev) => ({ ...prev, [activeDeal.id]: !isReplyVisible }));
  };

  const handleToggleAssign = () => {
    setAssignMap((prev) => ({ ...prev, [activeDeal.id]: !isAssigned }));
  };

  return (
    <div
      className="w-full max-w-lg mx-auto relative group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="neu-card rounded-[32px] p-5 sm:p-7 relative overflow-hidden bg-[#edf1f7] border border-white/80">
        {/* Top Scenario Controls: Counter, Interactive Dots, Pause/Play */}
        <ShowcaseTopControls
          currentIndex={currentIndex}
          total={SHOWCASE_DEALS.length}
          onSelect={setCurrentIndex}
          onPrev={handlePrev}
          onNext={handleNext}
          isAutoPlaying={isAutoPlaying}
          onToggleAutoPlay={() => setIsAutoPlaying((prev) => !prev)}
        />

        {/* WhatsApp Customer Conversation Stream */}
        <ShowcaseChatStream
          deal={activeDeal}
          showReply={isReplyVisible}
          onToggleReply={handleToggleReply}
        />

        {/* Dynamic USD Deal Value, Stage Pills & Agent Assignment */}
        <ShowcaseDealPanel
          deal={activeDeal}
          currentStage={currentStage}
          onSelectStage={handleSelectStage}
          isAssigned={isAssigned}
          onToggleAssign={handleToggleAssign}
        />
      </div>
    </div>
  );
}
