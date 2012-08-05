/*global test, equal, ok, Chain */

(function() {
    "use strict";

    var WhackAMole = Chain({
      molesRemaining: function() {
        return this.next() + " remaining";
      },

      moles: 1,
      whackAMole: function() {
        this.moles--;
      }
    },

    {
      molesRemaining: function() {
        return this.moles + this.next();
      },

      // this does not overwrite moles declared in the first link
      moles: 2
    },

    {
      molesRemaining: function() {
        return " mole" + (this.moles != 1 ? "s" : "");
      },

      addAMole: function() {
        this.moles++;
      },

      moleNames: ['Larry', 'Curley', 'Moe'],
      moleDOB: {
        Larry: '6/6/12',
        Curly: '6/7/12',
        Moe:   '6/8/12'
      }
    });

    var WhackARodent = Chain({
      mice: 1,
      miceRemaining: function() {
        return this.mice + " " + (this.mice === 1 ? "mouse" : "mice") + " remaining";
      },

      rodentsRemaining: function() {
        return this.molesRemaining() + " " + this.miceRemaining();
      }
    }, WhackAMole);

    module("Chain");

    test("basic usage", function() {
      var whackAMole = Chain.create(WhackAMole);
      equal(whackAMole.molesRemaining(), "1 mole remaining");

      whackAMole.addAMole();
      equal(whackAMole.molesRemaining(), "2 moles remaining");

      whackAMole.whackAMole();
      whackAMole.whackAMole();
      equal(whackAMole.molesRemaining(), "0 moles remaining");
    });

    test("composite usage", function() {
      var whackARodent = Chain.create(WhackARodent);
      equal(whackARodent.molesRemaining(), "1 mole remaining");
      equal(whackARodent.miceRemaining(), "1 mouse remaining");

      equal(whackARodent.rodentsRemaining(), "1 mole remaining 1 mouse remaining");

      // Check whether deep copy works correctly
      var whackAMole = Chain.create(WhackAMole);

      // If updating these affects the moleNames and moleDOB on whackARodent,
      // deepCopy is not working correctly.
      whackAMole.moleDOB.Curley = '6/9/12';
      whackAMole.moleNames.pop();
      delete whackAMole.moleNames.Moe;

      equal(whackARodent.moleNames.length, 3, "Array copied correctly");
      equal(whackARodent.moleDOB.Moe, '6/8/12', "Object copied correctly");
    });

}() );

