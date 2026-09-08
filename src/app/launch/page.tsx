import type { Metadata } from "next";
import { BalloonHeading } from "@/components/BalloonHeading";
import { LaunchWizard } from "@/components/LaunchWizard";

export const metadata: Metadata = {
  title: "Launch a token",
  description:
    "Two steps: a wallet for the agent to act from, then the token it will run.",
};

export default function LaunchPage() {
  return (
    <div className="shell pt-8 md:pt-12">
      <BalloonHeading
        text="LAUNCH"
        label="Launch a token"
        maxWidth={420}
        height={110}
      />
      <p className="lede mx-auto mt-2 text-center">
        Two steps. A wallet for the agent to act from, then the token it will
        run.
      </p>
      <div className="mt-6">
        <LaunchWizard />
      </div>
    </div>
  );
}
