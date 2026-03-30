import { Prose, SectionHeader } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { DeepDive } from "@/components/content/DeepDive";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";

export default function ToolCallingConcepts() {
  return (
    <>
      <SectionHeader>Tool Calling Concepts</SectionHeader>

      <ArchitectureDiagram highlight="tools" showTools />

      <Prose>
        So far, your agent can listen, think, and speak. But it cannot <strong>do</strong>{" "}
        anything in the real world. Tool calling changes that. It lets your LLM reach out
        to external systems -- check a database, query an API, process a payment -- and
        use the results to inform its response.
      </Prose>

      <SectionHeader>How Tool Calling Works</SectionHeader>

      <Prose>
        Tool calling is entirely an <strong>application-layer</strong> concern. Twilio
        and ConversationRelay know nothing about it. The flow happens between your
        server and the LLM:
      </Prose>

      <Prose>
        1. The caller says something like &quot;What is the weather in Austin?&quot;{"\n"}
        2. Twilio transcribes this and sends it to your server as a <code>prompt</code>.{"\n"}
        3. You forward the text to OpenAI along with your tool definitions.{"\n"}
        4. Instead of returning text, OpenAI returns a <strong>tool call</strong> request:
        &quot;Call <code>check_weather</code> with <code>{`{ city: "Austin" }`}</code>.&quot;{"\n"}
        5. Your server executes the function (e.g., calls a weather API).{"\n"}
        6. You send the result back to OpenAI as a <code>tool</code> message.{"\n"}
        7. OpenAI generates a natural language response: &quot;It is currently 78 degrees
        and sunny in Austin.&quot;{"\n"}
        8. You send that text to Twilio to be spoken to the caller.
      </Prose>

      <Callout type="info">
        The key insight is that the LLM never calls the tool directly. It requests
        that your code call the tool, and you feed the result back. You are always in
        control of what gets executed.
      </Callout>

      <SectionHeader>The Tool Calling Loop</SectionHeader>

      <Prose>
        Sometimes the LLM needs multiple tool calls to answer a question. For example,
        &quot;What is the weather in Austin and what is my order status?&quot; requires
        two separate tool calls. The LLM can request multiple tools in a single response,
        and you execute them all before sending results back.
      </Prose>

      <Prose>
        The loop looks like this:
      </Prose>

      <Prose>
        1. Send messages to OpenAI.{"\n"}
        2. If the response contains tool calls, execute each one.{"\n"}
        3. Append the tool results to the conversation.{"\n"}
        4. Send the updated conversation back to OpenAI.{"\n"}
        5. Repeat until the response is plain text (no more tool calls).{"\n"}
        6. Send the final text to Twilio.
      </Prose>

      <Callout type="warning">
        Always set a maximum iteration limit on the tool calling loop (3-5 iterations
        is sensible). A bug in your tool definitions could cause infinite loops where
        the LLM keeps requesting tools that never resolve.
      </Callout>

      <SectionHeader>Why Not Call APIs Directly?</SectionHeader>

      <Prose>
        You might wonder: why not just detect keywords and call APIs directly without
        involving the LLM? The answer is flexibility and natural language understanding.
        The LLM handles:
      </Prose>

      <Prose>
        <strong>Ambiguity resolution</strong> -- &quot;Check my order&quot; vs.
        &quot;What is order 12345?&quot; The LLM extracts the right parameters.{"\n"}
        <strong>Multi-step reasoning</strong> -- &quot;Cancel my last order&quot; requires
        first looking up the last order, then canceling it.{"\n"}
        <strong>Natural responses</strong> -- The LLM weaves tool results into natural
        conversation rather than reading raw data.
      </Prose>

      <DeepDive title="Tool calling vs. function calling">
        <p className="mb-2">
          You will see both terms used interchangeably. OpenAI originally called this
          feature &quot;function calling&quot; and later rebranded it to &quot;tool
          calling&quot; with a slightly updated API format. The concept is identical:
          the model outputs a structured request for your code to execute, and you
          return the result.
        </p>
        <p>
          The modern OpenAI API uses <code>tools</code> (an array of tool definitions)
          and <code>tool_choice</code> (to control when tools are used). We will use
          the <code>tools</code> format throughout this workshop.
        </p>
      </DeepDive>
    </>
  );
}
