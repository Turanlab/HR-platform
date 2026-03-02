# Deployment Guide

## Vercel Setup
1. Sign in to Vercel.
2. Create a new project and connect your GitHub repository.
3. Configure build and output settings as needed.
4. Deploy your project.

## Heroku Setup
1. Sign in to Heroku.
2. Click on 'New' and select 'Create new app'.
3. Name your app and choose a region.
4. Connect your GitHub repository under the 'Deploy' tab.
5. Enable automatic deploys, if desired, and deploy your app.

## MongoDB Atlas Setup
1. Create a MongoDB Atlas account.
2. Set up a new cluster and database.
3. Whitelist your IP address to allow access.
4. Obtain your connection string and replace `password` with your database password.
5. Use this connection string in your application configuration.