import HowToSendCard from "./HowToSendCard";
import RecontactOptionsCard from "./RecontactOptionsCard";
import ResponseOptionsCard from "./ResponseOptionsCard";
import WhenToSendCard from "./WhenToSendCard";
import WhoToSendCard from "./WhoToSendCard";
import StylingCard from "./StylingCard";
import { Tform } from "@fastform/types/forms";
import { TEnvironment } from "@fastform/types/environment";
import { TActionClass } from "@fastform/types/actionClasses";
import { TAttributeClass } from "@fastform/types/attributeClasses";
import { TMembershipRole } from "@fastform/types/memberships";

interface SettingsViewProps {
  environment: TEnvironment;
  localform: Tform;
  setLocalform: (form: Tform) => void;
  actionClasses: TActionClass[];
  attributeClasses: TAttributeClass[];
  responseCount: number;
  membershipRole?: TMembershipRole;
  colours: string[];
}

export default function SettingsView({
  environment,
  localform,
  setLocalform,
  actionClasses,
  attributeClasses,
  responseCount,
  membershipRole,
  colours,
}: SettingsViewProps) {
  return (
    <div className="mt-12 space-y-3 p-5">
      <HowToSendCard localform={localform} setLocalform={setLocalform} environment={environment} />

      <WhoToSendCard
        localform={localform}
        setLocalform={setLocalform}
        environmentId={environment.id}
        attributeClasses={attributeClasses}
      />

      <WhenToSendCard
        localform={localform}
        setLocalform={setLocalform}
        environmentId={environment.id}
        actionClasses={actionClasses}
        membershipRole={membershipRole}
      />

      <ResponseOptionsCard
        localform={localform}
        setLocalform={setLocalform}
        responseCount={responseCount}
      />

      <RecontactOptionsCard
        localform={localform}
        setLocalform={setLocalform}
        environmentId={environment.id}
      />

      <StylingCard localform={localform} setLocalform={setLocalform} colours={colours} />
    </div>
  );
}
