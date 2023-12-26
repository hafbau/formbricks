export default function FastformBranding() {
  return (
    <a
      href="https://fastform.com?utm_source=form_branding"
      target="_blank"
      tabIndex={-1}
      className="mb-5 mt-2 flex justify-center">
      <p className="text-signature text-xs">
        Powered by{" "}
        <b>
          <span className="text-info-text hover:text-heading">Fastform</span>
        </b>
      </p>
    </a>
  );
}
