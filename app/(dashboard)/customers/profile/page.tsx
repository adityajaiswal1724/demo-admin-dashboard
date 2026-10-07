import { Suspense } from "react";
import { CustomerProfile } from "@/components/customers/profile";
export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="gate">Opening customer profile…</div>}>
      <CustomerProfile />
    </Suspense>
  );
}
