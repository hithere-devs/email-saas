"use client";

import React, { useEffect, useState } from "react";
import EmailEditor from "./email-editor";
import useThreads from "@/hooks/use-threads";
import { api, RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";

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

  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = async (value: string) => {
    if (!replyDetails) return;
    const accId = parseInt(accountId);
    sendEmail.mutate(
      {
        accountId: accId,
        threadId: threadId || undefined,
        body: value,
        subject,
        from: replyDetails.from,
        to: toValues.map((to) => ({ address: to.value, name: to.value || "" })),
        cc: ccValues.map((cc) => ({ address: cc.value, name: cc.value || "" })),
        replyTo: replyDetails.from,
        inReplyTo: replyDetails.id,
      },
      {
        onSuccess: () => {
          toast.success("Email Sent!");
        },
        onError: (error) => {
          console.log(error);
          toast.error("Failed to send the email");
        },
      },
    );
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
      isSending={sendEmail.isPending}
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
