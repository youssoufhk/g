/**
 * Lock EN + FR message files in lock-step.
 *
 * Layer 2 of the critic loop rubric (opus_plan_v2.md §12.2): every
 * `useTranslations("foo")` namespace must resolve in both locales,
 * otherwise the French build shows raw keys to French-speaking
 * customers (the first-target buyer is an EU firm).
 *
 * This test walks both JSON trees in parallel and asserts that every
 * leaf key exists in both and that every branch has identical child
 * key sets. The values can (and should) differ - only structure is
 * locked here.
 */

import { describe, it, expect } from "vitest";
import enMessages from "../messages/en.json";
import frMessages from "../messages/fr.json";

type MessageTree = {
  [key: string]: string | MessageTree;
};

function collectKeyPaths(tree: MessageTree, prefix = ""): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      paths.push(path);
    } else if (value && typeof value === "object") {
      paths.push(...collectKeyPaths(value, path));
    }
  }
  return paths.sort();
}

function leafType(tree: MessageTree, path: string): "string" | "object" | "missing" {
  const parts = path.split(".");
  let node: string | MessageTree | undefined = tree;
  for (const part of parts) {
    if (typeof node === "string" || node === undefined) {
      return "missing";
    }
    node = node[part];
  }
  if (node === undefined) return "missing";
  if (typeof node === "string") return "string";
  return "object";
}

describe("i18n EN/FR parity", () => {
  it("has identical leaf-key paths in both locales", () => {
    const en = enMessages as unknown as MessageTree;
    const fr = frMessages as unknown as MessageTree;
    const enPaths = collectKeyPaths(en);
    const frPaths = collectKeyPaths(fr);

    const missingInFr = enPaths.filter((p) => !frPaths.includes(p));
    const missingInEn = frPaths.filter((p) => !enPaths.includes(p));

    expect(missingInFr, `keys present in en.json missing from fr.json`).toEqual([]);
    expect(missingInEn, `keys present in fr.json missing from en.json`).toEqual([]);
  });

  it("matches leaf types (string vs nested object) across locales", () => {
    const en = enMessages as unknown as MessageTree;
    const fr = frMessages as unknown as MessageTree;
    const allPaths = Array.from(
      new Set([...collectKeyPaths(en), ...collectKeyPaths(fr)]),
    ).sort();

    const mismatches: string[] = [];
    for (const path of allPaths) {
      if (leafType(en, path) !== leafType(fr, path)) {
        mismatches.push(
          `${path}: en=${leafType(en, path)}, fr=${leafType(fr, path)}`,
        );
      }
    }
    expect(mismatches, `leaf-type divergence between locales`).toEqual([]);
  });

  it("has no empty string values in either locale", () => {
    const check = (tree: MessageTree, label: string) => {
      const empties: string[] = [];
      const walk = (node: MessageTree, prefix: string) => {
        for (const [key, value] of Object.entries(node)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof value === "string") {
            if (value.trim() === "") empties.push(path);
          } else if (value && typeof value === "object") {
            walk(value, path);
          }
        }
      };
      walk(tree, "");
      expect(empties, `${label} has empty values`).toEqual([]);
    };
    check(enMessages as unknown as MessageTree, "en.json");
    check(frMessages as unknown as MessageTree, "fr.json");
  });
});
