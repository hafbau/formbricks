import Faq from "@/components/home/Faq";
import Features from "@/components/home/Features";
import GitHubSponsorship from "@/components/home/GitHubSponsorship";
import Hero from "@/components/home/Hero";
import Highlights from "@/components/home/Highlights";
import ScrollToTopButton from "@/components/home/ScrollToTop";
import Steps from "@/components/home/Steps";
import BestPractices from "@/components/shared/BestPractices";
import BreakerCTA from "@/components/shared/BreakerCTA";
import Layout from "@/components/shared/Layout";

const IndexPage = () => (
  <Layout
    title="Fastform | Privacy-first Experience Management"
    description="Build qualitative user research into your product. Leverage Best practices to increase Product-Market Fit.">
    <Hero />
    {/*     <div className="hidden lg:block">
      <GitHubSponsorship />
    </div> */}
    <BestPractices />
    <Features />
    <Highlights />
    <ScrollToTopButton />
    <div className="block lg:hidden">
      <GitHubSponsorship />
    </div>
    <div className="hidden lg:block">
      <BreakerCTA
        teaser="READY?"
        headline="Create forms in minutes."
        subheadline="Don’t take our word for it, try it yourself."
        cta="Create form"
        href="https://app.fastform.com/auth/signup"
      />
    </div>
    <div className="pb-16">&nbsp;</div>
    <Steps />

    <BreakerCTA
      teaser="Curious?"
      headline="Give it a squeeze 🍋"
      subheadline="All 'Pro' features are free on Fastform. Give it a go!"
      cta="Start for free"
      href="https://app.fastform.com/auth/signup"
      inverted
    />

    <Faq />
  </Layout>
);

export default IndexPage;
