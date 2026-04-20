import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "The Conversation Flow" },

    {
      type: "prose",
      content:
        "Let's trace a single conversational turn from start to finish. The caller says \"What's the weather like in San Francisco?\" and here is exactly what happens:",
    },

    // Shared: visual-step for both modes
    {
      type: "visual-step",
      steps: [
        {
          icon: "/images/icons/phone-call.svg",
          title: "Caller speaks",
          description:
            "The caller says something into their phone, just like a normal call.",
        },
        {
          icon: "/images/icons/pencil.svg",
          title: "Speech becomes text",
          description:
            "Twilio listens to the caller's voice and converts it into written text -- like automatic subtitles. Once the caller finishes their sentence, the text is sent to the server.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "The AI thinks",
          description:
            "The server sends the caller's words to an AI model, along with everything said so far in the conversation. The AI starts composing a reply immediately.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Reply streams back word by word",
          description:
            "Instead of waiting for the full answer, the server sends each piece of the reply to Twilio the moment it's ready -- so the caller starts hearing a response almost instantly.",
        },
        {
          icon: "/images/icons/sound-wave.svg",
          title: "Caller hears the reply",
          description:
            "Twilio converts the text into a natural, human-sounding voice and plays it through the call. The whole round trip takes under two seconds.",
        },
      ],
    },

    // Explorer: latency summary

    { type: "page-break" },

    // Builder: json-message examples
    {
      type: "json-message",
      audience: "builder",
      direction: "inbound",
      messageType: "prompt",
      code: `{
  "type": "prompt",
  "voicePrompt": "What's the weather like in San Francisco?",
  "lang": "en-US",
  "last": true
}`,
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "outbound",
      messageType: "text",
      code: `{
  "type": "text",
  "token": "It's currently 62 degrees and partly cloudy in San Francisco, ",
  "last": false
}`,
    },

    {
      type: "json-message",
      audience: "builder",
      direction: "outbound",
      messageType: "text",
      code: `{
  "type": "text",
  "token": "with a light breeze coming off the bay.",
  "last": true
}`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "tip",
      content:
        "The `last` field is critical. Setting `last: true` on the final token tells ConversationRelay that your response is complete. This lets the TTS engine flush its buffer and signals that the system should start listening for the caller's next utterance.",
    },

    { type: "page-break" },

    { type: "section", title: "Why WebSockets?" },

    {
      type: "image",
      src: "/images/illustrations/connectivity.svg",
      alt: "A globe wrapped in bidirectional connection lines linking nodes across it — a visual metaphor for a persistent, real-time WebSocket channel.",
      size: "md",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "ConversationRelay uses WebSockets rather than webhooks for a critical reason: latency. A phone conversation is real-time. Every millisecond of delay between the caller finishing their sentence and hearing the agent's response feels unnatural. WebSockets provide a persistent, full-duplex connection that eliminates the overhead of establishing new HTTP connections for each message. Your server and Twilio maintain an open channel for the entire duration of the call, allowing tokens to flow back and forth with minimal delay.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "info",
      content:
        "Twilio keeps a live two-way connection open to your server for the entire call — that's what makes the conversation feel instant instead of walkie-talkie.",
    },


  ],
} satisfies StepDefinition;
