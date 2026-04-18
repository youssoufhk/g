# Column mapper eval examples

5 hand-curated examples used to measure the quality of
`app.features.imports.ai_tools.map_columns` at merge time.

Each example is a JSONL row with these fields:

```
{
  "name": "employees_french_headers",
  "prompt": "... built by ai_tools._build_prompt ...",
  "expected": {
    "Prenom":    {"target_field": "first_name",  "min_confidence": 0.8},
    "Nom":       {"target_field": "last_name",   "min_confidence": 0.8},
    "Email pro": {"target_field": "email",       "min_confidence": 0.8},
    "Poste":     {"target_field": "role",        "min_confidence": 0.6},
    "Equipe":    {"target_field": "team",        "min_confidence": 0.6}
  }
}
```

The harness at `app.ai.evals.harness.run_evals` iterates each example,
sends the prompt through the configured `AIClient`, parses the JSON
response, and compares each predicted mapping against the expected
target_field. A prediction passes if:

1. `target_field` matches (or both are null for unmapped columns)
2. `confidence` is at least the expected floor

The merge gate is 5/5 passing for Phase 3a onboarding to land.
