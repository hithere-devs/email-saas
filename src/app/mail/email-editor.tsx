"use client";

import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Text } from "@tiptap/extension-text";
import EditorMenuBar from "./editor-menubar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TagInput from "./tag-input";
import AIComposeButton from "./ai-conpose-button";
import { generate } from "./action";
import { readStreamableValue } from "ai/rsc";

type Props = {
  subject: string;
  setSubject: (value: string) => void;

  toValues: { label: string; value: string }[];
  setToValues: (value: { label: string; value: string }[]) => void;

  ccValues: { label: string; value: string }[];
  setCcValues: (value: { label: string; value: string }[]) => void;

  to: string[];

  handleSend: (value: string) => void;
  isSending: boolean;

  defaultToolbarExpanded?: boolean;
};

const EmailEditor = ({
  subject,
  toValues,
  setSubject,
  setToValues,
  ccValues,
  setCcValues,
  to,
  handleSend,
  isSending,
  defaultToolbarExpanded = false,
}: Props) => {
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(defaultToolbarExpanded);
  const [token, setToken] = useState("");

  const aiGenerate = async (value: string) => {
    const { output } = await generate(value);
    for await (const token of readStreamableValue(output)) {
      if (token) {
        setToken(token);
      }
    }
  };

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          aiGenerate(this.editor.getText());
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  useEffect(() => {
    editor?.commands?.insertContent(token);
  }, [editor, token]);

  const onGenerate = (token: string) => {
    editor?.commands?.insertContent(token);
  };

  if (!editor) return null;

  return (
    <div>
      <div className="flex border-b p-4 py-2">
        <EditorMenuBar editor={editor} />
      </div>

      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              label="To"
              placeholder="Add recipients"
              onChange={setToValues}
              value={toValues}
            />
            <TagInput
              label="Cc"
              placeholder="Add recipients"
              onChange={setCcValues}
              value={ccValues}
            />
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="font-medium text-green-600">Darft </span>
            <span>to {to.join(", ")}</span>
          </div>
          <AIComposeButton
            isComposing={defaultToolbarExpanded}
            onGenerate={onGenerate}
          />
        </div>
      </div>

      <div className="prose w-full p-4">
        <EditorContent editor={editor} value={value} />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + J
          </kbd>{" "}
          for AI autocomplete
        </span>
        <Button
          onClick={async () => {
            editor?.commands?.clearContent();
            await handleSend(value);
          }}
          disabled={isSending}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
