import type { StepDefinition } from "@/lib/content-blocks";

// Chapter 1: Mission Briefing
import Ch1Step1 from "./chapter-1/step-1-what-were-building";
import Ch1Step2 from "./chapter-1/step-2-call-flow";
import Ch1Step4 from "./chapter-1/step-4-architecture";
import Ch1Step5 from "./chapter-1/step-5-message-flow";
import Ch1Step6 from "./chapter-1/step-6-setup";
import Ch1Step7 from "./chapter-1/step-7-ngrok";
import Ch1Step8 from "./chapter-1/step-8-twilio-config";
import Ch1Step9 from "./chapter-1/step-9-verify";

// Chapter 2: First Contact
import Ch2Step1 from "./chapter-2/step-1-websocket-server";
import Ch2Step2 from "./chapter-2/step-2-twiml-setup";
import Ch2Step3 from "./chapter-2/step-3-handle-speech";
import Ch2Step4 from "./chapter-2/step-4-stream-response";
import Ch2Step5 from "./chapter-2/step-5-first-call";

// Chapter 3: Identity
import Ch3Step1 from "./chapter-3/step-1-system-prompt";
import Ch3Step2 from "./chapter-3/step-2-persona-builder";
import Ch3Step3 from "./chapter-3/step-3-voice-selection";
import Ch3Step4 from "./chapter-3/step-4-language-config";
import Ch3Step5 from "./chapter-3/step-5-test-identity";

// Chapter 4: Reflexes
import Ch4Step1 from "./chapter-4/step-1-interruptions";
import Ch4Step2 from "./chapter-4/step-2-dtmf";
import Ch4Step3 from "./chapter-4/step-3-silence";
import Ch4Step4 from "./chapter-4/step-4-language-switch";
import Ch4Step5 from "./chapter-4/step-5-test-reflexes";

// Chapter 5: Superpowers
import Ch5Step1 from "./chapter-5/step-1-tool-calling";
import Ch5Step2 from "./chapter-5/step-2-define-tools";
import Ch5Step3 from "./chapter-5/step-3-handle-tools";
import Ch5Step4 from "./chapter-5/step-4-handoff";
import Ch5Step5 from "./chapter-5/step-5-test-superpowers";

// Chapter 6: Launch
import Ch6Step1 from "./chapter-6/step-1-polish";
import Ch6Step2 from "./chapter-6/step-2-deploy";
import Ch6Step3 from "./chapter-6/step-3-showcase";
import Ch6Step4 from "./chapter-6/step-4-next-steps";

export const stepRegistry: Record<string, StepDefinition> = {
  "mission-briefing/what-were-building": Ch1Step1,
  "mission-briefing/call-flow": Ch1Step2,
  "mission-briefing/architecture": Ch1Step4,
  "mission-briefing/message-flow": Ch1Step5,
  "mission-briefing/setup": Ch1Step6,
  "mission-briefing/expose-server": Ch1Step7,
  "mission-briefing/twilio-config": Ch1Step8,
  "mission-briefing/verify": Ch1Step9,

  "first-contact/websocket-server": Ch2Step1,
  "first-contact/twiml-setup": Ch2Step2,
  "first-contact/handle-speech": Ch2Step3,
  "first-contact/stream-response": Ch2Step4,
  "first-contact/first-call": Ch2Step5,

  "identity/system-prompt": Ch3Step1,
  "identity/persona-builder": Ch3Step2,
  "identity/voice-selection": Ch3Step3,
  "identity/language-config": Ch3Step4,
  "identity/test-identity": Ch3Step5,

  "reflexes/interruptions": Ch4Step1,
  "reflexes/dtmf": Ch4Step2,
  "reflexes/silence": Ch4Step3,
  "reflexes/language-switch": Ch4Step4,
  "reflexes/test-reflexes": Ch4Step5,

  "superpowers/tool-calling": Ch5Step1,
  "superpowers/define-tools": Ch5Step2,
  "superpowers/handle-tools": Ch5Step3,
  "superpowers/handoff": Ch5Step4,
  "superpowers/test-superpowers": Ch5Step5,

  "launch/polish": Ch6Step1,
  "launch/deploy": Ch6Step2,
  "launch/showcase": Ch6Step3,
  "launch/next-steps": Ch6Step4,
};
