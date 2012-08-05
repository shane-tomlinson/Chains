(function(exports) {
  "use strict";

  function bind(func, obj) {
    var args = [].slice.call(arguments, 2);

    return function() {
      var newArgs = [].slice.call(arguments);
      return func.apply(obj, args.concat(newArgs));
    };
  }

  function deepCopy(item) {
    var copy,
        type = Object.prototype.toString.call(item);

    if (type === "[object Array]") {
      copy = [];
      for (var i=0, len=item.length; i < len; ++i) {
        copy[i] = deepCopy(item[i]);
      }
    }
    else if (type === "[object Object]") {
      copy = {};
      for (var k in item) {
        copy[k] = deepCopy(item[k]);
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
          chain[key] = bind(proxyFunc, chain, funcList, 0);
          chain[key].__funcList = funcList;
        }
        else if (chain[key].__funcList) {
          // add to existing function list.
          chain[key].__funcList.push(item);
        }
        else {
          throw new Error("cannot override a non-function member with a function");
        }
      }
      else if (!(key in chain)) {
        // not a function, make a copy of the item.
        chain[key] = deepCopy(item);
      }
    }
  }

  function setupChain(proxy, links) {
    // Go through each link in the chain, set up instance variables and
    // functions on the proxy.  For each named function, create an array
    // that keeps track of the ordering of all functions with the same name.
    // When called, the proxy function will call each function in the array in
    // order.
    for (var i = 0, link; link = links[i]; ++i) {
      if (link.__links) {
        // A composite link, expand out each link contained within and add it
        // to the chain.
        setupChain(proxy, link.__links);
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
      // this.next points to the proxy function, the proxy function will
      // call the next item in the list.
      this.next = bind(proxyFunc, this, funcList, index + 1);
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
    chain.__links = links;
    return chain;
  }

  // The creation function.  Called like: Chain.create(constructor_to_use);
  Chain.create = function(chain) {
    if (!chain.__links) throw new Error("invalid chain");
    return new chain();
  };

  exports.Chain = Chain;
}(window));
