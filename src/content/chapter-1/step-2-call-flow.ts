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
            "You enter your phone number in the workshop app and your server tells Twilio to call you.",
        },
        {
          icon: "/images/icons/document.svg",
          title: "Twilio asks for instructions",
          description:
            "Twilio calls your phone and asks your server what to do with the call. Your server says \"connect this call to my AI agent.\"",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "A live connection opens",
          description:
            "Twilio opens a two-way connection to your server that stays open for the entire call.",
        },
        {
          icon: "/images/icons/voice-wave.svg",
          title: "You speak",
          description:
            "Twilio listens to your voice, converts it to text, and sends the text to your server.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "The AI thinks",
          description:
            "Your server sends the caller's words to the AI, which starts composing a reply immediately.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Agent responds",
          description:
            "The AI's reply streams back word by word. Twilio converts the text to a natural-sounding voice in real time.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Conversation continues",
          description:
            "The call flows naturally -- you can interrupt, press keys on your keypad, and the AI adapts just like a real person would.",
        },
      ],
    },
  ],
} satisfies StepDefinition;
