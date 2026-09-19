import * as React from "react";

interface InlineSegmentsProps {
  text: string;
}

function InlineSegments({ text }: InlineSegmentsProps) {
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <React.Fragment>
      {segments.map((segment, index) => {
        if (segment.startsWith("**") && segment.endsWith("**")) {
          const inner = segment.slice(2, -2);
          return <strong key={index}>{inner}</strong>;
        }
        if (segment.startsWith("`") && segment.endsWith("`")) {
          const inner = segment.slice(1, -1);
          return (
            <code
              key={index}
              className="rounded bg-muted px-1 py-0.5 text-[0.9em]"
            >
              {inner}
            </code>
          );
        }
        return <React.Fragment key={index}>{segment}</React.Fragment>;
      })}
    </React.Fragment>
  );
}

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; ordered: boolean; lines: string[] };

function parseBlocks(text: string): Block[] {
  const rawLines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (line === "") {
      current = null;
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet !== null && bullet[1] !== undefined) {
      if (current === null || current.kind !== "list" || current.ordered) {
        current = { kind: "list", ordered: false, lines: [bullet[1]] };
        blocks.push(current);
      } else {
        current.lines.push(bullet[1]);
      }
      continue;
    }

    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered !== null && numbered[1] !== undefined) {
      if (current === null || current.kind !== "list" || !current.ordered) {
        current = { kind: "list", ordered: true, lines: [numbered[1]] };
        blocks.push(current);
      } else {
        current.lines.push(numbered[1]);
      }
      continue;
    }

    if (current === null || current.kind !== "paragraph") {
      current = { kind: "paragraph", lines: [line] };
      blocks.push(current);
    } else {
      current.lines.push(line);
    }
  }

  return blocks;
}

interface MarkdownProps {
  text: string;
}

export function Markdown({ text }: MarkdownProps) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.kind === "list") {
          if (block.ordered) {
            return (
              <ol key={index} className="list-decimal space-y-1 pl-5">
                {block.lines.map((line, lineIndex) => (
                  <li key={lineIndex}>
                    <InlineSegments text={line} />
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {block.lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  <InlineSegments text={line} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="leading-relaxed">
            {block.lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                <InlineSegments text={line} />
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
