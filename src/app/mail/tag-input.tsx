import useThreads from "@/hooks/use-threads";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import Avatar from "react-avatar";
import Select from "react-select";
import { useLocalStorage } from "usehooks-ts";

type Props = {
  placeholder: string;
  label: string;

  onChange: (value: { label: string; value: string }[]) => void;
  value: { label: string; value: string }[];
};

const TagInput = ({ placeholder, label, onChange, value }: Props) => {
  const { accountId } = useThreads();
  const id = parseInt(accountId);

  const { data: suggestions } = api.account.getSuggestions.useQuery({
    accountId: id,
  });

  const [inputValue, setInputValue] = useState("");

  const options = suggestions?.map((s) => ({
    label: (
      <span className="flex items-center gap-2 dark:text-white">
        <Avatar size="25" name={s.address} textSizeRatio={2} round />
        {s.address}
      </span>
    ),
    value: s.address,
  }));

  return (
    <div className="flex items-center rounded-md border">
      <span className="ml-3 text-sm text-gray-500">{label}</span>
      <Select
        onInputChange={setInputValue}
        isMulti
        // @ts-ignore
        options={
          inputValue
            ? // @ts-ignore
              options?.concat({ label: inputValue, value: inputValue })
            : options
        }
        className="w-full flex-1"
        placeholder={placeholder}
        // @ts-ignore
        onChange={onChange}
        value={value}
        classNames={{
          control: () => {
            return "!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent";
          },
          multiValue: () => {
            return "dark:bg-gray-700";
          },
          multiValueLabel: () => {
            return "dark:text-white dark:bg-gray-700 rounded-md";
          },
          menuList: () => {
            return "dark:bg-gray-800";
          },
          option: () => {
            return "dark:bg-gray-800 hover:dark:bg-gray-500";
          },
        }}
      />
    </div>
  );
};

export default TagInput;
