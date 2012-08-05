# Chains

## Use Composition to Fake Multiple Inheritance in Javascript

Last year I wrote SuperClass, A Complete Bastardization of the Javascript
Inheritance Model. Chains is a similar experiment, but instead of single
inheritance with a this.super function, the idea is to give Javascript
multiple-inheritance like functionality through composition.

Chains compose functionality out of one or more links. A link is part mixin,
part class in an inheritance hierarchy. Each link provides a set of functions.
Links can be composed into any number of chains similar to a mixin.  If two or
more links have a function of the same name, these functions can be called in
sequence like in traditional inheritance.

## The Reasons/The Need

Classical-like inheritance and mixins have several limitations in Javascript.
Javascript does not natively support multiple inheritance, meaning a "Class"
cannot have multiple roots. A sort of multiple inheritance can be faked using
mixins, but mixins have no good way of dealing with name collisions - this is
what inheritance is for.

Below is a simple example showing the problem.

### Simple Example

A Model should be composed of the functionality of two other Classes,
EventEmitter and DataStore. Both EventEmitter and DataStore contain an
initialization function called init.

```
// An EventEmitter emits events.
var EventEmitter = function() {};
EventEmitter.prototype.init = function() {
  /* do some EventEmitter initialization */
};
EventEmitter.ptotype.emit = function() {
  /* emit an event */
};

// A DataStore stores data.
var DataStore = function() {};
DataStore.prototype.init = function() {
  /* do some DataStore initialization */
};
DataStore.prototype.set = function() {
  /* set a value in the store */
};

```

The Model should contain the functionality of both a DataStore and an
EventEmitter. A Model should have three publicly available functions, init,
emit and set.

Because Javascript is such a flexible language, there are many ways of doing
this. A Model could "inherit" from either DataStore or EventEmitter, a Model
could create an instance of DataStore or EventEmitter and proxy calls, or
a model could mixin both DataStore and EventEmitter and override init to call
the init function of each of the mixins.

The problem is, these are verbose.  They are yuck.  They take too much work.
I want to be lazy.

### A More Ideal Solution
```
var Model = ComposeFunctionality({
  init: function() {
    CallInitOfBothEventEmitterAndDataStore();

    // Some more Model initialization.
    ...
  }
}, EventEmitter, DataStore);
```

Chains is an experiment to try to give this. Instead of pure multiple
inheritance ala C++, Chains compose functionality out of one or more links.
Each successive link in the chain is called from top to bottom (or left to
right). Links can be reused in multiple objects, mixed in any order and free of
the restrictions of inheritance. When a link is ready to pass control to the
next link it calls "this.next()".

## Usage

```
// An EventEmitter emits events.
var EventEmitter = {
  init: function() {
    /* do some EventEmitter initialization */
      this.next();
    },
    emit: function() {
      /* emit an event */
      this.next();
  }
};

// A DataStore stores data.
var DataStore = {
  init: function() {
    /* do some DataStore initialization */
    this.next();
  },
  set: function() {
    /* set a value in the store */
    this.next();
  }
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
The code to make this happen isn't pretty. When a Chain is instantiated,
a proxy function is created for each function found in the chain. The proxy
function takes care of all housekeeping chores so that a call to this.next is
able to correctly pass control to the next link.

## License
Mozilla MPL 2.0

## Author
* Shane Tomlinson
* @shane_tomlinson
* shane@shanetomlinson.com
* set117@yahoo.com
* stomlinson@mozilla.com
* http://shanetomlinson.com


