# Agents

Pivot, moving away from long, complicated process chains.
The primary higher-level entities inside of the grid will be cellular agents. These agents will have a combination of goals and capabilities, and will autonomously move and interact with the grid world each round. The gameplay loop will consist of the player setting up their agents, then each "round" they will compete. Think "LLM Autobattler"

## Goals

Goals are high level descriptions that will be fed into models leveraged by the agent to select capabilities to act with at a given time.
Examples
- "Gather 5 energy"; Context: known grid state; dynamically prioritized via (cur_energy)/5
- "Avoid the enemy until you are strong"; Context: known grid state, attack power; dynamically prioritized via (distance_to_enemy)

A goal will consist of a description, slice of known game state to focus on as context, a global/high level importance rank, and a dynamic "focus" ranking function.

Focus scores will be deterministically computed to start, maybe allowing LLM to participate later will improve intelligence.

## Capabilities

These are definitions of tool calls that will be available to an agent.
- "Move 1 space in any direction"
- "Sense resources in surrounding grid cells"

These will need to obviously be more grounded as verifiable, well-defined game state modifiers.

Modify game state -> Update mental context