This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Database (postgres)

In order to update the prisma schema of the postgres database run 

```bash
npx prisma db pull
```

# Deploy

## Issues

The fly deploy command can fail and not be able to update the machines. My workaround is to destroy the machines and let the deploy command set them up anew:

```bash
flyctl machines list
```

Then delete the machines with the ID's

```bash
flyctl machine remove <id> --force
```


