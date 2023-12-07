interface formNavBarNameProps {
  formName: string;
  productName: string;
}

export default function formNavBarName({ formName, productName }: formNavBarNameProps) {
  return (
    <div className="hidden items-center space-x-2 whitespace-nowrap md:flex">
      {/*       <Button
        variant="secondary"
        StartIcon={ArrowLeftIcon}
        onClick={() => {
          router.back();
        }}>
        Back
      </Button> */}
      <p className="pl-4 font-semibold">{productName} / </p>
      <span>{formName}</span>
    </div>
  );
}
