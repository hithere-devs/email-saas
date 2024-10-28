import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Send, SparklesIcon } from "lucide-react";
import { useChat } from "ai/react";
import useThreads from "@/hooks/use-threads";
import PremiumBanner from "./premium-banner";

const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
  if (isCollapsed) return null;

  const { accountId } = useThreads();

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      accountId,
    },
    onError: (error) => {
      console.error("Error in Chat", error);
    },
    initialMessages: [],
  });

  return (
    <div className="max-w-[390px] p-2">
      <PremiumBanner />
      <div className="h-2"></div>
      <motion.div className="flex flex-1 flex-col items-end rounded-lg bg-gray-100 p-4 pb-4 shadow-inner dark:bg-gray-900">
        <div
          className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
          id="message-container"
        >
          <AnimatePresence mode="wait">
            {messages.map((message: any) => (
              <motion.div
                key={message.id}
                layout="position"
                className={cn(
                  "z-10 mt-2 max-w-[250px] break-words rounded-2xl bg-gray-200 dark:bg-gray-800",
                  {
                    "self-end text-gray-900 dark:text-gray-100":
                      message.role === "user",
                    "self-start bg-blue-500 text-white":
                      message.role === "assistant",
                  },
                )}
                layoutId={`container-[${messages.length - 1} ]`}
                transition={{
                  type: "easeOut",
                  duration: 0.2,
                }}
              >
                <div className="px-3 py-2 text-[13px] leading-[15px]">
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {messages.length > 0 && <div className="h-4" />}

        <div className="w-full">
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <SparklesIcon className="size-6 text-gray-600" />
                <div>
                  <p className="text-gray-900 dark:text-gray-100">
                    Ask AI anything about your emails
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get answers to your questions about your emails
                  </p>
                </div>
              </div>
              <div className="h-2"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                  onClick={() => {
                    handleInputChange({
                      // @ts-ignore
                      target: { value: "What can I ask AI?" },
                    });
                  }}
                >
                  What can I ask AI?
                </span>
                <span
                  className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                  onClick={() => {
                    handleInputChange({
                      // @ts-ignore
                      target: { value: "When is my next flight?" },
                    });
                  }}
                >
                  When is my next flight?
                </span>
                <span
                  className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
                  onClick={() => {
                    handleInputChange({
                      // @ts-ignore
                      target: { value: "When is my next meeting?" },
                    });
                  }}
                >
                  When is my next meeting?
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex w-full">
            <input
              type="text"
              placeholder="Ask AI..."
              className="relative h-9 flex-grow rounded-full border border-gray-200 bg-white px-3 py-1 text-[13px] outline-none placeholder:text-[13px] dark:bg-black"
              value={input}
              onChange={handleInputChange}
            />

            <motion.div
              key={messages.length}
              className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-gray-200 [word-break:break-word] dark:bg-gray-800"
              layout="position"
              layoutId={`container-[${messages.length}]`}
              transition={{
                type: "easeOut",
                duration: 0.2,
              }}
              initial={{ opacity: 0.6, zIndex: -1 }}
              animate={{ opacity: 0.6, zIndex: -1 }}
              exit={{ opacity: 1, zIndex: 1 }}
            >
              <div className="px-3 py-2 text-[13px] leading-[15px] text-gray-900 dark:text-gray-100">
                {input}
              </div>
            </motion.div>

            <button
              type="submit"
              className="ml-3 flex w-14 items-center justify-center rounded-full bg-gray-200 px-2 dark:bg-gray-800"
            >
              <Send className="size-4 text-gray-500 dark:text-gray-300" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAI;
