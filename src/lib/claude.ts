import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from "./constants";

// ─── Anthropic API Wrapper with Retry Logic (Section 2.1, 11.5) ─────────────

const client = new Anthropic();

interface ClaudeRequestOptions {
  system: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
}

interface ClaudeResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Claude with retry logic and token usage logging.
 * Returns the text response and token counts.
 */
export async function callClaude(options: ClaudeRequestOptions): Promise<ClaudeResponse> {
  const {
    system,
    userPrompt,
    model = CLAUDE_MODEL,
    maxTokens = CLAUDE_MAX_TOKENS,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      const text = textBlock?.type === "text" ? textBlock.text : "";

      const result: ClaudeResponse = {
        text,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model: response.model,
      };

      console.log(
        `[claude] model=${result.model} input=${result.inputTokens} output=${result.outputTokens}`
      );

      return result;
    } catch (error) {
      lastError = error as Error;
      const isRetryable =
        (error as { status?: number }).status === 429 ||
        (error as { status?: number }).status === 529 ||
        (error as { status?: number }).status === 500;

      if (!isRetryable || attempt === MAX_RETRIES) {
        break;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(
        `[claude] Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms — ${(error as Error).message}`
      );
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("Claude API call failed after retries");
}

/**
 * Call Claude and parse the response as JSON.
 * Strips markdown code fences if present.
 */
export async function callClaudeJSON<T>(options: ClaudeRequestOptions): Promise<T> {
  const response = await callClaude(options);
  let text = response.text.trim();

  // Strip markdown code fences
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(text) as T;
}
