# Development Rules

## Branching
- Do not push directly to main
- Work in feature branches
- Merge feature branches into dev only after testing

## Commit Message Style
- feat: new feature
- fix: bug fix
- chore: setup/config
- docs: documentation
- refactor: code cleanup
- test: testing work

## Coding Standards
- Keep routes, controllers, services, and models separate
- Use centralized error handling
- Validate request data
- Use environment variables
- Keep response format consistent

## Testing
- Test every endpoint in Postman before merge
- Test success, invalid input, unauthorized, and forbidden cases

## Environment
- Never push .env files
- Keep .env.example updated