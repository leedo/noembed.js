/*!
 * DOMReady
 *
 * Cross browser object to attach functions that will be called
 * immediatly when the DOM is ready.
 *
 * @version   1.0
 * @author    Victor Villaverde Laan
 * @link      http://www.freelancephp.net/domready-javascript-object-cross-browser/
 * @license   MIT license
 */
var DOMReady = (function () {
  var fns = [],
    isReady = false,
    errorHandler = null,
    getFunc = function ( fn ) {
      if ( typeof fn == 'string' )
        return function () { eval( fn ); };
      return fn;
    },
    ready = function () {
      isReady = true;

      // call all registered functions
      for ( var x = 0; x < fns.length; x++ ) {
        try {
          // call function
          fns[x]();
        } catch( err ) {
          // error occured while executing function
          if ( errorHandler )
            errorHandler( err );
        }
      }
    };

  /**
   * Setting error handler
   * @param {function|string} fn  When string will be run like code with eval()
   * @return {this} For chaining
   */
  this.setOnError = function ( fn ) {
    errorHandler = getFunc( fn );

    // return this for chaining
    return this;
  };

  /**
   * Add code or function to execute when the DOM is ready
   * @param {function|string} fn  When string will be run like code with eval()
   * @return {this} For chaining
   */
  this.add = function ( fn ) {
    fn = getFunc( fn );

    // call imediately when DOM is already ready
    if ( isReady ) {
      fn();
    } else {
      // add to the list
      fns[fns.length] = fn;
    }

    // return this for chaining
    return this;
  };

  // For all browsers except IE
  if ( window.addEventListener ) {
    document.addEventListener( 'DOMContentLoaded', function(){ ready(); }, false );
  } else {
    // For IE
    // Code taken from http://ajaxian.com/archives/iecontentloaded-yet-another-domcontentloaded
    (function(){
      // check IE's proprietary DOM members
      if ( ! document.uniqueID && document.expando ) return;

      // you can create any tagName, even customTag like <document :ready />
      var tempNode = document.createElement( 'document:ready' );

      try {
        // see if it throws errors until after ondocumentready
        tempNode.doScroll( 'left' );

        // call ready
        ready();
      } catch ( err ) {
        setTimeout( arguments.callee, 0 );
      }
    })();
  }

  return this;
})();

