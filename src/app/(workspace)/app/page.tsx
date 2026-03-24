import { redirect } from "next/navigation";

export default function WorkspaceIndexPage(): never {
  redirect("/app/dashboard");
}
