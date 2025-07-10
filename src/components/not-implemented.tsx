"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
}

const NotImplemented = ({ title }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md text-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-yellow-500" />
          <h1 className="text-xl font-semibold">{title} Page</h1>
          <p className="text-sm text-muted-foreground">
            This page hasn&apos;t been implemented yet. Please check back later
            or go back to the dashboard.
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotImplemented;
