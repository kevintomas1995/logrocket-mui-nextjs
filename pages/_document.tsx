import * as React from "react";
import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../utils/createEmotionCache";
import { AppType } from 'next/dist/shared/lib/utils';
import { AppPropsWithEmotionCache } from './_app';

type DocumentPropsWithEmotionStyleTags = Document & {
  emotionStyleTags: any;
}

const MyDocument = (props: DocumentPropsWithEmotionStyleTags) => {
  return (
    <Html lang="en">
      <Head>
        {/* Inject MUI styles first to match with the prepend: true configuration. */}
        {props.emotionStyleTags}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const originalRenderPage = ctx.renderPage;

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App: AppType) =>
        function EnhanceApp(props: AppPropsWithEmotionCache) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);

  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
  };
};

export default MyDocument;
