# MOOV OS Prototype - Codeup Flow to OSS Deployment

This guide describes how to publish the MOOV OS prototype from Alibaba Cloud Codeup to an OSS static website through Yunxiao Flow.

## Goal

When code is pushed to the `main` branch, Yunxiao Flow should:

1. Pull the latest source code from Codeup.
2. Install frontend dependencies.
3. Build the Vite production package.
4. Upload the generated `dist` files to Alibaba Cloud OSS.
5. Let reviewers open a fixed website URL to view the prototype.

## Project Build Settings

Repository:

```text
git@codeup.aliyun.com:68ee0421dec569489f6df295/MOOV/os.git
```

Branch:

```text
main
```

Build command:

```bash
pnpm install --frozen-lockfile
pnpm run build
```

Build output directory:

```text
dist
```

## Required OSS Information

Before creating the Flow deployment step, prepare the following information:

| Item | Example | Notes |
| --- | --- | --- |
| OSS Bucket | `moov-os-prototype` | The bucket used to host the static website. |
| OSS Region | `oss-cn-shanghai` | Must match the bucket region. |
| OSS Endpoint | `https://oss-cn-shanghai.aliyuncs.com` | Public OSS endpoint for the bucket region. |
| Upload Path | `/` or `/prototype/` | Use `/` if this bucket is dedicated to this prototype. |
| AccessKey ID | Stored in Flow variable | Use a RAM user, not the root account. |
| AccessKey Secret | Stored in Flow secret variable | Must be stored as a secret. |

## OSS Static Website Settings

In the OSS bucket, enable static website hosting:

| Setting | Value |
| --- | --- |
| Default homepage | `index.html` |
| Default 404 page | `index.html` |

Because this project is a single-page React/Vite application, setting the 404 page to `index.html` avoids refresh errors on frontend routes.

## Recommended Flow Stages

### Stage 1: Source

- Source type: Codeup
- Repository: `MOOV/os`
- Branch trigger: `main`

### Stage 2: Build

Use a Node.js build environment.

Commands:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run build
```

Artifact:

```text
dist/**
```

### Stage 3: Deploy to OSS

Recommended option: use the Yunxiao Flow OSS upload task if available.

Upload source:

```text
dist
```

Upload target:

```text
oss://<OSS_BUCKET>/<UPLOAD_PATH>
```

If using a script-based deployment step, configure `ossutil` with Flow variables:

```bash
ossutil config -e "$OSS_ENDPOINT" -i "$ALIYUN_ACCESS_KEY_ID" -k "$ALIYUN_ACCESS_KEY_SECRET"
ossutil cp -r -f dist/ "oss://$OSS_BUCKET/$OSS_PATH"
```

Flow variables to create:

```text
OSS_ENDPOINT
OSS_BUCKET
OSS_PATH
ALIYUN_ACCESS_KEY_ID
ALIYUN_ACCESS_KEY_SECRET
```

Mark `ALIYUN_ACCESS_KEY_SECRET` as secret.

## Review URL

After deployment, reviewers can access the prototype through one of these URLs:

| Type | Example |
| --- | --- |
| OSS website endpoint | `https://<bucket>.<region>.oss-website.aliyuncs.com` |
| Custom domain | `https://prototype.moov.example.com` |
| CDN domain | `https://<cdn-domain>` |

For a polished sharing experience, bind a custom domain or CDN domain after the OSS website works.

## Release Routine

1. Make changes locally.
2. Commit and push to `main`.
3. Yunxiao Flow builds and deploys automatically.
4. Share the OSS/CDN URL with reviewers.

## Notes

- Do not upload `node_modules`.
- Do not upload `.env` files or secret files.
- Only upload the contents generated under `dist`.
- If the site is deployed under a sub-path such as `/prototype/`, update Vite `base` before building.
