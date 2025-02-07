"use client";

import { timeSince } from "@fastform/lib/time";
import { TEnvironment } from "@fastform/types/environment";
import { TForm } from "@fastform/types/forms";
import { Button } from "@fastform/ui/Button";
import { DeleteDialog } from "@fastform/ui/DeleteDialog";
import AddIntegrationModal, {
  IntegrationModalInputs,
} from "@/app/(app)/environments/[environmentId]/integrations/airtable/components/AddIntegrationModal";
import { deleteIntegrationAction } from "@/app/(app)/environments/[environmentId]/integrations/actions";
import { useState } from "react";
import { toast } from "react-hot-toast";
import EmptySpaceFiller from "@fastform/ui/EmptySpaceFiller";
import { TIntegrationAirtable } from "@fastform/types/integration/airtable";
import { TIntegrationItem } from "@fastform/types/integration";
interface handleModalProps {
  airtableIntegration: TIntegrationAirtable;
  environment: TEnvironment;
  environmentId: string;
  setIsConnected: (data: boolean) => void;
  forms: TForm[];
  airtableArray: TIntegrationItem[];
}

const tableHeaders = ["Form", "Table Name", "Questions", "Updated At"];

export default function Home(props: handleModalProps) {
  const { airtableIntegration, environment, environmentId, setIsConnected, forms, airtableArray } = props;
  const [isDeleting, setisDeleting] = useState(false);
  const [isDeleteIntegrationModalOpen, setIsDeleteIntegrationModalOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState<(IntegrationModalInputs & { index: number }) | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const integrationData = airtableIntegration?.config?.data ?? [];

  const handleDeleteIntegration = async () => {
    try {
      setisDeleting(true);
      await deleteIntegrationAction(airtableIntegration.id);
      setIsConnected(false);
      toast.success("Integration removed successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setisDeleting(false);
      setIsDeleteIntegrationModalOpen(false);
    }
  };

  const handleModal = (val: boolean) => {
    setIsModalOpen(val);
  };

  const data = defaultValues
    ? { isEditMode: true as const, defaultData: defaultValues }
    : { isEditMode: false as const };
  return (
    <div className="mt-6 flex w-full flex-col items-center justify-center p-6">
      <div className="flex w-full justify-end gap-x-6">
        <div className=" flex items-center">
          <span className="mr-4 h-4 w-4 rounded-full bg-green-600"></span>
          <span
            className="cursor-pointer text-slate-500"
            onClick={() => {
              setIsDeleteIntegrationModalOpen(true);
            }}>
            Connected with {airtableIntegration.config.email}
          </span>
        </div>
        <Button
          onClick={() => {
            setDefaultValues(null);
            handleModal(true);
          }}
          variant="darkCTA">
          Link new table
        </Button>
      </div>

      {integrationData.length ? (
        <div className="mt-6 w-full rounded-lg border border-slate-200">
          <div className="grid h-12 grid-cols-8 content-center rounded-lg bg-slate-100 text-left text-sm font-semibold text-slate-900">
            {tableHeaders.map((header, idx) => (
              <div key={idx} className={`col-span-2 hidden text-center sm:block`}>
                {header}
              </div>
            ))}
          </div>

          {integrationData.map((data, index) => (
            <div
              key={index}
              className="m-2 grid h-16 grid-cols-8 content-center rounded-lg hover:bg-slate-100"
              onClick={() => {
                setDefaultValues({
                  base: data.baseId,
                  questions: data.questionIds,
                  form: data.formId,
                  table: data.tableId,
                  index,
                });
                setIsModalOpen(true);
              }}>
              <div className="col-span-2 text-center">{data.formName}</div>
              <div className="col-span-2 text-center">{data.tableName}</div>
              <div className="col-span-2 text-center">{data.questions}</div>
              <div className="col-span-2 text-center">{timeSince(data.createdAt.toString())}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 w-full">
          <EmptySpaceFiller
            type="table"
            environment={environment}
            noWidgetRequired={true}
            emptyMessage="Your airtable integrations will appear here as soon as you add them. ⏲️"
          />
        </div>
      )}

      <DeleteDialog
        open={isDeleteIntegrationModalOpen}
        setOpen={setIsDeleteIntegrationModalOpen}
        deleteWhat="airtable connection"
        onDelete={handleDeleteIntegration}
        text="Are you sure? Your integrations will break."
        isDeleting={isDeleting}
      />

      {isModalOpen && (
        <AddIntegrationModal
          airtableArray={airtableArray}
          open={isModalOpen}
          setOpenWithStates={handleModal}
          environmentId={environmentId}
          forms={forms}
          airtableIntegration={airtableIntegration}
          {...data}
        />
      )}
    </div>
  );
}
