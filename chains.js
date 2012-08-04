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

  function setupProxy(links) {
    var proxy = {};
    // Go through each link searching for functions. Create a proxy function
    // for each function found that is not already part of the proxy.
    for (var i = 0, link; link = links[i]; ++i) {
      for (var key in link) {
        var item = link[key],
            type = Object.prototype.toString.call(item);

        if (type === "[object Function]") {
          if (!(key in proxy)) {
            // create a new proxy function and function chain.
            var funcChain = [item];
            proxy[key] = proxyFunc.bind(proxy, funcChain, 0);
            proxy[key].chain = funcChain;
          }
          else if(proxy[key].chain) {
            // add to existing function chain.
            proxy[key].chain.push(item);
          }
          else {
            throw new Error("Cannot override a non-function member with a function");
          }
        }
        else if(!(key in proxy)) {
          proxy[key] = shallowCopy(item, type);
        }
      }
    }

    return proxy;
  }

  function proxyFunc(funcChain, index) {
    var func = funcChain[index],
        prevNext = this.next;

    if (index < funcChain.length) {
      this.next = proxyFunc.bind(this, funcChain, index + 1);
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
    var links = [],
        args = [].slice.call(arguments, 0);

    for (var link, i = 0; link = args[i]; ++i) {
      if (link.links) {
        for (var j = 0, innerLink; innerLink = link.links[j]; ++j) {
          links.push(innerLink);
        }
      }
      else if (Object.prototype.toString.call(link) === "[object Object]") {
        links.push(link);
      }
      else {
        throw new Error("invalid link");
      }
    }

    return {
      links: links
    };
  }

  // The creation function.  Called like: Chain.create(constructor_to_use);
  Chain.create = function(links) {
    links = links.links;

    if (Object.prototype.toString.call(links) !== "[object Array]") {
      throw new Error("invalid links");
    }

    var proxy = setupProxy(links);
    return proxy;

  };

  exports.Chain = Chain;
}(window));
