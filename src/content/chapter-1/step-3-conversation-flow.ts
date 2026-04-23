import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What Makes It Feel Alive", audience: "explorer" },
    { type: "section", title: "The Conversation Flow", audience: "builder" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "The last step covered what a call is like at the highest level. This step is about the three things that separate voice AI from a chatbot with a phone number -- the details that make the agent feel like a real person on the line, not a robot reading lines.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "Replies Stream Back Word by Word",
      content:
        "The agent does not wait to finish writing its full response before speaking. The moment the first few words are ready, they are already playing in your ear -- and more keep arriving while the earlier ones are still being spoken. It is the difference between a friend who pauses and thinks out loud versus one who stares at you silently for five seconds before answering.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "You Can Interrupt It",
      content:
        "If the agent starts going on about something you did not ask for, you can just talk over it -- exactly like you would with a person. The agent stops mid-sentence, listens to what you said, and continues from there. No button to press, no command to say. It just works.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "The Whole Round Trip Takes Under Two Seconds",
      content:
        "From the moment you finish speaking to the moment you hear the agent's first word, it is usually under two seconds -- roughly the same pause you would get from a person on the other end of the line. Anything slower and it stops feeling like a conversation; it starts feeling like a voicemail system.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "Let's trace a single conversational turn from start to finish. The caller says \"What's the weather like in San Francisco?\" and here is exactly what happens:",
    },

    {
      type: "visual-step",
      audience: "builder",
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
        "The `last` field is critical. Setting `last: true` on the final token tells Conversation Relay that your response is complete. This lets the TTS engine flush its buffer and signals that the system should start listening for the caller's next utterance.",
    },

    { type: "page-break" },

    { type: "section", title: "Why WebSockets?", audience: "builder" },
    { type: "section", title: "The Line Stays Open", audience: "explorer" },

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
        "Conversation Relay uses WebSockets rather than webhooks for a critical reason: latency. A phone conversation is real-time. Every millisecond of delay between the caller finishing their sentence and hearing the agent's response feels unnatural. WebSockets provide a persistent, full-duplex connection that eliminates the overhead of establishing new HTTP connections for each message. Your server and Twilio maintain an open channel for the entire duration of the call, allowing tokens to flow back and forth with minimal delay.",
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
