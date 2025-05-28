Note: This repository is organized as a Monorepo and requires management of projects and their dependencies through Pnpm Workspace, based on Pnpm v8.

Before making code changes to this repository, please first master the following prerequisite knowledge:
+ [Pnpm Workspace](https://pnpm.io/workspaces)
  + Used to manage project packages under Monorepo repositories
+ [Changeset](https://github.com/changesets/changesets)
  + Used for package version management and Changelog, no longer requiring manual intervention

## Update Package Code & Version

Step 1: Update the business code within the package.

Step 2: Execute changeset in the project root directory to create a description of your changes, which allows Changeset to automatically take over version management of each package and read/write Changelog updates:
```bash
pnpm changeset
```

Step 3: `git commit` local changes. Steps 2 and 3 can be executed multiple times locally, but it's best to follow a well-defined granularity.

Step 4: Continue executing `pnpm version`. In the REPL, only select the packages you have modified; unmodified packages don't need to be selected. Follow the Changeset prompts, and it will automatically help us bump the version numbers of target packages and related packages that reference the target package.

Step 5: `git commit` version number changes.

Step 6: `git push` the development branch to the remote repository and create an MR. After the MR is approved and merged into the main branch, the related pipeline will automatically execute. When it detects version changes created by changeset, it will automatically push to the npm registry and push tags back to the repository.

## Generate / Update Documentation

The documentation project is located in `app/docs`. Generating or updating documentation involves two steps:

```bash
# Build all packages to generate the latest *.d.ts declaration files
pnpm build

# Use *.d.ts declaration files to generate markdown documentation in app/docs
pnpm build:docs

# View effects locally
pnpm --filter docs dev
```
