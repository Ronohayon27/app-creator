"use client";

import { Fragment } from "@/generated/prisma";
import React, { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hint from "@/components/hint";
interface Props {
  data: Fragment;
}

const FragmentWeb = ({ data }: Props) => {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="Refresh" side="bottom">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCcwIcon />
          </Button>
        </Hint>
        <Hint text="Copy URL" side="bottom">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint text="Open in new tab" side="bottom" align="start">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (data.sandboxUrl) window.open(data.sandboxUrl, "_blank");
            }}
            disabled={!data.sandboxUrl}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        className="w-full h-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      ></iframe>
    </div>
  );
};

export default FragmentWeb;
