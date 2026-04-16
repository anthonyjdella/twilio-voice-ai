import type { StepDefinition } from "@/lib/content-blocks";

export default {
  blocks: [
    { type: "section", title: "Tool Calling Concepts" },

    { type: "diagram", variant: "architecture", highlight: "tools" },

    {
      type: "prose",
      content:
        "So far, your agent can listen, think, and speak. But it cannot **do** anything in the real world. Tool calling changes that — it lets your LLM reach out to external systems and use the results to inform its response.",
    },

    {
      type: "concept-card",
      audience: "explorer",
      title: "What Are Tools?",
      content:
        "Tools let your AI agent take real-world actions during a call — check a database, look up weather, process a payment. The agent decides when to use a tool based on what the caller asks.",
    },

    { type: "section", title: "How Tool Calling Works" },

    {
      type: "visual-step",
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
          title: "Forward to LLM",
          description:
            "Your server sends the text to OpenAI along with your tool definitions.",
        },
        {
          icon: "/images/icons/wrench.svg",
          title: "LLM requests a tool call",
          description:
            'Instead of returning text, OpenAI returns a tool call request: call check_weather with { city: "Austin" }.',
        },
        {
          icon: "/images/icons/code.svg",
          title: "Server executes",
          description:
            "Your server runs the function — e.g., calls a weather API.",
        },
        {
          icon: "/images/icons/arrow-cycle.svg",
          title: "Return result to LLM",
          description:
            "You send the tool result back to OpenAI as a tool message.",
        },
        {
          icon: "/images/icons/chat-bubble.svg",
          title: "LLM generates response",
          description:
            'OpenAI generates a natural language response: "It is currently 78 degrees and sunny in Austin."',
        },
        {
          icon: "/images/icons/sound-wave.svg",
          title: "Speak to caller",
          description:
            "You send the text to Twilio to be spoken to the caller.",
        },
      ],
    },

    {
      type: "callout",
      variant: "info",
      content:
        "The key insight is that the LLM never calls the tool directly. It requests that your code call the tool, and you feed the result back. You are always in control of what gets executed.",
    },

    { type: "section", title: "The Tool Calling Loop", audience: "builder" },

    {
      type: "prose",
      audience: "builder",
      content:
        'Sometimes the LLM needs multiple tool calls to answer a single question — for example, "What is the weather in Austin and what is my order status?" requires two separate calls. The LLM can request multiple tools in one response. Your server executes each one, appends the results to the conversation, and sends the updated conversation back to OpenAI. This repeats until the response is plain text with no more tool calls, at which point you send the final text to Twilio.',
    },

    {
      type: "callout",
      variant: "warning",
      content:
        "Always set a maximum iteration limit on the tool calling loop (3-5 iterations is sensible). A bug in your tool definitions could cause infinite loops where the LLM keeps requesting tools that never resolve.",
    },

    {
      type: "deep-dive",
      audience: "builder",
      title: "Why Not Call APIs Directly?",
      content:
        'You might wonder: why not just detect keywords and call APIs directly without involving the LLM? The answer is flexibility and natural language understanding. The LLM handles:\n\n**Ambiguity resolution** — "Check my order" vs. "What is order 12345?" The LLM extracts the right parameters.\n\n**Multi-step reasoning** — "Cancel my last order" requires first looking up the last order, then canceling it.\n\n**Natural responses** — The LLM weaves tool results into natural conversation rather than reading raw data.',
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
