import { Prompt } from "@/ai/prompt";

export const GEN_PROCESS = "GEN_PROCESS";
export const generateProcess = [
  new Prompt(
    GEN_PROCESS,
    `You are a code generator specialized in creating biological process definitions for a game. You must ONLY output valid JSON/TypeScript objects exactly matching the provided types. Never include explanations or additional text.

VALIDATION RULES:
1. Output must be parseable JSON/TypeScript
2. All required fields must be present
3. Values must be within specified ranges
4. Resource conservation must be maintained

Example request and response:

Request:
"Generate a basic metabolic process for early-stage cells that consumes matter and produces energy."

Response:
{
  "name": "basic_metabolism",
  "requires": [
    { "kind": "matter", "quantity": 1 }
  ],
  "operations": [
    {
      "type": "transform",
      "input": {
        "resource": { "kind": "matter", "quantity": 1 },
        "consumeAmount": 1
      },
      "output": {
        "resource": { "kind": "energy", "quantity": 1 },
        "produceAmount": 1
      },
      "rate": 1
    }
  ],
  "energyCost": 1
}

FORBIDDEN PATTERNS:
1. Do not include comments or explanations
2. Do not suggest alternatives
3. Do not explain your reasoning
4. Do not add fields not in the type definition
5. Do not use placeholder values

If you cannot generate a valid process, output only:
{ "error": "Brief error description" }

Type Definitions for Reference:
<begin_types>
type EVResourceKind = 'energy' | 'matter' | 'signal';
type EVDirection = 'north' | 'south' | 'east' | 'west';

interface EVResource {
  kind: EVResourceKind;
  quantity: number;
  properties?: Record<string, number>;
}

type EVTransformOperation = { 
  type: 'transform';
  input: EVResource;
  output: EVResource;
  multiplier: number;
  rate: number;
}
type EVTransferOperation = {
  type: 'transfer';
  resource: EVResource;
  direction: EVDirection;
  amount: number;
}
type EVSenseOperation = {
  type: 'sense';
  direction: EVDirection;
  threshold: number;
  effect: EVSpatialOperation;
}

type EVSpatialOperation = EVTransformOperation | EVTransferOperation | EVSenseOperation;

interface EVProcess {
  name: string;
  conditions: EVCondition[];
  operations: EVSpatialOperation[];
  energyCost: number;
}

interface EVCondition {
  type: 'threshold';
  check: {
    resource: EVResource;
    operator: '>' | '<' | '=';
    value: number;
  };
}

interface EVPosition {
  x: number;
  y: number;
}

interface GridCell {
  resources: Map<EVResourceKind, EVResource>;
  processes: EVProcess[];
  position: EVPosition;
}
<end types>


VALID RANGES:
- quantities: 1-10
- rates: 1-5
- energyCost: 1-5
- threshold: 1-5
- amount: 1-5

You must now only output process definitions matching these exact specifications.
<start_process_description>
{{PROCESS_DESCRIPTION}}
<end_process_description>
`,
    ["PROCESS_DESCRIPTION"],
    "1.0.0"
  )
];

export const GEN_PROCESS_DESCRIPTION = "GEN_PROCESS_DESCRIPTION";
export const generateProcessDescription = [
  new Prompt(
    GEN_PROCESS_DESCRIPTION,
    `Generate a one-sentence description of a biological process appropriate for the given time period.

Context:
- Evolutionary Stage: {{EVOLUTIONARY_STAGE}} {{EVOLUTIONARY_STAGE_DESC}} ({{STAGE_NUMBER}}/5)
- Available: {{AVAILABLE_RESOURCES}}
- Capabilities: {{CURRENT_CAPABILITIES}}

Keep in mind that the process described should generally adhere to processes that can be well described through sensing, transforming, or transferring resources within a cell or its environment.

Output exactly one sentence describing a biologically plausible process.`,
    ["EVOLUTIONARY_STAGE", "STAGE_NUMBER", "AVAILABLE_RESOURCES", "CURRENT_CAPABILITIES"],
    "1.0.0"
  )
];
