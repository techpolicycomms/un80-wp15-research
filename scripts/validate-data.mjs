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

const academicPath = join(root, "data/academic-literature/wp15-core-references.yaml");
if (readFileSync(academicPath, "utf8")) {
  const academicSchema = JSON.parse(
    readFileSync(join(root, "data/schemas/academic-literature.schema.json"), "utf8")
  );
  const validateAcademic = ajv.compile(academicSchema);
  const academicContent = yaml.parse(readFileSync(academicPath, "utf8"));
  if (!validateAcademic(academicContent)) {
    console.error("FAIL data/academic-literature/wp15-core-references.yaml:", validateAcademic.errors);
    failed = true;
  } else {
    console.log("OK   data/academic-literature/wp15-core-references.yaml");
  }
}

process.exit(failed ? 1 : 0);
