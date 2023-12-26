import ResponseTimeline from "@/app/(app)/environments/[environmentId]/people/[personId]/components/ResponseTimeline";
import { authOptions } from "@fastform/lib/authOptions";
import { getResponsesByPersonId } from "@fastform/lib/response/service";
import { getforms } from "@fastform/lib/form/service";
import { TEnvironment } from "@fastform/types/environment";
import { TForm } from "@fastform/types/forms";
import { TTag } from "@fastform/types/tags";
import { getServerSession } from "next-auth";

export default async function ResponseSection({
  environment,
  personId,
  environmentTags,
}: {
  environment: TEnvironment;
  personId: string;
  environmentTags: TTag[];
}) {
  const responses = await getResponsesByPersonId(personId);
  const formIds = responses?.map((response) => response.formId) || [];
  const forms: TForm[] = formIds.length === 0 ? [] : (await getforms(environment.id)) ?? [];
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("No session found");
  }

  return (
    <>
      {responses && (
        <ResponseTimeline
          profile={session.user}
          forms={forms}
          responses={responses}
          environment={environment}
          environmentTags={environmentTags}
        />
      )}
    </>
  );
}
