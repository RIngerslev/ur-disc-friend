# Trin 1: Brug et Node.js-baseret image til bygning
FROM node:alpine AS build

# Angiv arbejdsmappe i containeren
WORKDIR /app

# Install the version of pnpm designated by the `packageManager` field in `package.json` via the Corepack tool in Node.js.
RUN corepack enable pnpm

# Kopier package.json og pnpm-lock.yaml til arbejdsmappe
COPY package.json pnpm-lock.yaml ./

# Installer projektafhængigheder med PNPM
RUN pnpm install

# Kopier resten af projektet til arbejdsmappe
COPY . .

# Byg Next.js-projektet (produktionsbyg)
RUN pnpm run build

# Trin 2: Brug et letvægts Node.js-baseret image til at køre appen i produktionsmiljø
FROM node:alpine

# Install the version of pnpm designated by the `packageManager` field in `package.json` via the Corepack tool in Node.js.
RUN corepack enable pnpm

# Angiv arbejdsmappe i containeren
WORKDIR /app

# Kopier kun de nødvendige filer fra den første fase (build)
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .

# Installer kun produktion afhængigheder med PNPM
RUN pnpm install --prod

# Angiv porten, som appen skal køre på
EXPOSE 3000

# Kør kommandoen for at starte Next.js-appen
CMD ["pnpm", "start"]

