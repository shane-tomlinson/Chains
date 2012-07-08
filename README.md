# Chains

## Composition is More Powerful than Inheritance.

Last year I wrote SuperClass, a complete bastardization of the Javascript inheritance model.  This is another experiment, similar, but instead of single inheritance with a this.super function, the idea is how to give Javascript multiple-inheritancesque functionality through composition. Instead of creating a class heirarchy, the idea is to create a chains of functionality. Links in the chain can be reused in other chains without the restrictions of inheritance. Inheritance like functionality can still be created, but it is not necessary.

It is like creating classes out of nothing but a set of mixins.

## The Reasons/The Need

Classical-like inheritance and mixins have several limitations in Javascript.  Javascript does not natively support multiple inheritance, meaning a "Class" cannot have multiple roots.  A sort of multiple inheritance can be faked using mixins, but mixins have no good way of dealing with name collisions.  To deal with collisions, classical inheritance is used.

Below is a simple example showing the problem.

### Simple Example

A Model should be composed of the functionality of two other Classes, EventEmitter and DataStore. Both EventEmitter and DataStore contain an initialization function called init.

```
// An EventEmitter emits events.
var EventEmitter = function() {};
EventEmitter.prototype.init = function() { /* do some EventEmitter initialization */ };
EventEmitter.ptotype.emit = function() { /* emit an event */ };

// A DataStore stores data.
var DataStore = function() {};
DataStore.prototype.init = function() { /* do some DataStore initialization */ };
DataStore.prototype.set = function() { /* set a value in the store */ };

```

The Model should contain the functionality of both a DataStore and an EventEmitter. A Model should have three publicly available functions, init, emit and set.

```
var Model = function() {};
```

Javascripters have traditionally had to proxy calls to one or both EventEmitter and DataStore. If Model uses either DataStore or EventEmitter as its prototype, the other will have to be proxied.  If Model uses neither, calls to both will have to be proxied.

#### Model Proxies Call To One Root
```
// Model based off of EventEmitter
var Model = function() {};
Model.prototype = new EventEmitter();
Model.prototype.init = function() {
  this.dataStore = new DataStore();
  EventEmitter.prototype.init.call(this);

  // Some more Model initialization.
  ...
};
Model.prototype.set = function(...) {
  this.dataStore.set(...);
};
```
#### Model Proxies Calls To Both Roots
```
var Model = function() {};
Model.prototype.init = function() {
  this.dataStore = new DataStore();
  this.dataStore.init();

  this.eventEmitter = new EventEmitter();
  this.eventEmitter.init();

  // Some more Model initialization.
  ...
};
Model.prototype.set = function(...) {
  this.dataStore.set(...);
};
Model.prototype.emit = function(...) {
  this.eventEmitter.emit(...);
};
```

Ugh. Both of these are kind of yucktastic.  The init function in either is just kind of...  yuck.  The syntax is verbose.

### A More Ideal Solution
```
var Model = UseFunctionalityFrom(EventEmitter, DataStore);
Model.prototype.init = function() {
  CallInitOfBothEventEmitterAndDataStore();

  // Some more Model initialization.
  ...
};

// both emit and set are available on Model instances.
```

Chains is an experiment to try to give this. Instead of pure multiple inheritance ala C++, Chains creates chains of functionality out of one or more links. Each link in the chain is called top to bottom. This means objects can be composed in any order, free of the restrictions of inheritance. When a link is ready to pass control to the next lower link, "this.next()" is called.

## Usage

```
// An EventEmitter emits events.
var EventEmitter = {
  init: function() { /* do some EventEmitter initialization */ this.next(); };
  emit: function() { /* emit an event */ this.next(); };
};

// A DataStore stores data.
var DataStore = {
  init: function() { /* do some DataStore initialization */ this.next(); };
  set: function() { /* set a value in the store */ this.next(); };
};

// The ordering of links in the Chain is very important. If there are
// name collisions, functions are called top to bottom. Compare this to
// traditional inheritance where functions are called bottom to top. If a
// non-function variable is defined a link, redefinitions of the variable
// are ignored in subsequent links.
var Model = Chain({
  {
    init: function() {
      this.next();

      // Some more Model initialization.
      ...
    }
  },
  EventEmitter,
  DataStore
});

// To create an instance of Model
var model = Model.create();
```

## How it works
The code to make this happen isn't pretty. When a Chain is instantiated, a proxy function is created for each function name found in the chain. The proxy function takes care of setting up this.next so that each link in the chain is able to correctly pass control to the next link.

## License
Mozilla MPL 2.0

## Author
* Shane Tomlinson
* @shane_tomlinson
* shane@shanetomlinson.com
* set117@yahoo.com
* stomlinson@mozilla.com
* http://shanetomlinson.com


