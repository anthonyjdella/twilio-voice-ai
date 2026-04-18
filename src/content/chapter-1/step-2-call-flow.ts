import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "The Call Flow" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "Here is what happens when you call your agent, from the caller's perspective:",
    },

    {
      type: "visual-step",
      audience: "explorer",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Your phone rings",
          description:
            "You click \"Call Me\" in the workshop app, and your phone rings a moment later.",
        },
        {
          icon: "/images/icons/voice-wave.svg",
          title: "The agent greets you",
          description:
            "You pick up and hear a voice. The agent introduces itself and asks how it can help.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "You have a conversation",
          description:
            "You talk, the agent listens. It responds in a natural voice. You can interrupt it mid-sentence, just like talking to a person.",
        },
        {
          icon: "/images/icons/wrench.svg",
          title: "The agent takes action",
          description:
            "Ask it to look something up or check an order. It pauses briefly, fetches the answer, and tells you what it found.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "The call continues or hands off",
          description:
            "The conversation keeps going as long as you need. If the agent cannot help, it can transfer you to a real person.",
        },
      ],
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "From the caller's perspective, it feels like talking to a person. Behind the scenes, every turn goes through speech-to-text, an AI model, and text-to-speech -- all in under two seconds. The next step breaks down those components.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Here is the technical sequence that runs every time your agent handles a call:",
    },

    {
      type: "visual-step",
      audience: "builder",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "REST API triggers the call",
          description:
            "Your server calls the Twilio REST API to place an outbound call. You provide the caller's number and a webhook URL.",
        },
        {
          icon: "/images/icons/document.svg",
          title: "Twilio requests TwiML",
          description:
            "When the call connects, Twilio sends an HTTP request to your webhook. Your server responds with TwiML containing <Connect><ConversationRelay>, which tells Twilio to open a WebSocket to your server.",
        },
        {
          icon: "/images/icons/connection.svg",
          title: "WebSocket opens",
          description:
            "Twilio establishes a WebSocket connection to the URL you specified. Your server receives a `setup` message with the call metadata (callSid, caller number, custom parameters).",
        },
        {
          icon: "/images/icons/voice-wave.svg",
          title: "Speech becomes text",
          description:
            "The caller speaks. Twilio runs speech-to-text and sends your server a `prompt` message containing the transcribed text.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "Your server calls the LLM",
          description:
            "Your server sends the transcript to the LLM. As the model streams its reply, you send each chunk back over the WebSocket as a `text` message with `last: true` on the final chunk.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Text becomes speech",
          description:
            "Twilio receives your text and runs text-to-speech. The caller hears the response as audio in real time, even while the model is still streaming.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Loop continues",
          description:
            "This cycle repeats for every turn. Twilio also sends `interrupt` (caller spoke over the agent), `dtmf` (keypad press), and `error` messages through the same WebSocket.",
        },
      ],
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "You'll implement each of these steps yourself. Chapter 2 covers the WebSocket server and TwiML endpoint. The next step maps out the architecture so you can see how these pieces connect.",
    },
  ],
} satisfies StepDefinition;
