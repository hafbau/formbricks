import { revalidateTag } from "next/cache";

interface RevalidateProps {
  id?: string;
  attributeClassId?: string;
  actionClassId?: string;
  environmentId?: string;
}

export const formCache = {
  tag: {
    byId(id: string) {
      return `forms-${id}`;
    },
    byEnvironmentId(environmentId: string): string {
      return `environments-${environmentId}-forms`;
    },
    byAttributeClassId(attributeClassId: string) {
      return `attributeFilters-${attributeClassId}-forms`;
    },
    byActionClassId(actionClassId: string) {
      return `actionClasses-${actionClassId}-forms`;
    },
  },
  revalidate({ id, attributeClassId, actionClassId, environmentId }: RevalidateProps): void {
    if (id) {
      revalidateTag(this.tag.byId(id));
    }

    if (attributeClassId) {
      revalidateTag(this.tag.byAttributeClassId(attributeClassId));
    }

    if (actionClassId) {
      revalidateTag(this.tag.byActionClassId(actionClassId));
    }

    if (environmentId) {
      revalidateTag(this.tag.byEnvironmentId(environmentId));
    }
  },
};
