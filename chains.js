(function(exports, undefined) {
  "use strict";

  // Function.prototype.bind polyfill from MDN.
  if (!Function.prototype.bind) {

    Function.prototype.bind = function(obj) {
      if (typeof this !== 'function') // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');

      var slice = [].slice,
          args = slice.call(arguments, 1),
          self = this,
          nop = function () {},
          bound = function () {
            return self.apply(this instanceof nop ? this : (obj || {}),
                                args.concat(slice.call(arguments)));
          };

      bound.prototype = this.prototype;

      return bound;
    };
  }

  function shallowCopy(item, type) {
    var copy;

    if (type === "[object Array]") {
      copy = [];
      for (var i=0, len=item.length; i < len; ++i) {
        copy[i] = item[i];
      }
    }
    else if (type === "[object Object]") {
      copy = {};
      for (var k in item) {
        copy = item[k];
      }
    }
    else {
      copy = item;
    }

    return copy;
  }

  function addLinkToChain(chain, link) {
    for (var key in link) {
      var item = link[key],
          type = Object.prototype.toString.call(item);

      if (type === "[object Function]") {
        if (!(key in chain)) {
          // each function in the chain with the same name gets put into the
          // function list. When a chain instance function is called, each item
          // in the funcList is called in order.
          var funcList = [item];
          chain[key] = proxyFunc.bind(chain, funcList, 0);
          chain[key].funcList = funcList;
        }
        else if (chain[key].funcList) {
          // add to existing function list.
          chain[key].funcList.push(item);
        }
        else {
          throw new Error("cannot override a non-function member with a function");
        }
      }
      else if (!(key in chain)) {
        // not a function, make a copy of the item.
        chain[key] = shallowCopy(item, type);
      }
    }
  }

  function setupChain(proxy, links) {
    // Go through each link searching for functions.
    for (var i = 0, link; link = links[i]; ++i) {
      if (link.links) {
        // A composite link, expand out each link contained within and add it
        // to the chain.
        setupChain(proxy, link.links);
      }
      else {
        // Normal link. Create a proxy function for each function found that is
        // not already part of the proxy.
        addLinkToChain(proxy, link);
      }
    }
  }

  function proxyFunc(funcList, index) {
    /*jshint validthis: true*/
    var func = funcList[index],
        prevNext = this.next;

    if (index < funcList.length) {
      // this.next points back to the proxy function, the proxy function will
      // call the next item in the list.
      this.next = proxyFunc.bind(this, funcList, index + 1);
    }
    else {
      // last item in the chain, there is no next function.
      delete this.next;
    }

    var retval = func.apply(this, [].slice.call(arguments, 2));

    // If there was no next function, remove its declaration from the proxy.
    this.next = prevNext;
    if (!this.next) delete this.next;

    return retval;
  }

  function Chain() {
    var links = [].slice.call(arguments, 0);

    function chain() {}
    chain.prototype = {};
    setupChain(chain.prototype, links);
    chain.links = links;
    return chain;
  }

  // The creation function.  Called like: Chain.create(constructor_to_use);
  Chain.create = function(chain) {
    if (!chain.links) {
      throw new Error("invalid chain");
    }

    return new chain();
  };

  exports.Chain = Chain;
}(window));
