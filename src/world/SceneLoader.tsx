"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "@/ui/LoadingScreen";

const Scene = dynamic(() => import("./Scene").then((m) => m.Scene), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export function SceneLoader() {
  return <Scene />;
}
