# `rtt_engine`

The game engine for RTT. This is intended to be runnable headlessly–all rendering is done separately by the `rtt_renderer`.

## Design

The engine uses a design similar to MVC, where Models act as an abstraction layer around the state and Controllers control behaviour.

**Entities:** state and metadata to describes entities such as a Factory or a Turret Projectile. State is stored as objects rather than classes to keep deserialisation simple.

**Abilities:** mixins offering functionality that can be given to entities, such as the ability to be killed or to steer around the map. Entities are constructed by combining abilities and then adding some entity-specific logic/behaviour.

**Models:** each model is a class that works on a large number of the same kind of entity. Models encapsulate the details of how to manage entity state.

**Controllers:** each controller is a class that works on a large number of the same kind of entity. Controllers control entity, and use the models as a high-level state API.

Each kind of entity has a **Presenter** in the separate `rtt_renderer`, to render those entities on screen.
