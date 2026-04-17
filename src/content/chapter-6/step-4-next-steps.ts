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
        "Congratulations -- you have built a fully functional voice AI agent with Twilio ConversationRelay. You have gone from zero to an agent that can listen, speak, use tools, handle interruptions, and hand off to humans. That is a serious accomplishment.",
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
        "ConversationRelay supports SSML (Speech Synthesis Markup Language) in your text responses. This gives you precise control over pronunciation, pauses, emphasis, and speed:",
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
        "SSML is especially useful for reading back numbers, spelling out codes, and adding natural pauses that make the agent sound more human.",
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
        "Twilio offers a **Conversational Intelligence** service that can analyze your voice AI calls after the fact. It provides:",
    },

    {
      type: "prose",
      content:
        "**Transcripts** -- Full transcripts of every call.\n**Sentiment analysis** -- Track caller sentiment over the course of a call.\n**PII detection** -- Automatically flag and redact sensitive information.\n**Custom categories** -- Tag calls by topic, outcome, or any custom criteria.",
    },

    {
      type: "prose",
      content:
        "This is invaluable for understanding how your agent performs at scale without listening to every call manually.",
    },

    { type: "section", title: "Audio Playback" },

    {
      type: "prose",
      content:
        "ConversationRelay supports playing pre-recorded audio files mid-conversation. This is useful for hold music, legal disclaimers, or branded audio intros:",
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
        "You started this workshop with a blank server and a Twilio phone number. You now have a production-capable voice AI agent. Whether you are building a customer service bot, an appointment scheduler, or something entirely new, you have the foundation to make it happen. Go build something great.",
    },
  ],
} satisfies StepDefinition;
