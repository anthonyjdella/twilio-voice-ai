import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "What's Next" },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What Comes Next",
      content:
        "The core agent is done. From here the possibilities open up: a different persona, a real API integration, another language. Each small experiment teaches something about how voice AI fits into a product -- and none of them require starting from scratch.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "The agent listens, speaks, uses tools, handles interruptions, and hands off to humans -- all built with Twilio ConversationRelay. Here are directions to take it further.",
    },

    { type: "section", title: "SSML for Fine-Grained Voice Control" },

    {
      type: "prose",
      content:
        "The agent can control exactly how it speaks -- adding pauses, changing speed, or spelling out codes letter by letter -- using a markup format called SSML.",
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "**SSML support depends on the voice provider.** Tags like `<say-as>`, `<break>`, and `<prosody>` work with **Google** and **Amazon** voices. The default provider (**ElevenLabs**) only supports `<phoneme>`, and only in English. For full SSML, switch to Google (`ttsProvider=\"Google\"`).",
    },

    {
      type: "code",
      audience: "builder",
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
        "Dynamic language switching was introduced in Chapter 4. A multilingual agent can go further:",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "**Language-specific voices** -- Map each language to a native-sounding voice for better pronunciation.\n**Cultural adaptation** -- Adjust greetings, formality levels, and conversation patterns per language.\n**Auto-detect from caller ID** -- Use the caller's phone number country code to set a default language before they speak.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "An agent can greet callers in their own language, switch mid-call if asked, and adapt its tone to match cultural norms -- all from the same server.",
    },

    { type: "section", title: "Twilio Conversational Intelligence" },

    {
      type: "prose",
      content:
        "Twilio offers a **Conversational Intelligence** service that automatically analyzes voice AI calls after they happen:",
    },

    {
      type: "prose",
      content:
        "**Transcripts** -- Full written records of every call.\n**Sentiment analysis** -- Track how the caller feels over the course of a call.\n**Sensitive info detection** -- Automatically flag and redact personal information like credit card numbers.\n**Custom categories** -- Tag calls by topic, outcome, or any criteria you define.",
    },

    {
      type: "prose",
      content:
        "This makes it possible to understand agent performance across hundreds or thousands of calls without listening to each one.",
    },

    { type: "section", title: "Audio Playback" },

    {
      type: "prose",
      content:
        "The agent can also play pre-recorded audio files during a call -- useful for hold music, legal disclaimers, or branded audio intros.",
    },

    {
      type: "code",
      audience: "builder",
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
        "The `play` message also supports `interruptible` (whether the caller's voice can stop playback) and `preemptible` (whether a subsequent message can stop it). Audio must be a publicly accessible URL (MP3 or WAV). Check the [ConversationRelay docs](https://www.twilio.com/docs/voice/conversationrelay) for supported fields and formats.",
    },

    { type: "section", title: "Advanced Tool Patterns" },

    {
      type: "prose",
      content:
        "Beyond weather and order lookup, voice agents can integrate with almost any backend system:",
    },

    {
      type: "prose",
      content:
        "**Database queries** -- Look up customer information, product catalogs, or knowledge base articles.\n**Appointment scheduling** -- Integrate with a calendar API to book, modify, or cancel appointments.\n**Payment processing** -- Collect payment information (with PCI compliance considerations) and process transactions.\n**CRM integration** -- Log call notes, update customer records, and create support tickets automatically.",
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
      audience: "builder",
      variant: "tip",
      content:
        "The best voice AI agents are built iteratively. Deploy early, listen to real calls, and improve continuously. The first version does not need to be perfect -- it needs to be in production, generating real feedback.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "This workshop started with a blank server and a Twilio phone number. Now the agent holds real conversations, looks things up, and hands off to humans. Whether the goal is a customer service agent, an appointment scheduler, or something entirely new, the foundation is in place.",
    },

    {
      type: "prose",
      audience: "explorer",
      content:
        "That is the full picture -- from a phone call arriving at Twilio, through speech-to-text, an AI generating a response, and text-to-speech back to the caller. Every piece connects through ConversationRelay, and the result is a voice agent that can hold a real conversation.",
    },
  ],
} satisfies StepDefinition;
