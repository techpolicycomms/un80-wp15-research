#!/usr/bin/env node
/**
 * Validates canonical JSON data files against schemas in data/schemas/.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import yaml from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const jsonValidations = [
  {
    data: "data/ict-spend-baseline.json",
    schema: "data/schemas/ict-spend-baseline.schema.json",
  },
];

const yamlValidations = [
  {
    data: "data/approved-source-feeds.yaml",
    schema: "data/schemas/approved-source-feeds.schema.json",
  },
  {
    data: "data/academic-literature/wp15-core-references.yaml",
    schema: "data/schemas/academic-literature.schema.json",
  },
  {
    data: "data/research-plan.yaml",
    schema: "data/schemas/research-plan.schema.json",
  },
];

let failed = false;

for (const { data, schema } of jsonValidations) {
  const schemaObj = JSON.parse(readFileSync(join(root, schema), "utf8"));
  const validate = ajv.compile(schemaObj);
  const dataObj = JSON.parse(readFileSync(join(root, data), "utf8"));
  if (!validate(dataObj)) {
    console.error(`FAIL ${data}:`, validate.errors);
    failed = true;
  } else {
    console.log(`OK   ${data}`);
  }
}

for (const { data, schema } of yamlValidations) {
  const schemaObj = JSON.parse(readFileSync(join(root, schema), "utf8"));
  const validate = ajv.compile(schemaObj);
  const content = yaml.parse(readFileSync(join(root, data), "utf8"));
  if (!validate(content)) {
    console.error(`FAIL ${data}:`, validate.errors);
    failed = true;
  } else {
    console.log(`OK   ${data}`);
  }
}

const secondaryDir = join(root, "data/secondary-sources");
const secondarySchema = JSON.parse(
  readFileSync(join(root, "data/schemas/secondary-source.schema.json"), "utf8")
);
const validateSecondary = ajv.compile(secondarySchema);

for (const file of readdirSync(secondaryDir).filter((f) => f.endsWith(".yaml"))) {
  const content = yaml.parse(readFileSync(join(secondaryDir, file), "utf8"));
  if (!validateSecondary(content)) {
    console.error(`FAIL data/secondary-sources/${file}:`, validateSecondary.errors);
    failed = true;
  } else {
    console.log(`OK   data/secondary-sources/${file}`);
  }
}

const socialDir = join(root, "data/social-monitor");
const socialSchema = JSON.parse(
  readFileSync(join(root, "data/schemas/social-monitor.schema.json"), "utf8")
);
const validateSocial = ajv.compile(socialSchema);

for (const file of readdirSync(socialDir).filter((f) => f.endsWith("-social.yaml"))) {
  const content = yaml.parse(readFileSync(join(socialDir, file), "utf8"));
  if (!validateSocial(content)) {
    console.error(`FAIL data/social-monitor/${file}:`, validateSocial.errors);
    failed = true;
  } else {
    console.log(`OK   data/social-monitor/${file}`);
  }
}

process.exit(failed ? 1 : 0);
