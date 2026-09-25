# Static files are platform-independent. Build on the CI host (amd64) so npm
# does not run under QEMU, then copy into a multi-arch nginx image.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/tokens/package.json packages/tokens/
COPY packages/charts/package.json packages/charts/
COPY packages/editor/package.json packages/editor/
COPY packages/react/package.json packages/react/
COPY apps/website/package.json apps/website/

RUN npm ci

COPY scripts scripts
COPY packages/tokens packages/tokens
COPY packages/charts packages/charts
COPY packages/editor packages/editor
COPY packages/react packages/react
COPY apps/website apps/website

RUN npm run build

FROM nginx:alpine
COPY apps/website/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/website/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
