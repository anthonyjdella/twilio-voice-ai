import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "The Call Flow" },

    {
      type: "prose",
      content: "Here is what a complete call looks like once your agent is running:",
    },

    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "You click \"Call Me\"",
          description:
            "You enter your phone number in the workshop app and your server initiates an outbound call using the Twilio REST API.",
        },
        {
          icon: "/images/icons/document.svg",
          title: "Twilio fetches your TwiML",
          description:
            "Twilio calls your phone and requests TwiML instructions from your server. Your TwiML tells Twilio to open a ConversationRelay session.",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "WebSocket connects",
          description:
            "Twilio opens a WebSocket to your server and sends a setup message with call metadata.",
        },
        {
          icon: "/images/icons/voice-wave.svg",
          title: "You speak",
          description:
            "Twilio's STT engine (Deepgram) transcribes your speech and sends your server a prompt message.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "LLM processes",
          description:
            "Your server sends the transcription to OpenAI along with conversation history and a system prompt.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Agent responds",
          description:
            "As the LLM streams tokens back, you forward them to Twilio, which converts them to speech via ElevenLabs TTS in real time.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Conversation continues",
          description:
            "The call flows naturally with interruption handling, tool calling, and all the dynamics of a real phone call.",
        },
      ],
    },
  ],
} satisfies StepDefinition;
