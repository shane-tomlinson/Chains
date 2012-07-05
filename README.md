#Chains
##Bastardize the Javascript Inheritance Model even Further.

A proof of concept bastardization of Javascript to create a home grown
class system that provides a declarative but "classical" model of inheritence in Javascript.  It takes the already proven ways of implementing classical inheritence and then adds some goodness.  This code rolls its own prototype chain traversal and stack frame management.  The purpose of this project is purely experimental, if used, it may cause all kinds of strange side effects that you might not like.

##The Reasons/The Need

I am heavily involved in writing apps in Javascript, usually using pseudo classical inheritance model made famous by Douglas Crockford.

The problem with the approach is that it isn't complete enough.  Trying to call a superclass function from a subclass function is completely and absurdly verbose.

For example, say there are two "Classes", SuperClass and SubClass, both with a toString method.  SubClass' toString method is supposed to call SuperClass' toString function.  Typically, this is done using a variation of this:

    SubClass.prototype.toString = function() {
        return 'SubClass: ' + SuperClass.prototype.toString.call( this );
    };

That's ridiculous.  I want this:

    SubClass.prototype.toString = function() {
        return 'SubClass: ' + this.super();
    }

How much cleaner is that.

So, the code shows the implementation.  Still in development, still being cleaned up.  But, the tests are there, showing how it works, showing that it works.

I am open to suggestions.

Again, this is a proof of concept.  I am not using it in any production code.  It causes bloat.  It's not very performant.  It's an interesting sugar, perhaps you have some ideas on how to remove these limitations and make it truely uber-cool.

##Acknowledgements
I'd like to thank Dan Newcome[http://newcome.wordpress.com/] for reading the article[http://www.shanetomlinson.com/2011/javascript-inheritance-super/] and asked me "Why not try something like..." which is what this version is.  His suggestion made things much more memory efficient.

email me at:
set117 at yahoo.com
or
stomlinson at mozilla.com
