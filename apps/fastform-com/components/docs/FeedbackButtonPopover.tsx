import { Button } from "@fastform/ui/Button";

declare global {
  interface Window {
    fastform: any;
  }
}

export const FeedbackButton: React.FC = () => {
  return <Button variant="secondary">Open Feedback</Button>;
};

export default FeedbackButton;
