import DemoPreview from "@/components/dummyUI/DemoPreview";
import BestPracticeNavigation from "@/components/shared/BestPracticeNavigation";
import Layout from "@/components/shared/Layout";
import UseCaseHeader from "@/components/shared/UseCaseHeader";

export default function OnboardingSegmentationPage() {
  return (
    <Layout
      title="Onboarding Segmentation with Fastform"
      description="Add a form to your onboarding to loop in Fastform right from the start.">
      <div className="grid grid-cols-1 items-center md:grid-cols-2 md:gap-12 md:py-20">
        <div className="p-6 md:p-0">
          <UseCaseHeader title="Onboarding Segments" difficulty="Advanced" setupMinutes="90" />
          <h3 className="text-md mb-1.5 mt-6 font-semibold text-slate-800 dark:text-slate-200">
            Why is it useful?
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            In your Onboarding you likely want to ask two or three questions to be able to segment your users
            best. These attributes can be used to create cohorts and form users down the line. You can
            identify who uses your product most and use Fastform to gather relevant qualitative data on scale.
          </p>
          <h3 className="text-md mb-1.5 mt-6 font-semibold text-slate-800 dark:text-slate-200">
            How to get started:
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Onboardings are unique to every product. Fastform does not help you build the right onboarding.
            Currently, you can use the Fastform API to send form data to Fastform for later usage. Down the
            line, we might offer a simple way to add form formons to your Onboarding.
          </p>
          form
        </div>

        <DemoPreview template="Onboarding Segmentation" />
      </div>
      <h2 className="mb-6 ml-4 mt-12 text-2xl font-semibold text-slate-700 dark:text-slate-400 md:mt-0">
        Other Best Practices
      </h2>
      <BestPracticeNavigation />
    </Layout>
  );
}
