import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "ReactiveGuard — Dashboard",
    description: "Real-time health factor monitoring and position rescue",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
