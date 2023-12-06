import DemoView from "@/components/dummyUI/DemoView";
import LayoutWaitlist from "@/pages/demo/LayoutLight";

export default function DemoPage() {
  return (
    <LayoutWaitlist
      title="Fastform Demo"
      description="Play around with our pre-defined 30+ templates and them to kick-start your form & experience management.">
      <DemoView />
    </LayoutWaitlist>
  );
}
