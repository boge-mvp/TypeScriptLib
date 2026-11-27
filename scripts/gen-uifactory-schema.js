"use strict";

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const ROOT_DIR = path.resolve(__dirname, "..");
const UIFACTORY_DIR = path.join(ROOT_DIR, "TSCore", "src", "com", "uifactory");
const SCHEMA_OUT = path.join(ROOT_DIR, "AIGuideKit", "uifactory-layout.schema.json");
const DEMO_LAYOUT_DIR = path.join(ROOT_DIR, "demo", "uifactory", "res", "layout");

// Collect all I*Config.ts files
const configFiles = fs
  .readdirSync(UIFACTORY_DIR)
  .filter((f) => /^I.*Config\.ts$/.test(f))
  .map((f) => path.join(UIFACTORY_DIR, f));

const program = ts.createProgram(configFiles, {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  strict: true,
  noEmit: true,
  skipLibCheck: true
});
const checker = program.getTypeChecker();

const interfaceMap = new Map();
const typeAliasMap = new Map();

for (const sf of program.getSourceFiles()) {
  if (!sf.fileName.replace(/\\/g, "/").includes("/TSCore/src/com/uifactory/")) continue;
  ts.forEachChild(sf, (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      interfaceMap.set(node.name.text, node);
    } else if (ts.isTypeAliasDeclaration(node)) {
      typeAliasMap.set(node.name.text, node);
    }
  });
}

