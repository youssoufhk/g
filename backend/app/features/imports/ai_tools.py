"""AI-powered CSV column mapper.

Takes the headers from an uploaded CSV (with whatever the customer called
their columns) and maps them to our target schema using the configured
AIClient. The tool is intentionally deterministic about the target field
set: Ollama / Gemini only picks which source header matches which target,
it does not invent fields.

If the LLM is unavailable (Ollama offline, AI backend=mock) the tool
falls back to a fuzzy string match against known synonyms. The fallback
is good enough for the canonical seed CSVs and keeps the demo loop
running when Ollama is down.

See ``backend/app/ai/evals/column_mapper/`` for the 5 hand-curated eval
examples that gate this tool at merge time.
"""

from __future__ import annotations

import difflib
import json
import re
from dataclasses import dataclass

from app.ai.client import AIClient
from app.features.imports.schemas import ColumnMapping, EntityType
from app.features.imports.validators import target_fields


@dataclass
class ColumnMapperResult:
    mapping: list[ColumnMapping]
    ai_explanation: str | None


_SYNONYMS: dict[str, tuple[str, ...]] = {
    # employees
    "first_name": ("first", "given", "prenom", "firstname", "first name", "given name"),
    "last_name": ("last", "surname", "family", "nom", "lastname", "last name"),
    "email": ("email", "mail", "courriel", "e-mail"),
    "role": ("role", "title", "job", "poste", "function"),
    "team": ("team", "department", "equipe", "dept"),
    "hire_date": ("hire", "start", "joined", "embauche", "start date"),
    "manager_id": ("manager", "supervisor", "reports_to"),
    "base_currency": ("currency", "devise", "base currency"),
    # clients
    "name": ("name", "company", "client", "client name", "raison sociale"),
    "country_code": ("country", "pays", "iso country", "country code"),
    "currency": ("currency", "devise", "billing currency"),
    "primary_contact_name": ("contact", "primary contact", "contact name"),
    "primary_contact_email": ("contact email", "contact mail"),
    "size_band": ("size", "band", "tier", "client size"),
    # projects
    "client_id": ("client", "client_id", "client id", "account id"),
    "status": ("status", "state", "phase"),
    "budget_minor_units": ("budget", "value", "montant"),
    "start_date": ("start", "kickoff", "begin"),
    "end_date": ("end", "close", "finish"),
    "owner_employee_id": ("owner", "pm", "lead", "responsible"),
    # teams
    "lead_employee_id": ("lead", "head", "manager", "responsable"),
}


def _normalize(header: str) -> str:
    return re.sub(r"[^a-z0-9]", "", header.lower())


def _fuzzy_match(source_header: str, target_names: list[str]) -> ColumnMapping:
    norm_source = _normalize(source_header)

    # exact normalized match is high confidence
    for target in target_names:
        if _normalize(target) == norm_source:
            return ColumnMapping(
                source_header=source_header,
                target_field=target,
                confidence=0.95,
                reason="exact match on normalized name",
            )

    # synonym match
    best_target: str | None = None
    best_score = 0.0
    for target in target_names:
        for synonym in _SYNONYMS.get(target, ()):
            if _normalize(synonym) == norm_source and best_score < 0.85:
                best_target = target
                best_score = 0.85

    # difflib-style fuzzy fallback
    if best_target is None:
        candidates = difflib.get_close_matches(norm_source, target_names, n=1, cutoff=0.6)
        if candidates:
            best_target = candidates[0]
            best_score = 0.65

    if best_target is None:
        return ColumnMapping(
            source_header=source_header,
            target_field=None,
            confidence=0.0,
            reason="no match",
        )
    return ColumnMapping(
        source_header=source_header,
        target_field=best_target,
        confidence=best_score,
        reason="fuzzy match",
    )


async def map_columns(
    *,
    headers: list[str],
    entity_type: EntityType,
    ai_client: AIClient,
) -> ColumnMapperResult:
    """Map customer CSV headers to our target schema.

    Tries the LLM first; falls back to fuzzy matching when the LLM is
    unreachable or returns a response we cannot parse. Every mapping is
    returned with a confidence and a human-readable reason.
    """
    target_names = [f.name for f in target_fields(entity_type)]
    target_descriptions = {f.name: f.description for f in target_fields(entity_type)}

    try:
        ai_result = await _map_via_llm(
            ai_client=ai_client,
            headers=headers,
            target_names=target_names,
            target_descriptions=target_descriptions,
            entity_type=entity_type,
        )
        if ai_result is not None:
            return ai_result
    except Exception:
        # Any LLM failure falls through to the fuzzy matcher. The fuzzy
        # matcher is good enough for the canonical seed CSVs so the dev
        # loop stays unblocked when Ollama is down.
        pass

    return ColumnMapperResult(
        mapping=[_fuzzy_match(header, target_names) for header in headers],
        ai_explanation=None,
    )


async def _map_via_llm(
    *,
    ai_client: AIClient,
    headers: list[str],
    target_names: list[str],
    target_descriptions: dict[str, str],
    entity_type: EntityType,
) -> ColumnMapperResult | None:
    prompt = _build_prompt(
        headers=headers,
        target_names=target_names,
        target_descriptions=target_descriptions,
        entity_type=entity_type,
    )
    response = await ai_client.run_tool(
        prompt=prompt,
        tools=[],
        tenant_schema=None,
        budget_tokens=800,
    )
    parsed = _parse_llm_json(response.text)
    if parsed is None:
        return None

    mapping: list[ColumnMapping] = []
    for header in headers:
        entry = parsed.get(header, {}) if isinstance(parsed, dict) else {}
        target = entry.get("target_field") if isinstance(entry, dict) else None
        confidence = entry.get("confidence", 0.0) if isinstance(entry, dict) else 0.0
        reason = entry.get("reason") if isinstance(entry, dict) else None
        if target is not None and target not in target_names:
            target = None
            confidence = 0.0
            reason = f"llm suggested {entry.get('target_field')!r} which is not a target field"
        mapping.append(
            ColumnMapping(
                source_header=header,
                target_field=target,
                confidence=float(confidence),
                reason=reason or "llm suggested",
            )
        )
    return ColumnMapperResult(mapping=mapping, ai_explanation=None)


def _build_prompt(
    *,
    headers: list[str],
    target_names: list[str],
    target_descriptions: dict[str, str],
    entity_type: EntityType,
) -> str:
    target_lines = "\n".join(
        f"  - {name}: {target_descriptions[name]}" for name in target_names
    )
    headers_block = "\n".join(f"  - {h}" for h in headers)
    return f"""You are a CSV column mapping assistant. Map each source header to
one of the target fields for a {entity_type} import into the Gamma
consulting operations platform.

Target fields:
{target_lines}

Source headers from the customer CSV:
{headers_block}

Return a JSON object keyed by source header. Each value is an object
with three keys: target_field (one of the target names, or null if no
match), confidence (float 0.0 to 1.0), reason (one short sentence).
Do not include any target_field that is not in the list above. Do not
wrap the JSON in prose or backticks.

Example response format:
{{"First Name": {{"target_field": "first_name", "confidence": 0.95, "reason": "exact"}}}}
"""


def _parse_llm_json(text: str) -> dict[str, object] | None:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        newline = text.find("\n")
        if newline >= 0:
            text = text[newline + 1 :]
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return None
    if isinstance(parsed, dict):
        return parsed
    return None
