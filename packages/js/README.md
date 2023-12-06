# Fastform Browser JS Library

[![npm package](https://img.shields.io/npm/v/@fastform/js?style=flat-square)](https://www.npmjs.com/package/@fastform/js)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Please see [Fastform Docs](https://fastform.com/docs).
Specifically, [Quickstart/Implementation details](https://fastform.com/docs/getting-started/quickstart-in-app-form).

## What is Fastform

Fastform is your go-to solution for in-product micro-surveys that will supercharge your product experience! 🚀 For more information please check out [fastform.com](https://fastform.com).

## How to use this library

1. Install the Fastform package inside your project using npm:

```bash
npm install -s @fastform/js
```

2. Import Fastform and initialize the widget in your main component (e.g., App.tsx or App.js):

```javascript
import fastform from "@fastform/js";

if (typeof window !== "undefined") {
  fastform.init({
    environmentId: "your-environment-id",
    apiHost: "https://app.fastform.com",
  });
}
```

Replace your-environment-id with your actual environment ID. You can find your environment ID in the **Setup Checklist** in the Fastform settings.

For more detailed guides for different frameworks, check out our [Framework Guides](https://fastform.com/docs/getting-started/framework-guides).
