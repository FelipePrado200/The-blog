import { redirect } from "next/navigation";

/* /admin cai direto na lista de posts. */
export default function AdminIndex() {
  redirect("/admin/posts");
}
