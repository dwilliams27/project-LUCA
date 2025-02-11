
// export const GEN_PROCESS = "GEN_PROCESS";
// export const generateProcess = [
//   new Prompt(
//     GEN_PROCESS,
//     `You are a code generator specialized in creating biological process definitions for a game. You must ONLY output valid JSON/TypeScript objects exactly matching the provided types. Never include explanations or additional text.

// <validation_rules>
// 1. Output must be parseable JSON/TypeScript
// 2. All required fields must be present
// 3. Values must be within specified ranges
// 4. Your result must satisfy all contstraints
// 5. Response should be the definition of an EVProcess object
// </validation_rules>

// <constraints>

// </constraints>

// <example>
// Request:
// "Generate a basic metabolic process for early-stage cells that consumes matter and produces energy."

// Response:
// {
//   "name": "basic_metabolism",
//   "requires": [
//     { "kind": "matter", "quantity": 1 }
//   ],
//   "operations": [
//     {
//       "type": "transform",
//       "input": {
//         "resource": { "kind": "matter", "quantity": 1 },
//         "consumeAmount": 1
//       },
//       "output": {
//         "resource": { "kind": "energy", "quantity": 1 },
//         "produceAmount": 1
//       },
//       "rate": 1
//     }
//   ],
//   "energyCost": 1
// }
// </example>

// <forbidden_patterns>
// 1. Do not include comments or explanations
// 2. Do not suggest alternatives
// 3. Do not explain your reasoning
// 4. Do not add fields not in the type definition
// 5. Do not use placeholder values
// </forbidden_patterns>

// <types>
// export interface Resource {
//     type: ResourceType;
//     quantity: number;
//     quality: ResourceQuality;
// }

// export interface Condition {
//     operator: ComparisonOperator;
//     value: number;
// }

// export interface Operation {
//     operationType: {
//         oneofKind: "transform";
//         transform: Operation_Transform;
//     } | {
//         oneofKind: "transfer";
//         transfer: Operation_Transfer;
//     } | {
//         oneofKind: "sense";
//         sense: Operation_Sense;
//     } | {
//         oneofKind: undefined;
//     };
//     input: number;
//     energyCost: number;
//     operationId: string;
// }

// export interface Operation_Transform {
//     input?: Resource;
//     output?: Resource;
//     rate: number;
// }

// export interface Operation_Transfer {
//     resource?: Resource;
//     direction: Direction;
//     amount: number;
// }

// export interface Operation_Sense {
//     direction: Direction;
//     forType: ResourceType;
//     forQuality: ResourceType;
//     condition?: Condition;
// }

// export interface Process {
//     processId: string;
//     name: string;
//     energyCost: number;
//     conditions: Condition[];
//     operations: Operation[];
// }

// export interface Position {
//     x: number;
//     y: number;
// }

// export interface ResourceList {
//     resources: Resource[];
// }

// export interface GridCell {
//     position?: Position;
//     resourceBuckets: {
//         [key: string]: ResourceList;
//     };
//     processes: Process[];
// }

// export enum ResourceType {
//     UNSPECIFIED = 0,
//     ENERGY = 1,
//     MATTER = 2,
//     INFORMATION = 3
// }

// export enum ResourceQuality {
//     UNSPECIFIED = 0,
//     LOW = 1,
//     MEDIUM = 2,
//     HIGH = 3
// }

// export enum Direction {
//     UNSPECIFIED = 0,
//     NORTH = 1,
//     EAST = 2,
//     SOUTH = 3,
//     WEST = 4
// }

// export enum ComparisonOperator {
//     UNSPECIFIED = 0,
//     EQUAL = 1,
//     GREATER_THAN = 2,
//     LESS_THAN = 3
// }
// </types>

// You must now only output process definitions matching these exact specifications.
// <process_description>
// {{PROCESS_DESCRIPTION}}
// </process_description>
// `,
//     ["PROCESS_DESCRIPTION"],
//     "1.0.0"
//   )
// ];

// export const GEN_PROCESS_DESCRIPTION = "GEN_PROCESS_DESCRIPTION";
// export const generateProcessDescription = [
//   new Prompt(
//     GEN_PROCESS_DESCRIPTION,
//     `Generate a one-sentence description of a biological process appropriate for the given time period.

// Context:
// - Evolutionary Stage: {{EVOLUTIONARY_STAGE}} {{EVOLUTIONARY_STAGE_DESC}} ({{STAGE_NUMBER}}/5)
// - Available: {{AVAILABLE_RESOURCES}}
// - Capabilities: {{CURRENT_CAPABILITIES}}

// Keep in mind that the process described should generally adhere to processes that can be well described through sensing, transforming, or transferring resources within a cell or its environment.

// Output exactly one sentence describing a biologically plausible process.`,
//     ["EVOLUTIONARY_STAGE", "STAGE_NUMBER", "AVAILABLE_RESOURCES", "CURRENT_CAPABILITIES"],
//     "1.0.0"
//   )
// ];
