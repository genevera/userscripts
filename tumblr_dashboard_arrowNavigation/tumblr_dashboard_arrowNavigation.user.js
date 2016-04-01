// ==UserScript==
// @name        tumblr.com_dashboard_arrowNavigation
// @namespace   js.userscript.bewam
// @include     https://www.tumblr.com/dashboard
// @version     1
// @grant       none
// ==/UserScript==


var selector = '[data-pageable^="post_"]';
var rootNode = document.querySelector('.l-content');
var curr;

/**/
var console = {
    log: function (m) {}
}; /**/

function setDefaultPost() {
    return(curr = rootNode.querySelector(selector));
}

function setNext(e) {
    var p = e.parentNode;
    var next;
    var isLast = function (myE) {
        return(myE && p.lastChild == myE);
    };
    if (isLast(e)) {
        return e;
    }

    while(
        (next = e.nextSibling) &&
        ! isLast(next)) {
        if(isPost(next)) {
            return next;
        }
        e = next;
    }
}

function setPrev(e) {

    var prev;
    var p = e.parentNode;

    var isFirst = function (myE) {
        return(myE && p.firstChild == myE);
    };

    if(isFirst(e))
        return e;

    while(
        (prev = e.previousSibling) &&
        ! isFirst(prev)) {
        if(isPost(prev)) {
            return prev;
        }
        e = prev;
    }
}

function isPost(e) {
    if(e.nodeType == 1)
        if(e.matches(selector)) {
            return true;
        }
    return false;
}

function moveToNext() {
    var next = setNext(curr);
    if(next) {
        moveTo(next);
        curr = next;
    }

}

function moveToPrev() {
    var prev = setPrev(curr);
    if(prev) {
        moveTo(prev);
        curr = prev;
    }
}

function moveTo(e) {
    try {
        console.log(e.offsetTop);
        console.log(e);
        window.scrollTo(0, e.offsetTop);
    }
    catch(Err) {
        console.log(Err);
    }
}

curr = setDefaultPost();

document.addEventListener('keydown', function (e) {
    console.log(curr);
    switch(e.keyCode) {
    case 38: // up
        if(!curr) {
            curr = setDefaultPost();
        }
        moveToPrev();
        break;
    case 40: // down
        if(!curr) {
            curr = setDefaultPost();
        }
        moveToNext();
        break;
    default:
        return; // exit this handler for other keys
    }
    e.preventDefault();
}, true);
