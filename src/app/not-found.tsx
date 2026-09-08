import Link from "next/link";
import { Window } from "@/components/Window";

export default function NotFound() {
  return (
    <div className="shell pt-16">
      <Window
        focused
        title="Error — the system cannot find the path specified"
        className="mx-auto max-w-[560px]"
      >
        <h1 className="display text-[26px]">Nothing is running here.</h1>
        <p className="lede mt-2">
          That address does not match a token in this build.
        </p>
        <Link href="/" className="btn btn-go mt-5">
          Back to the desktop
        </Link>
      </Window>
    </div>
  );
}
