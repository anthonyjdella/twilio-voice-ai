import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "The Message Flow" },

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
            "Twilio listens to the caller's voice and converts it into written text -- like automatic subtitles. Once the caller finishes their sentence, the text is sent to your server.",
        },
        {
          icon: "/images/icons/lightbulb-doc.svg",
          title: "The AI thinks",
          description:
            "Your server sends the caller's words to an AI model, along with everything said so far in the conversation. The AI starts composing a reply immediately.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "Reply streams back word by word",
          description:
            "Instead of waiting for the full answer, your server sends each piece of the reply to Twilio the moment it's ready -- so the caller starts hearing a response almost instantly.",
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
    {
      type: "prose",
      audience: "explorer",
      content:
        "That's it -- five steps, under two seconds, and the caller never knows an AI is involved. It feels like talking to a real person.",
    },

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

    { type: "section", title: "Why WebSockets?" },

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

    {
      type: "deep-dive",
      audience: "builder",
      title: "ConversationRelay Protocol Details",
      content:
        "The ConversationRelay WebSocket protocol uses JSON messages in both directions. Here are the key message types you will work with:\n\n**Inbound (Twilio to your server):**\n\n- `setup` -- Sent once when the WebSocket connects. Contains the session ID, call SID, caller's phone number, call direction, and any custom parameters you passed in your TwiML.\n- `prompt` -- Sent when the caller finishes speaking. Contains the transcribed text in the `voicePrompt` field, the detected language in `lang`, and a `last` boolean indicating whether this is the final transcription for this utterance.\n- `interrupt` -- Sent when the caller starts speaking while the agent is talking. Includes `utteranceUntilInterrupt` (what the caller actually heard) so you can trim conversation history.\n- `dtmf` -- Sent when the caller presses a key on their phone's keypad. Contains the `digit` pressed (singular — each keypress is a separate message).\n- `error` -- Sent when something goes wrong during the session (STT failure, malformed outbound message, etc.). Contains a `description` field with details.\n\n**Outbound (your server to Twilio):**\n\n- `text` -- Send text to be spoken to the caller. Use the `token` field for the text content and `last: true` on the final chunk.\n- `language` -- Switch the TTS and transcription languages mid-call (e.g., `ttsLanguage: \"es-ES\"`).\n- `play` -- Play a pre-recorded audio file to the caller (e.g., hold music, legal disclaimers). Takes a `source` URL and optional `loop` count.\n- `sendDigits` -- Send DTMF tones into the call (e.g., navigating an external phone menu). Takes a `digits` string.\n- `end` -- Terminate the ConversationRelay session, optionally including `handoffData` to trigger a transfer via your action URL.\n\nAll messages are JSON-encoded strings sent over the WebSocket. The protocol is intentionally simple -- no binary frames, no negotiation. This makes it straightforward to implement in any language or framework that supports WebSockets.",
    },
  ],
} satisfies StepDefinition;
