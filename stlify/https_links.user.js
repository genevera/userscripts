// ==UserScript==
// @name        https_links
// @namespace   io.github.bewam
// @include     https://*
// @version     1
// @run-at      document-start
// @grant       GM_info
// ==/UserScript==

var info = {
    script :{
        includes: []
}
};
info = GM_info.script;

if( info.includes.length < 2 )
{
    if( info.includes[ 0 ] == "https://*" )
        throw( info.localizedName+': you need to modify the @include parameter' );
}

/* disable logging,  re-enable it with slash-star */
var console = {
    log: function ( m ) {}
}; /**/

var myAttrs = [ 'src', 'href', 'action' ];

var rootNode = document;

var osberverConfig = {
    attributes: false,
    childList: true,
    subtree: true,
    characterData: false
};
// build selector
var selector = myAttrs.map( ( e ) => '[' + e + '^="http:"]' ).join( ',' );

console.log( selector );

function secureDomainLink( el ) {
    console.log( el );

    function replaceAttr( attrName ) {
        el.setAttribute( attrName, el.getAttribute( attrName ).replace(
            /^http:/, 'https:' ) );
    }
    for( var myAttr of myAttrs ) {
        if(
            el.hasAttribute( myAttr ) &&
            el.getAttribute( myAttr ).indexOf( location.hostname ) > -1 // don't rewrite external links
        ) {
            replaceAttr( myAttr );
        }
    }
}

function processNodes( observer, nodes ) {
    console.log( nodes );
    for( var node of nodes ) {
        secureDomainLink( node );
    }
    return true;
}


function setMutationHandler( rootNode, selector, cb ) {
    function observer( mutations ) {
        mutations.forEach( function ( mutation ) {
            var nodes = mutation.addedNodes;
            for( var n of nodes ) {
                if( n.nodeType == 1 ) {
                    n =
                        n.matches( selector ) ? [ n ] :
                        n.querySelectorAll( selector );
                    if( n.length && cb( mo, n ) ) {
                        return true;
                    }
                }
            }
        } );
    }

    var mo = new MutationObserver( observer );
    mo.observe( rootNode, osberverConfig );
}


setMutationHandler( document, selector, processNodes );
