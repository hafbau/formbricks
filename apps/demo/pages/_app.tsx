import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Demo App</title>
      </Head>
      {(!process.env.NEXT_PUBLIC_FASTFORM_ENVIRONMENT_ID ||
        !process.env.NEXT_PUBLIC_FASTFORM_API_HOST) && (
          <div className="w-full bg-red-500 p-3 text-center text-sm text-white">
            Please set Fastform environment variables in apps/demo/.env
          </div>
        )}
      <Component {...pageProps} />
    </>
  );
}
