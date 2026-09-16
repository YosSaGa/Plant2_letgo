import React from 'react';
import { Footerdemo } from '@/components/ui/footer-section';

export default function LandingFooter({ onOpenTeam, onStart, onPlantInfo, onAdmin }) {
  return (
    <div className="w-full">
      <Footerdemo
        onOpenTeam={onOpenTeam}
        onStart={onStart}
        onPlantInfo={onPlantInfo}
        onAdmin={onAdmin}
      />
    </div>
  );
}
