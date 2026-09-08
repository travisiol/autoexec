import { Hero } from "@/components/Hero";
import { TokenExplorer } from "@/components/TokenExplorer";
import { Processes } from "@/components/Processes";
import { Closer } from "@/components/Closer";
import { Toast } from "@/components/Toast";

export default function Home() {
  return (
    <>
      <Hero />
      <TokenExplorer />
      <Processes />
      <Closer />
      <Toast />
    </>
  );
}
