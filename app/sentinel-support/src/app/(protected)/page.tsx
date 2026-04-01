import { redirect } from "next/navigation";

export default function ProtectedRootPage() {
    redirect("/dashboard");
}
