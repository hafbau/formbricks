import { revalidateTag } from "next/cache";

interface RevalidateProps {
  id?: string;
  environmentId?: string;
  personId?: string;
  singleUseId?: string;
  formId?: string;
}

export const responseCache = {
  tag: {
    byId(responseId: string) {
      return `responses-${responseId}`;
    },
    byEnvironmentId(environmentId: string) {
      return `environments-${environmentId}-responses`;
    },
    byPersonId(personId: string) {
      return `people-${personId}-responses`;
    },
    bySingleUseId(formId: string, singleUseId: string) {
      return `forms-${formId}-singleUse-${singleUseId}-responses`;
    },
    byformId(formId: string) {
      return `forms-${formId}-responses`;
    },
  },
  revalidate({ environmentId, personId, id, singleUseId, formId }: RevalidateProps): void {
    if (id) {
      revalidateTag(this.tag.byId(id));
    }

    if (personId) {
      revalidateTag(this.tag.byPersonId(personId));
    }

    if (formId) {
      revalidateTag(this.tag.byformId(formId));
    }

    if (environmentId) {
      revalidateTag(this.tag.byEnvironmentId(environmentId));
    }

    if (formId && singleUseId) {
      revalidateTag(this.tag.bySingleUseId(formId, singleUseId));
    }
  },
};
