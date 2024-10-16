"use client";

import React, { useEffect, useState } from "react";
import EmailEditor from "./email-editor";
import useThreads from "@/hooks/use-threads";
import { api, RouterOutputs } from "@/trpc/react";

const Component = ({
  replyDetails,
}: {
  replyDetails: RouterOutputs["account"]["getReplyDetails"];
}) => {
  const { threadId, accountId } = useThreads();

  const [subject, setSubject] = useState(
    replyDetails.subject.startsWith("Re:")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );

  const [toValues, setToValues] = useState(
    replyDetails.to.map((to) => ({ label: to.address, value: to.address })),
  );

  const [ccValues, setCcValues] = useState(
    replyDetails.cc.map((cc) => ({ label: cc.address, value: cc.address })),
  );

  useEffect(() => {
    if (!threadId || !replyDetails) return;
    if (!replyDetails.subject.startsWith("Re:")) {
      setSubject(`Re: ${replyDetails.subject}`);
    }

    setToValues(
      replyDetails.to.map((to) => ({ label: to.address, value: to.address })),
    );
    setCcValues(
      replyDetails.cc.map((cc) => ({ label: cc.address, value: cc.address })),
    );
  }, [threadId, replyDetails]);

  const handleSend = async (value: string) => {
    console.log("send", value);
  };

  return (
    <EmailEditor
      subject={subject}
      setSubject={setSubject}
      toValues={toValues}
      setToValues={setToValues}
      ccValues={ccValues}
      setCcValues={setCcValues}
      to={replyDetails.to.map((to) => to.address)}
      defaultToolbarExpanded={true}
      handleSend={handleSend}
      isSending={false}
    />
  );
};

const ReplyBox = () => {
  const { threadId, accountId } = useThreads();

  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    accountId: parseInt(accountId),
    threadId: threadId || "",
  });

  if (!replyDetails) return null;

  return <Component replyDetails={replyDetails} />;
};

export default ReplyBox;
