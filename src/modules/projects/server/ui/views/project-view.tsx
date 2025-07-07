"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import MessageContainer from "../components/message-container";
import { Suspense } from "react";
interface Props {
  projectId: string;
}

const ProjectView = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0 overflow-y-scroll"
        >
          <Suspense fallback={<div>Loading messages...</div>}>
            <MessageContainer projectId={projectId} />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle={false} />

        <ResizablePanel defaultSize={65} minSize={50}>
          {JSON.stringify(project, null, 2)}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectView;
