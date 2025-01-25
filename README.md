This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Features

- Anonymously shorten a URL. 
- Alternatively, a user can enter their email with the URL to enable high-level click tracking:
  - Total clicks per User-Agent
  - Mobile vs Desktop clicks
  - Statistics can be obtained by visiting */dashboard* and entering the email you're interested in
  - Data is **public**! Anyone can access it.
- The hash encryption method results in over 280 trillion unique combinations
  - URLs are hashed using **SHA256** and encoded using **Base64Url**
  - Hashes are typically **8 digits** long (except for rare circumstances when an extra digit is applied).
  - URLs go through a **Fisher-Yates Shuffle** before being hashed.
  - A **recursive function** validates hash uniqueness


## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.