function getJsDocComment(node) {
  const docs = ts.getJSDocCommentsAndTags(node);
  const parts = [];
  for (const d of docs) {
    if (ts.isJSDoc(d) && d.comment) {
      const text = typeof d.comment === "string"
        ? d.comment
        : d.comment.map((c) => c.text || "").join("");
      if (text.trim()) parts.push(text.trim());
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function typeNodeToSchema(typeNode, depth = 0) {
  if (!typeNode || depth > 12) return {};

  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return { type: "string" };
    case ts.SyntaxKind.NumberKeyword:
      return { type: "number" };
    case ts.SyntaxKind.BooleanKeyword:
      return { type: "boolean" };
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.UnknownKeyword:
      return {};
    case ts.SyntaxKind.NullKeyword:
      return { type: "null" };
    case ts.SyntaxKind.UndefinedKeyword:
    case ts.SyntaxKind.VoidKeyword:
      return {};
  }

  if (ts.isLiteralTypeNode(typeNode)) {
    const lit = typeNode.literal;
    if (ts.isStringLiteral(lit)) return { type: "string", const: lit.text };
    if (ts.isNumericLiteral(lit)) return { type: "number", const: Number(lit.text) };
    if (lit.kind === ts.SyntaxKind.TrueKeyword) return { type: "boolean", const: true };
    if (lit.kind === ts.SyntaxKind.FalseKeyword) return { type: "boolean", const: false };
    if (lit.kind === ts.SyntaxKind.NullKeyword) return { type: "null" };
    if (ts.isPrefixUnaryExpression(lit) && ts.isNumericLiteral(lit.operand)) {
      const val = Number(lit.operand.text);
      return { type: "number", const: lit.operator === ts.SyntaxKind.MinusToken ? -val : val };
    }
  }

  if (ts.isParenthesizedTypeNode(typeNode)) {
    return typeNodeToSchema(typeNode.type, depth + 1);
  }

  if (ts.isArrayTypeNode(typeNode)) {
    return {
      type: "array",
      items: typeNodeToSchema(typeNode.elementType, depth + 1)
    };
  }

  if (ts.isTupleTypeNode(typeNode)) {
    return {
      type: "array",
      items: typeNode.elements.map((e) => typeNodeToSchema(e, depth + 1)),
      minItems: typeNode.elements.length,
      maxItems: typeNode.elements.length
    };
  }

  if (ts.isUnionTypeNode(typeNode)) {
    const branches = typeNode.types
      .filter((t) => t.kind !== ts.SyntaxKind.UndefinedKeyword)
      .map((t) => typeNodeToSchema(t, depth + 1))
      .filter((s) => Object.keys(s).length > 0);

    // Filter out runtime FGUI object references like fgui.Controller
    const jsonBranches = branches.filter((b) => !b.$ignoreRuntime);
    if (jsonBranches.length === 0) return {};
    if (jsonBranches.length === 1) return jsonBranches[0];

    // Collapse pure string/number const enums
    if (jsonBranches.every((b) => b.type === "string" && b.const !== undefined)) {
      return { type: "string", enum: jsonBranches.map((b) => b.const) };
    }
    if (jsonBranches.every((b) => b.type === "number" && b.const !== undefined)) {
      return { type: "number", enum: jsonBranches.map((b) => b.const) };
    }

    return { anyOf: jsonBranches };
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    const name = typeNode.typeName.getText();
    if (name === "Array" && typeNode.typeArguments && typeNode.typeArguments.length === 1) {
      return {
        type: "array",
        items: typeNodeToSchema(typeNode.typeArguments[0], depth + 1)
      };
    }
    if (name === "Record" && typeNode.typeArguments && typeNode.typeArguments.length === 2) {
      return {
        type: "object",
        additionalProperties: typeNodeToSchema(typeNode.typeArguments[1], depth + 1)
      };
    }
    if (name.startsWith("fgui.") || name.startsWith("Laya.")) {
      return { $ignoreRuntime: true };
    }
    if (interfaceMap.has(name) || typeAliasMap.has(name)) {
      return { $ref: `#/$defs/${name}` };
    }
    return {};
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    return membersToObjectSchema(typeNode.members, depth + 1);
  }

  if (ts.isIntersectionTypeNode(typeNode)) {
    const mergedProps = {};
    const mergedReq = new Set();
    let mergedDesc = "";
    const unresolvedRefs = [];

    for (const part of typeNode.types) {
      const partSchema = typeNodeToSchema(part, depth + 1);
      if (partSchema.$ref) {
        unresolvedRefs.push(partSchema);
      } else if (partSchema.type === "object" && partSchema.properties) {
        Object.assign(mergedProps, partSchema.properties);
        if (Array.isArray(partSchema.required)) {
          partSchema.required.forEach((r) => mergedReq.add(r));
        }
      } else if (partSchema.allOf) {
        partSchema.allOf.forEach((sub) => unresolvedRefs.push(sub));
      }
      if (partSchema.description && !mergedDesc) {
        mergedDesc = partSchema.description;
      }
    }

    if (unresolvedRefs.length > 0 && Object.keys(mergedProps).length > 0) {
      const literalObj = { type: "object", properties: mergedProps };
      if (mergedReq.size > 0) literalObj.required = Array.from(mergedReq);
      return { allOf: [...unresolvedRefs, literalObj] };
    }
    if (unresolvedRefs.length > 0) {
      return unresolvedRefs.length === 1 ? unresolvedRefs[0] : { allOf: unresolvedRefs };
    }
    const obj = { type: "object", properties: mergedProps };
    if (mergedReq.size > 0) obj.required = Array.from(mergedReq);
    if (mergedDesc) obj.description = mergedDesc;
    return obj;
  }

  return {};
}

function membersToObjectSchema(members, depth = 0) {
  const properties = {};
  const required = [];
  let additionalProperties;

  for (const m of members) {
    if (ts.isIndexSignatureDeclaration(m)) {
      additionalProperties = typeNodeToSchema(m.type, depth + 1);
      continue;
    }
    if (!ts.isPropertySignature(m) || !m.name) continue;
    const propName = ts.isIdentifier(m.name) ? m.name.text : m.name.getText().replace(/['"]/g, "");
    const propSchema = typeNodeToSchema(m.type, depth + 1);
    if (propSchema.$ignoreRuntime) continue;

    const doc = getJsDocComment(m);
    if (doc) propSchema.description = doc;

    properties[propName] = propSchema;
    if (!m.questionToken) {
      required.push(propName);
    }
  }

  const obj = { type: "object", properties };
  if (required.length > 0) obj.required = required;
  if (additionalProperties !== undefined) obj.additionalProperties = additionalProperties;
  return obj;
}

function collectAllMembers(iface, visited = new Set()) {
  if (!iface || visited.has(iface.name.text)) return [];
  visited.add(iface.name.text);

  let members = [];
  if (iface.heritageClauses) {
    for (const hc of iface.heritageClauses) {
      if (hc.token === ts.SyntaxKind.ExtendsKeyword) {
        for (const t of hc.types) {
          const baseName = t.expression.getText();
          const baseIface = interfaceMap.get(baseName);
          if (baseIface) {
            members = members.concat(collectAllMembers(baseIface, visited));
          }
        }
      }
    }
  }
  members = members.concat(iface.members);
  return members;
}

// Build $defs
const defs = {};

for (const [name, aliasNode] of typeAliasMap.entries()) {
  const s = typeNodeToSchema(aliasNode.type, 0);
  const doc = getJsDocComment(aliasNode);
  if (doc) s.description = doc;
  defs[name] = s;
}

for (const [name, iface] of interfaceMap.entries()) {
  // Flatten inherited members for clean IDE autocomplete and validation
  const allMembers = collectAllMembers(iface);
  const obj = membersToObjectSchema(allMembers, 0);
  const doc = getJsDocComment(iface);
  if (doc) obj.description = doc;
  defs[name] = obj;
}

// Clean any temporary $ignoreRuntime markers recursively
function stripInternalFlags(obj) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach(stripInternalFlags);
    return;
  }
  delete obj.$ignoreRuntime;
  for (const k of Object.keys(obj)) {
    stripInternalFlags(obj[k]);
  }
}
stripInternalFlags(defs);

const rootSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://boge-mvp.github.io/TypeScriptLib/uifactory-layout.schema.json",
  title: "UIFactory Layout & Element Configuration Schema",
  description: "Auto-generated from TSCore/src/com/uifactory/I*Config.ts. Do not edit manually; run `node scripts/gen-uifactory-schema.js`.",
  $ref: "#/$defs/IElementConfig",
  $defs: defs
};

fs.writeFileSync(SCHEMA_OUT, JSON.stringify(rootSchema, null, 2) + "\n", "utf8");
console.log(`[PASS] Generated ${path.relative(ROOT_DIR, SCHEMA_OUT)} with ${Object.keys(defs).length} definitions.`);

// ============================================================================
// Built-in lightweight validator against demo/uifactory/res/layout/*.json
// ============================================================================
function resolveRef(schema, root) {
  if (!schema || !schema.$ref) return schema;
  const defName = schema.$ref.replace(/^#\/\$defs\//, "");
  return root.$defs[defName] || {};
}

function validateValue(val, schema, root, pathStr, errors) {
  if (!schema || Object.keys(schema).length === 0) return;
  if (schema.$ref) {
    validateValue(val, resolveRef(schema, root), root, pathStr, errors);
    return;
  }

  if (schema.allOf) {
    for (const part of schema.allOf) {
      validateValue(val, part, root, pathStr, errors);
    }
    return;
  }

  if (schema.anyOf) {
    const branchErrors = [];
    for (const branch of schema.anyOf) {
      const subErrs = [];
      validateValue(val, branch, root, pathStr, subErrs);
      if (subErrs.length === 0) return;
      branchErrors.push(subErrs);
    }
    // Report concise error from closest matching branch (e.g. matching `type` literal)
    const valType = val && typeof val === "object" && !Array.isArray(val) ? val.type : undefined;
    let bestErrs = branchErrors[0];
    if (valType !== undefined) {
      for (let i = 0; i < branchErrors.length; i++) {
        if (!branchErrors[i].some((e) => e.startsWith(`${pathStr}.type:`))) {
          bestErrs = branchErrors[i];
          break;
        }
      }
    }
    errors.push(...bestErrs);
    return;
  }

  if (schema.const !== undefined && val !== schema.const) {
    errors.push(`${pathStr}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(val)}`);
    return;
  }
  if (schema.enum !== undefined && !schema.enum.includes(val)) {
    errors.push(`${pathStr}: value ${JSON.stringify(val)} not in enum [${schema.enum.join(", ")}]`);
    return;
  }

  if (schema.type === "string" && typeof val !== "string") {
    errors.push(`${pathStr}: expected string, got ${typeof val}`);
  } else if (schema.type === "number" && typeof val !== "number") {
    errors.push(`${pathStr}: expected number, got ${typeof val}`);
  } else if (schema.type === "boolean" && typeof val !== "boolean") {
    errors.push(`${pathStr}: expected boolean, got ${typeof val}`);
  } else if (schema.type === "null" && val !== null) {
    errors.push(`${pathStr}: expected null, got ${typeof val}`);
  } else if (schema.type === "array") {
    if (!Array.isArray(val)) {
      errors.push(`${pathStr}: expected array, got ${typeof val}`);
      return;
    }
    if (Array.isArray(schema.items)) {
      for (let i = 0; i < Math.min(val.length, schema.items.length); i++) {
        validateValue(val[i], schema.items[i], root, `${pathStr}[${i}]`, errors);
      }
    } else if (schema.items) {
      for (let i = 0; i < val.length; i++) {
        validateValue(val[i], schema.items, root, `${pathStr}[${i}]`, errors);
      }
    }
  } else if (schema.type === "object") {
    if (!val || typeof val !== "object" || Array.isArray(val)) {
      errors.push(`${pathStr}: expected object, got ${Array.isArray(val) ? "array" : typeof val}`);
      return;
    }
    if (schema.required) {
      for (const req of schema.required) {
        if (val[req] === undefined) {
          errors.push(`${pathStr}: missing required property "${req}"`);
        }
      }
    }
    for (const k of Object.keys(val)) {
      if (schema.properties && schema.properties[k]) {
        validateValue(val[k], schema.properties[k], root, `${pathStr}.${k}`, errors);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        validateValue(val[k], schema.additionalProperties, root, `${pathStr}.${k}`, errors);
      }
    }
  }
}

const layoutFiles = fs.readdirSync(DEMO_LAYOUT_DIR).filter((f) => f.endsWith(".json"));
let failedCount = 0;
for (const file of layoutFiles) {
  const fullPath = path.join(DEMO_LAYOUT_DIR, file);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const errs = [];
  validateValue(data, rootSchema, rootSchema, file, errs);
  if (errs.length > 0) {
    failedCount++;
    console.error(`[FAIL] ${file}:\n  - ${errs.slice(0, 10).join("\n  - ")}`);
  }
}

if (failedCount > 0) {
  process.exitCode = 1;
} else {
  console.log(`[PASS] Validated all ${layoutFiles.length} layout JSON files in demo/uifactory/res/layout/ against schema (0 errors).`);
}
