#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { validateConfig } from '../lib/config.mjs';
export function workflow(config){
  validateConfig(config);if(!config.branch)throw Error('Set an exact reviewed candidate branch first');
  return `name: Candidate ${config.id.toUpperCase()} viewport evidence

on:
  push:
    branches: ['${config.branch}']
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: candidate-viewport-qa-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  viewport-evidence:
    if: github.ref_name == '${config.branch}'
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Test the isolated QA contract
        run: node --test candidate-viewport-qa/test/*.test.mjs
      - name: Check official Chrome and install Chinese fonts
        run: |
          google-chrome --version
          sudo apt-get update
          sudo apt-get install --yes fonts-noto-cjk
      - name: Build this candidate and capture both actual viewports
        run: node candidate-viewport-qa/ci.mjs --config candidate-viewport-qa/configs/${config.id}.json
      - name: Preserve all evidence, including failed readiness and fallback
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: candidate-${config.id}-viewport-\${{ github.sha }}
          path: .qa-artifacts/${config.id}/
          if-no-files-found: warn
          retention-days: 14
`;
}
if(process.argv[1]?.endsWith('/make-workflow.mjs')){
  const [configPath,outputPath]=process.argv.slice(2);if(!configPath||!outputPath)throw Error('Usage: node candidate-viewport-qa/workflow/make-workflow.mjs CONFIG OUTPUT');
  await writeFile(outputPath,workflow(JSON.parse(await readFile(configPath,'utf8'))));
}
