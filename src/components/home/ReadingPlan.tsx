import { getReadingPlan, todayIndex } from "@/lib/content";
import { ReadingPlanView } from "@/components/home/ReadingPlanView";

export function ReadingPlan() {
  const plan = getReadingPlan();
  return <ReadingPlanView plan={plan} initialIndex={todayIndex(plan.length)} />;
}
