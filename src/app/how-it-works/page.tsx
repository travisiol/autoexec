import { redirect } from "next/navigation";

/** Kept as an alias so older links do not 404. */
export default function HowItWorks() {
  redirect("/docs");
}
