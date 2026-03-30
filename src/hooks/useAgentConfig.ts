"use client";

import { useProgress } from "./useProgress";
import type { AgentConfig } from "@/lib/types";

export function useAgentConfig() {
  const { progress, updateAgentConfig } = useProgress();

  return {
    config: progress.agentConfig,
    update: (partial: Partial<AgentConfig>) => updateAgentConfig(partial),
    addFeature: (feature: string) => {
      if (!progress.agentConfig.features.includes(feature)) {
        updateAgentConfig({
          features: [...progress.agentConfig.features, feature],
        });
      }
    },
  };
}
