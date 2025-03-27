# Panther Models and Logic
Panther models are based on graph data structure. Graph structure is flat and very flexible. 

## What are Graphs
Graph can be visualiset as dots connected by lines. 

Graphs have two parts: 
- node (dot)
- edge (line)

Nodes are connected by Edges into a graph. 

## Node Structure
Node has two main parts:
- Label(s)
- Properties

### Labels
Label is one or more Tags that define a "category" saing "What this Node is". 
Examples are Place, Period, Datasource etc.

Combination of multiple nodes can be used as multiple-level labeling. Like `[Datasource, WMS]` is combination of two labels for single node.

### Properties
Can be anything inside the node. Can be `key`, `name` or any general property we need.

## Edge Structure
Edge is connection betwee two nodes. Can be directed (from-to). 

Same as Nodes, Edge also can have:
- Label(s)
- Properties

Works the same as in the node case. 

Example of Edge Labels: `IS_RELATED`, `WAITING_FOR`, `CONTAINS`
Example of Edge properties: `expiration`, `length`, `priority`, `created`

## Resources
Please check resorces for visual explanation and many other examples.

- https://neo4j.com/docs/getting-started/graph-database/
- https://www.mongodb.com/resources/basics/databases/mongodb-graph-database