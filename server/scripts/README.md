# One-time DB index repair/migration scripts

## repair-indexes.js
Repairs legacy MongoDB indexes for:
- `clans` (name/tag unique indexes scoped to `status: 'active'`)
- `users` (unique username/regNo indexes scoped to string values)

### When to run
Run in production **once** after deploying, if you previously had legacy non-partial indexes.

### How to run
From repo root:

```bat
cd c:/Users/ayush/Downloads/GFG/Algorithm-Arena
cd server
node scripts/repair-indexes.js
```

### Notes
- This script can drop and recreate indexes.
- Do not run it repeatedly during peak traffic.

