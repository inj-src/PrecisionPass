import { AppLayout } from "@/components/layout/app-layout";

export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
