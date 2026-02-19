import { Users, FileText, CalendarDays, MessageSquare } from "lucide-react";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_PROCTOR_EXAMS,
  MOCK_STUDENTS,
} from "@/app/(protected)/proctor/_constants";
import { DashboardStat } from "@/app/(protected)/proctor/dashboard/_types";

export function useProctorDashboard() {
  const recentExams = MOCK_PROCTOR_EXAMS.slice(0, 3);
  const recentStudents = MOCK_STUDENTS.slice(0, 5);

  const stats: DashboardStat[] = [
    {
      label: "Total Students",
      value: MOCK_DASHBOARD_STATS.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/proctor/students",
    },
    {
      label: "Active Exams",
      value: MOCK_DASHBOARD_STATS.activeExams,
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/proctor/exams",
    },
    {
      label: "Exams Today",
      value: MOCK_DASHBOARD_STATS.examsToday,
      icon: CalendarDays,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/proctor/exams",
    },
    {
      label: "Unread Messages",
      value: MOCK_DASHBOARD_STATS.unreadMessages,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/proctor/messages",
    },
  ];

  return {
    stats,
    recentExams,
    recentStudents,
  };
}
