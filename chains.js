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
  }
}

// The creation function.  Called like: Chain.create(constructor_to_use);
Chain.create = function(links) {
  links = links.links;

  if (Object.prototype.toString.call(links) !== "[object Array]") {
    throw new Error("invalid links");
  }

  var proxy = {};
  for (var i = 0, link; link = links[i]; ++i) {
    for (var key in link) {
      if (!(key in proxy)) {
        var item = link[key],
            type = Object.prototype.toString.call(item);

        if (type === "[object Function]") {
          proxy[key] = _findNext.bind(proxy, links, key, i);
        }
        else if (type === "[object Array]") {
          // create a shallow copy.
          proxy[key] = [];
          for (var i=0, len=item.length; i < len; ++i) {
            proxy[key][i] = item[i];
          }
        }
        else if (type === "[object Object]") {
          // create a shallow copy.
          proxy[key] = {};
          for (var k in item) {
            proxy[key] = item[k];
          }
        }
        else {
          proxy[key] = item;
        }
      }
    }
  }

  return proxy;

  function _findNext(links, key, index) {
    var info = findNext(links, key, index),
        retval;

    if (info.next) {
      // overwrite this.super with a reference ourselves, but set
      //	the index to be one above this in the prototype chain.
      this.next = _findNext.bind(this, links, key, info.index);

      retval = info.next.apply(this, [].slice.call(arguments, 3));

      // get rid of this.next so this is not callable from the
      // outside.
      this.next = null;
      delete this.next;
    }

    return retval;
  }

  function findNext(links, key, index) {
    for (var link; link=links[index]; ++index) {
      if (link[key]) {
        return { next: link[key], index: index + 1 };
      }
    }

    return { next: null };
  }
}

