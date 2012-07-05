function Class( superclass, subclass ) {
    if( !subclass ) {
        subclass = superclass;
        superclass = null;
    }

    // F is our new class constructor, it does nothing.  Absolutely nothing.
    var F = function() {};
    if( superclass ) {
        // If there was a superclass, set our new classes prototype to it.
        F.prototype = new superclass();
        for( var key in subclass ) {
            // copy over subclass properties to new prototype.
            F.prototype[ key ] = subclass[ key ];
        }

        // A very very important bit of housekeeping here, keep track of
        // the superclass.  This is used later.
        F.superclass = superclass;
    }
    else {
        // no superclass, just set the prototype to be the subclass object.
        F.prototype = subclass;
    }

    // very important to reset the constructor as any class with a superclass
    // will have it overwritten
    F.prototype.constructor = F;

    return F;
}

Class.create = function( constr ) {
    var obj = new constr();

    // No wrapping on base class instances.
    if( !obj.constructor.superclass ) {
        return obj;
    }

    // We have some inheritance, wrap every function with our own stack 
    // management function.
    // Yes, this is slow and will eat memory like there is no tomorrow.
    var handlers = ( function( obj ) {
        var currLevel, currKey;

        var stack = [];
        function pushStack() {
            stack.push( [ currLevel, currKey ] );
        }
        

        function popStack() { 
            [ currLevel, currKey ] = stack.splice( stack.length - 1, 1 );
        }
        
        var decorator = function( key ) {
            return function() {
                pushStack();

                currKey = key;
                currLevel = obj.constructor;

                var next = findNext(),
                    retval = next.apply( obj, arguments );

                popStack();

                return retval;
            };
        }

        var superFunc = function() {
            pushStack();

            var next = findNext(),
                retval;

            if( next ) {
                retval = next.apply( obj, arguments );
            }

            popStack();

            return retval;
        };

        function findNext() {
            var next;
            do {
                next = currLevel && currLevel.prototype.hasOwnProperty( currKey 
                        ) && currLevel.prototype[ currKey ];
                currLevel = currLevel.superclass;
            } while( currLevel && !next );
            return next;
        }

        return {
            decorator: decorator,
            'super': superFunc
        };
    }( obj ) );

    for( var key in obj.constructor.prototype ) {
         // note, there is NO hasOwnProperty.
        var item = obj[ key ];
        if( typeof item === 'function' && key !== 'constructor' ) {
            obj[key] = handlers.decorator( key );
        }
    }

    obj.super = handlers.super;

    return obj;
}

