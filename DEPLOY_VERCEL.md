Vercel Deploy Guide

This workflow (/.github/workflows/vercel-deploy.yml) runs on push to main and deploys the repo to Vercel using the community action (amondnet/vercel-action).

Required GitHub repository secrets:
- VERCEL_TOKEN      : Your Vercel personal token (create at https://vercel.com/account/tokens)
- VERCEL_ORG_ID     : Your Vercel organization ID (available in the project settings or API)
- VERCEL_PROJECT_ID : Your Vercel project ID (from project settings or API)

Steps to set a custom domain (once deployed):
1. Deploy via GitHub Actions (push to main). After workflow completes, note the deployment URL (VERCEL_DEPLOYMENT_URL).
2. Add a domain on Vercel dashboard or via CLI:
   - Using Vercel CLI:
     - npm i -g vercel
     - vercel login
     - vercel domains add your-domain.com --team <team-slug>
     - vercel alias set <deployment-url> your-domain.com --team <team-slug>

3. Alternatively, set up the domain in Vercel dashboard (Domains -> Add) and follow the DNS instructions.

Security:
Do NOT commit VERCEL_TOKEN or other secrets into the repository. Add them via GitHub Settings -> Secrets -> Actions.
