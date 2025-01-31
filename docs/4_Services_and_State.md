# Services and State

All game logic and systems should be initialized, stored, and accessed using a `ServiceLocator`. This implements a basic form of dependency injection, allowing service instances to be registered and retrieved using a locator.

All IPC calls should flow through services registered with the `NativeServiceLocator` in `src/main/index.ts`.

Services that need access to PixiJS context should live in a `GameServiceLocator` which adds additional functionality for accessing the PixiJS `Application`, main game loop `tick()`, and asynchronous initialization.

State needed for rendering should be stored entirely within Zustand stores, for now all of it will probably reside in slices of `GameStore`.
