import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What's Next" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What to Try Next",
      content:
        "You've built the core. Now the fun part: make it yours. Try a different persona, plug in a real API your team already uses, or let the agent speak another language. Each small experiment teaches you something about how voice AI fits into your product -- and none of them require starting from scratch.",
    },

    {
      type: "prose",
      content:
        "You now have a voice AI agent that listens, speaks, uses tools, handles interruptions, and hands off to humans -- built with Twilio ConversationRelay.",
    },

    {
      type: "prose",
      content:
        "Here are some directions to take your agent further.",
    },

    { type: "section", title: "SSML for Fine-Grained Voice Control" },

    {
      type: "prose",
      content:
        "You can give the AI fine-grained control over how it speaks -- adding pauses, changing speed, or spelling out codes letter by letter -- using a special markup format called SSML.",
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "**SSML support depends on your voice provider.** The example below uses tags like `<say-as>`, `<break>`, and `<prosody>`, which work with **Google** and **Amazon** voices. The default provider (**ElevenLabs**) only supports the `<phoneme>` tag, and only in English. If you want full SSML support, switch to Google (`ttsProvider=\"Google\"` in your ConversationRelay settings) or stick to plain text.",
    },

    {
      type: "code",
      language: "javascript",
      code: `// Send SSML instead of plain text
ws.send(JSON.stringify({
  type: "text",
  token: '<speak>Your order <say-as interpret-as="characters">ORD</say-as>' +
    '<break time="300ms"/>12345 has shipped.' +
    '<prosody rate="slow">It should arrive by Friday.</prosody></speak>',
  last: true
}));`,
    },

    {
      type: "prose",
      content:
        "This is especially useful for reading back numbers, spelling out codes, and adding natural pauses that make the agent sound more human.",
    },

    { type: "section", title: "Multi-Language Support" },

    {
      type: "prose",
      content:
        "You already learned about dynamic language switching in Chapter 4. Take it further by building a truly multilingual agent:",
    },

    {
      type: "prose",
      content:
        "**Language-specific voices** -- Map each language to a native-sounding voice for the best pronunciation.\n**Cultural adaptation** -- Adjust greetings, formality levels, and conversation patterns per language.\n**Auto-detect from caller ID** -- Use the caller's phone number country code to set a default language before they even speak.",
    },

    { type: "section", title: "Twilio Conversational Intelligence" },

    {
      type: "prose",
      content:
        "Twilio offers a **Conversational Intelligence** service that can automatically analyze your voice AI calls after they happen. It provides:",
    },

    {
      type: "prose",
      content:
        "**Transcripts** -- Full written records of every call.\n**Sentiment analysis** -- Track how the caller is feeling over the course of a call.\n**Sensitive info detection** -- Automatically flag and hide personal information like credit card numbers.\n**Custom categories** -- Tag calls by topic, outcome, or any criteria you define.",
    },

    {
      type: "prose",
      content:
        "This is invaluable for understanding how your agent is doing across hundreds or thousands of calls without listening to each one.",
    },

    { type: "section", title: "Audio Playback" },

    {
      type: "prose",
      content:
        "Your agent can also play pre-recorded audio files during a call. This is useful for hold music, legal disclaimers, or branded audio intros:",
    },

    {
      type: "code",
      language: "javascript",
      code: `// Play a pre-recorded audio file
ws.send(JSON.stringify({
  type: "play",
  source: "https://your-server.com/audio/hold-music.mp3",
  loop: 1
}));`,
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "The `play` message also supports `interruptible` (whether the caller's voice can stop playback) and `preemptible` (whether a subsequent message can stop it). Audio must be a publicly accessible URL (MP3 or WAV). Check the [ConversationRelay docs](https://www.twilio.com/docs/voice/conversationrelay) for the latest supported fields and formats.",
    },

    { type: "section", title: "Advanced Tool Patterns" },

    {
      type: "prose",
      content:
        "Expand your agent's capabilities with more sophisticated tool designs:",
    },

    {
      type: "prose",
      content:
        "**Database queries** -- Let the agent look up customer information, product catalogs, or knowledge base articles.\n**Appointment scheduling** -- Integrate with a calendar API to book, modify, or cancel appointments.\n**Payment processing** -- Collect payment information (with PCI compliance considerations) and process transactions.\n**CRM integration** -- Log call notes, update customer records, and create support tickets automatically.",
    },

    { type: "section", title: "Resources" },

    {
      type: "prose",
      content:
        "Continue learning with these resources:",
    },

    {
      type: "prose",
      content:
        "**Twilio ConversationRelay docs** -- [twilio.com/docs/voice/conversationrelay](https://www.twilio.com/docs/voice/conversationrelay)\n**OpenAI API reference** -- [platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)\n**Twilio Voice TwiML** -- [twilio.com/docs/voice/twiml](https://www.twilio.com/docs/voice/twiml)\n**Twilio Conversational Intelligence** -- [twilio.com/docs/conversational-intelligence](https://www.twilio.com/docs/conversational-intelligence)",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Where voice AI is headed",
      content:
        "Voice AI is evolving rapidly. Some trends to watch:\n\n**Multimodal agents** -- Combining voice with SMS, email, and chat for seamless cross-channel experiences.\n**Real-time voice-to-voice models** -- LLMs that process audio directly, without the STT/TTS pipeline, for lower latency and richer expression.\n**Emotion-aware responses** -- Detecting caller frustration or confusion from vocal cues and adapting the response style.\n**Agentic workflows** -- Voice agents that orchestrate complex multi-step processes across multiple systems autonomously.",
    },

    {
      type: "callout",
      variant: "tip",
      content:
        "The best voice AI agents are built iteratively. Deploy early, listen to real calls, and improve continuously. Your first version does not need to be perfect -- it needs to be in production, generating real feedback.",
    },

    {
      type: "prose",
      content:
        "You started this workshop with a blank server and a Twilio phone number. You now have a voice AI agent that can hold real conversations, look things up, and hand off to humans. Whether you are building a customer service agent, an appointment scheduler, or something entirely new, you have the foundation to make it happen. Go build something great.",
    },
  ],
} satisfies StepDefinition;
