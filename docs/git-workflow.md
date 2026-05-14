# Git Workflow (Team Standard)

## Repo rules

- No direct commits to `main`
- Prefer no direct commits to `dev` (use PRs)
- Feature branches merge into `dev`
- Release merges `dev` → `main`
- Do not commit:
  - `.env`
  - `node_modules/`
  - `dist/`, `build/`
  - Python `venv/`, `__pycache__/`
  - uploads/logs if they contain sensitive data

## Daily workflow (developer)

```bash
git checkout dev
git pull origin dev

git checkout -b feature/<short-description>
```

Work, then:

```bash
git add .
git commit -m "scope: clear change message"
git push -u origin HEAD
```

Open a Pull Request into `dev`.

## Commit message convention (simple)

Use:
- `devops: ...`
- `db: ...`
- `api: ...`
- `auth: ...`
- `frontend: ...`
- `crm: ...`
- `ai: ...`
- `docs: ...`

Examples:
- `api: mount payments routes`
- `frontend: standardize apiClient response handling`
- `db: add seed script and roles`
- `docs: add team setup and migration guide`

## PR checklist (minimum)

- Branch is up to date with `dev`
- Lint/build pass for changed services
- No secrets committed
- Migration SQL reviewed (if applicable)
- Docs updated if behavior/contract changed

