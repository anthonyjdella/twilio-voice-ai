import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Tool Calling Concepts" },

    { type: "diagram", variant: "architecture", highlight: "tools" },

    {
      type: "prose",
      audience: "explorer",
      content:
        "So far, the agent can listen, think, and speak -- but it cannot **do** anything in the real world. Tool calling changes that. It lets the AI look things up, check databases, and take actions during a call, then use what it finds to give the caller a real answer.",
    },

    {
      type: "prose",
      audience: "builder",
      content:
        "So far, your agent can listen, think, and speak. But it cannot **do** anything in the real world. Tool calling changes that -- it lets the AI look things up, check databases, and take actions during a call, then use what it finds to give the caller a real answer.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What Are Tools?",
      content:
        "Tools let an AI agent take real-world actions during a call -- check a database, look up weather, process a payment. The agent decides when to use a tool based on what the caller asks.",
    },

    { type: "section", title: "How Tool Calling Works" },

    {
      type: "visual-step",
      audience: "explorer",
      steps: [
        {
          icon: "/images/icons/voice-wave.svg",
          title: "Caller speaks",
          description:
            'The caller says something like "What is the weather in Austin?"',
        },
        {
          icon: "/images/icons/robot.svg",
          title: "AI receives the question",
          description:
            "The AI gets the caller's words along with a list of tools it knows how to use.",
        },
        {
          icon: "/images/icons/wrench.svg",
          title: "AI picks a tool",
          description:
            'Instead of answering right away, the AI says "I need to look up the weather in Austin."',
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Tool runs and returns data",
          description:
            "The weather service (or database, or any other system) is called and the answer comes back.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "AI responds with real info",
          description:
            'The AI weaves the data into a natural reply: "It is currently 78 degrees and sunny in Austin."',
        },
      ],
    },

    {
      type: "visual-step",
      audience: "builder",
      steps: [
        {
          icon: "/images/icons/voice-wave.svg",
          title: "Caller speaks",
          description:
            'The caller says something like "What is the weather in Austin?"',
        },
        {
          icon: "/images/icons/pencil.svg",
          title: "Twilio transcribes",
          description:
            "Twilio transcribes the speech and sends it to your server as a prompt.",
        },
        {
          icon: "/images/icons/robot.svg",
          title: "AI receives the question",
          description:
            "Your server sends the caller's words to the AI, along with a list of tools it knows how to use.",
        },
        {
          icon: "/images/icons/wrench.svg",
          title: "AI picks a tool",
          description:
            'Instead of answering right away, the AI says "I need to look up the weather in Austin" and asks your server to do it.',
        },
        {
          icon: "/images/icons/code.svg",
          title: "Your server runs the tool",
          description:
            "Your server calls the weather service (or database, or any other system) and gets the answer.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Answer goes back to the AI",
          description:
            "Your server hands the tool's answer back to the AI so it can use the real data in its reply.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "AI responds with real info",
          description:
            'The AI weaves the data into a natural reply: "It is currently 78 degrees and sunny in Austin."',
        },
        {
          icon: "/images/icons/sound-wave.svg",
          title: "Speak to caller",
          description:
            "The text is sent to Twilio to be spoken to the caller.",
        },
      ],
    },

    {
      type: "callout",
      audience: "builder",
      variant: "info",
      content:
        "The key insight is that the AI never runs the tool itself. It asks your server to run it, and your server sends the answer back. You are always in control of what gets executed.",
    },

    {
      type: "callout",
      audience: "explorer",
      variant: "tip",
      content:
        "From the caller's perspective, this takes about two seconds. They ask a question, hear a brief pause (or a filler like \"Let me check that for you...\"), and then get an answer pulled from live data.",
    },

    { type: "section", title: "The Tool Calling Loop", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        'Sometimes the LLM needs multiple tool calls to answer a single question -- for example, "What is the weather in Austin and what is my order status?" requires two separate calls. The LLM can request multiple tools in one response. Your server executes each one, appends the results to the conversation, and sends the updated conversation back to OpenAI. This repeats until the response is plain text with no more tool calls, at which point you send the final text to Twilio.',
    },

    {
      type: "callout",
      audience: "builder",
      variant: "warning",
      content:
        "Always set a maximum iteration limit on the tool calling loop (3-5 iterations is sensible). A bug in your tool definitions could cause infinite loops where the LLM keeps requesting tools that never resolve.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why Not Call APIs Directly?",
      content:
        'You might wonder: why not just detect keywords and call APIs directly without involving the LLM? The answer is flexibility and natural language understanding. The LLM handles:\n\n**Ambiguity resolution** -- "Check my order" vs. "What is order 12345?" The LLM extracts the right parameters.\n\n**Multi-step reasoning** -- "Cancel my last order" requires first looking up the last order, then canceling it.\n\n**Natural responses** -- The LLM weaves tool results into natural conversation rather than reading raw data.',
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Tool calling vs. function calling",
      content:
        'You will see both terms used interchangeably. OpenAI originally called this feature "function calling" and later rebranded it to "tool calling" with a slightly updated API format. The concept is identical: the model outputs a structured request for your code to execute, and you return the result.\n\nThe modern OpenAI API uses `tools` (an array of tool definitions) and `tool_choice` (to control when tools are used). We will use the `tools` format throughout this workshop.',
    },
  ],
} satisfies StepDefinition;
