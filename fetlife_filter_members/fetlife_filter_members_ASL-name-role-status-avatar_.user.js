// ==UserScript==
// @name            fetlife_all_members (ASL+role+status filter)
// @namespace       io.github.bewam
// @description     greasemonkey script to filter fetlife members when it's possible. Search by name, gender, role, age, location or status.
// @include         https://fetlife.com/*
// @include         https://*.fetlife.com/*
// @updateURL       https://github.com/bewam/userscripts/raw/master/fetlife_filter_members/fetlife_filter_members_ASL-name-role-status-avatar_.user.js
// @version         1.9.2.20160514
// @grant           GM_addStyle
// @run-at          document-end
// @require         http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

// NOTE: comment (change first "/**/" to "/*") for debugging.
/**/console = { log: ()=>{}}; /**/

var useCurrentPageAsDefault = false;
var onlyWithAvatar = true;
/* care modifing
* TODO : to be removed: https://greasyfork.org/fr/forum/discussion/4199/lock-a-script#latest
*/
const FETCH_LATENCY = 1500;
// jshint ignore: start

+(function ($) {
// jshint ignore: end
    // jquery str
    const Selector = {
        currentPage: 'em.current',
        body: 'body',
        users: 'div.fl-member-card',
        pagination: "div.pagination",
        nextPage: 'a.next_page',
        nextDisabled: 'span.next_page.disabled',
        previousPage: 'a.previous_page',
        firstUser: '.fl-member-card:first',
        user: {
            body: '.fl-flag__body',
            imageAvatar: 'img.fl-avatar__img',
            firstSpan: '.fl-member-card__user',
            profileLink: 'a.fl-member-card__user',
            shortDesc: '.fl-member-card__info',
            /** age, gender, role */
            location: 'span.fl-member-card__location',
            into: 'span.fl-member-card__action span',
        }
    };
    // script_name avoid name/id conflicts
    const _STR = 'fetlife_all_members';
    const ARRAY_GENDER = [
        'M',
        'F',
        'CD/TV',
        'MtF',
        'FtM',
        'TG',
        'GF',
        'GQ',
        'IS',
        'B',
        'FEM'
    ];
    const ARRAY_GENDER_LABEL = [
        'Male',
        'Female',
        'CD/TV',
        'Trans-MtF', 'Trans-FtM',
        'Transgender',
        'Gender Fluid',
        'Genderqueer',
        'Intersex',
        'Butch',
        'Femme'
    ];
    const ARRAY_ROLE = [
        'Dom',
        'Domme',
        'Switch',
        'sub',
        'Master',
        'Mistress',
        'slave',
        'kajira',
        'kajirus',
        'Top',
        'bottom',
        'Sadist',
        'Masochist',
        'Sadomasochist',
        'Kinkster',
        'Fetishist',
        'Swinger',
        'Hedonist',
        'Exhibitionist',
        'Voyeur',
        'Sensualist',
        'Princess',
        'Slut',
        'Doll',
        'sissy',
        'Rigger',
        'Rope Top',
        'Rope Bottom',
        'Rope Bunny',
        'Spanko',
        'Spanker',
        'Spankee',
        'Furry',
        'Leather Man',
        'Leather Woman',
        'Leather Daddy',
        'Leather Top',
        'Leather bottom',
        'Leather boy',
        'Leather girl',
        'Leather Boi',
        'Bootblack',
        'Primal',
        'Primal Predator',
        'Primal Prey',
        'Bull',
        'cuckold',
        'cuckquean',
        'Ageplayer',
        'Daddy',
        'Mommy',
        'Big',
        'Middle',
        'little',
        'brat',
        'babygirl',
        'babyboy',
        'pet',
        'kitten',
        'pup',
        'pony',
        'Evolving',
        'Exploring',
        'Vanilla',
        'Undecided'
    ];
    const ARRAY_ROLE_LABEL = ARRAY_ROLE;
    const ARRAY_INTO_STATUS = [
        'is into',
        'is curious about'
    ];
    const ARRAY_INTO_ACTIVITY = [
        'giving',
        'receiving',
        'watching',
        'wearing',
        'watching others wear',
        'everything to do with it'
    ];

    const marker = {
        folded: '&gt;',
        unfolded: 'v'
    };
    const isFetishesPage = /^\/fetishes/.test(location.pathname);

    // NOTE: do not modify unless you know what you're doing.
    var overlay = (form) =>
        $(Selector.firstUser).parents('.clearfix:first').prepend(form).length;

    /** TODO @class to manage pages */
    // Pagination = {
    //     _next: '',
    //     _previous: '',
    //     _currentNo: '',
    //     _clientPageNo,
    //     setNext: setNext,
    //     getNext: getNext,
    //     getPrevious :()  => this._previous,
    //     setPrevious : (str) => {this._previous = str;},
    //     getCurrentNo: () => this._currentNo ,
    //     setCurrentNo: (n) => {this._currentNo = n;},
    // };
    // var page = Object.create(Pagination);

    var lastPageNumber,
        _pageCurrentNo,
        _clientPageNo,
        InputcurrentPageDefaultVal,
        _fromPage = -1,
        _toPage = -1,
        pageMin = 1,
        pageMax = 1,
        _pageNext = '';

    /* balance columns */
    var alternColumn = 0,
        _shownCount = 0;

    /* store user html block index is shared with mCache */
    /* todo */
    var members = [],
        /** NOTE mCache = ARRAY( { n° index: { [0]'name':'', [1]'age':XX, [2]'gender':WW, [3]'role':'', [4]'location':'', [5]url:'', [6]"hasAvatar":boolean } }) */
        mCache = [],
        listContainers = [] // columns where lists appear
    ;
    //TODO Expressions =
    var userRegExp = new RegExp('([0-9]{2})(' + ARRAY_GENDER.join('|') +
        ')? (' +
        ARRAY_ROLE.join('|') + ')?', 'i');
    var regInto = new RegExp('^(' + ARRAY_INTO_STATUS.join('|') +
        ') ?(.*$)?');

    /** modified, value, default value */
    var filters = {
        'NameContains': [false, '', ''],
        'AgeMin': [false, '', ''],
        'AgeMax': [false, '', ''],
        'Gender': [false, [], []],
        'Role': [false, [], []],
        'LocContains': [false, '', ''],
        'IntoStatus': [false, '', ''],
        'IntoActivity': [false, '', '']
            // has_avatar: @see function
    };

    var ajaxLocked = false,
        scriptLaunched = false,
        stopped = false;

    /* jshint ignore:start */
    GM_addStyle(
        '#' + S('Wrapper') + ' { ' +
        //     'background-color: rgba(255, 255, 255, 0.4);' +
        'border: solid 2px lightgray;' +
        'color: white !important;/**/ ' +
        'padding:5px;' +
        'min-height:15px !important;' +
        'vertical-align:middle;' +
        'margin-bottom: 10px;' +
        '} ' +
        '#' + S('Controls') + ' { ' +
        'display: block;/**/ ' +
        'min-height:15px !important;' +
        '}' +
        '#' + S('Content') + ' { ' +
        'display: none;/**/ ' +
        'margin-top: 5px;' +
        '}' +
        '#' + S('Buttons') + '{ ' +
        'margin-top: 10px;' +
        '}' +
        '#' + S('ButtonStop') + '{ ' +
        // 'display: none;' +
        '}' +
        ''
    );
    /* jshint ignore:end */

    /*-----------------------------------*/

    /*----------------html related--------------------------*/
    function buildOptions(arr1, arr2) {
        var str = '';
        $.each(arr1, function (i, v) {
            str += '<option value="' + v + '" >' + arr2[i] +
                '        </option>';
        });
        return str;
    }

    function drawBlock() {
        var optionsGender = buildOptions(ARRAY_GENDER, ARRAY_GENDER_LABEL);
        var optionsRole = buildOptions(ARRAY_ROLE, ARRAY_ROLE_LABEL);
        var optionsIntoStatus = buildOptions(ARRAY_INTO_STATUS,
            ARRAY_INTO_STATUS);
        var optionsIntoActivity = buildOptions(ARRAY_INTO_ACTIVITY,
            ARRAY_INTO_ACTIVITY);

        var BLOCK =
            '<div id="' + S('Wrapper') + '"> ' +
            '    <div id="' + S('Controls') + '">' +
            '        <b>&gt;</b>&nbsp;' +
            '        <u>filter members</u>' +
            '    </div>' +
            '    <div id="' + S('Content') + '"> ' +
            '    <div id="' + S('Filters') + '">' +
            '        <label for="' + S('NameContains') +
            '">name:&nbsp;&nbsp;&nbsp; </label>' +
            '        <input id="' + S('NameContains') +
            '" type="text" class="filter"></input>' +
            '        <br />' +
            '        <label for="' + S('LocContains') +
            '">location:</label>' +
            '        <input id="' + S('LocContains') +
            '" type="text" class="filter" ></input>' +
            '        <br />' +
            '        <u>age</u>&nbsp;' +
            '        <label for="' + S('AgeMin') + '">min:</label>' +
            '        <input id="' + S('AgeMin') +
            '" type="text" class="filter" size="2"></input>' +
            '&nbsp; ' +
            '        <label for="' + S('AgeMax') + '">max:</label>' +
            '        <input id="' + S('AgeMax') +
            '" type="text" class="filter" size="2"></input>' +
            '        <br />' +
            '        <small>' +
            '        Use CTRL key to multiple select.' +
            '        <br />' +
            '        Use MAJ key to do a range select.' +
            '        </small>' +
            '        <br />' +
            '        <label for="' + S('Gender') + '">gender:</label>' +
            '        <select id="' + S('Gender') +
            '" class="filter" name="gender" multiple="multiple" size="3">' +
            '        <option value="" selected="selected">none specified</option>' +
            optionsGender +
            '        </select>' +
            '        <label for="' + S('Role') + '">role:</label>' +
            '        <select id="' + S('Role') +
            '" class="filter" name="role" multiple="multiple" size="5">' +
            '        <option value="" selected="selected">none specified</option>' +
            optionsRole +
            '        </select>';

        if(isFetishesPage) {
            BLOCK +=
                '&nbsp; Into &nbsp;' +
                '        <select id="' + S('IntoStatus') +
                '"  multiple="multiple" size="3">' +
                '        <option value="" selected="selected">All</option>' +
                optionsIntoStatus +
                '        </select>' +
                '        <select id="' + S('IntoActivity') +
                '" multiple="multiple" size="3">' +
                '        <option value="" selected="selected">All</option>' +
                optionsIntoActivity +
                '        </select>';
        }

        BLOCK +=
            '        <br />' +
            // '        <input type="hidden" name="' + S('HasAvatar') +
            // '" ></input>' +
            '        <input type="checkbox" id="' + S('HasAvatar') +
            '" name="' + S(
                'HasAvatar') + '" checked="' + (onlyWithAvatar ? 'true' :
                'false') + '"></input>' +
            '        <label for="' + S('HasAvatar') +
            '">only with avatar</label>' +
            '        <br />' +
            '        <label for="' + S('FromPage') +
            '">From page:&nbsp;</label>' +
            '        <input id="' + S('FromPage') +
            '" type="text" class="filter" size="3" value="' +
            InputcurrentPageDefaultVal + '"></input>' +
            '        <input id="' + S('ButtonCurrentPage') +
            '" type="button" value="current"></input>' +
            '        <label for="' + S('ToPage') +
            '"> &nbsp;to page:&nbsp;</label>' +
            '        <input id="' + S('ToPage') + '" name="' + S('ToPage') +
            '" type="text" class="filter" size="3"></input>' +
            '        <br />' +
            '        <br />' +
            '    </div> ' + // Filters
            '    <div id="' + S('Buttons') + '" style="display:inline;">' +
            '        <input id="' + S('ButtonGo') +
            '" type="button" value="view&nbsp;all"></input>' +
            '        <input id="' + S('ButtonStop') +
            '" type="button" value="&nbsp;stop&nbsp;" disabled="true"></input>' +
            '    </div>' + // Buttons
            '    <div id="' + S('Info') + '">' +
            '        <br />' +
            '        <span id="' + S('ShowCount') + '">' +
            '        </span> ' +
            '    </div> ' + // Info
            '    </div> ' + //Content
            '</div>'; // Wrapper
        if(overlay(BLOCK) < 1) {
            $(Selector.body).prepend(BLOCK);
        }
    }

    function disableAllInput() {
        // TODO @class Form. Form.disableEntries() => void()
        $I('Content').find('*').attr("disabled", 'true');
        $I('ButtonStop').removeAttr("disabled");
    }

    function enableAllInput() {
        $I('Content').find('*').removeAttr("disabled");
        $I('ButtonStop').attr("disabled", 'true');
    }

    function disableInput() {
        // TODO @function Form.disableEntries() => void()
        $I('Content').find('*').attr("disabled", 'true');
    }

    function enableInput() {
        $I('Content').find('*').removeAttr("disabled");
    }
    /**
     * @param str id
     * @return object jQuery with the tagged (script name) id
     */
    function $I(id) {
        var str = arguments.length > 1 ? arguments[1] : '';
        return $('#' + S(id) + str);
    }

    function S(name) {
        return _STR + name;
    }

    function rS(str) {
        return str.replace(_STR, '');
    }

    function cleanPage() {
        $(Selector.users).remove();
        $(Selector.pagination).hide();
        _shownCount = 0;
    }

    function toggleMarker($el) {
        var cnt = $el.html();
        $el.html(cnt == marker.unfolded ? marker.folded : marker.unfolded);
    }
    /*-----------------------------------*/
    /** Would grab 2 containers where to put members in */
    function initContainers(pageUsers) {
        var parent;
        $(pageUsers).each(function () {
            parent = $(this).parent().get(0);
            console.log("container: " + $(parent).attr("class"));

            if($.inArray(parent, listContainers) == -1) {
                listContainers.push(parent);
            }
        });
    }
    /*------------------------------------*/
    function updateMemberFilters() {
        $I('Content').find('select, input[type=text]').each(function () {

            var name = rS($(this).attr('id'));
            console.log('updating filter: ' + name);
            if(!filters[name]) {
                return;
            }
            if(typeof filters[name][2] != 'string') {
                var options = $(this).find('option:selected');
                filters[name][0] = false;
                filters[name][1] = [];
                $(options).each(function () {
                    filters[name][0] = true;
                    filters[name][1].push($(this).val());
                });
                if(filters[name][1].length == 1 && filters[name][1]
                    [0] === '') {
                    filters[name][0] = false;
                }
            }
            else
            if(filters[name][2] != $(this).val()) {
                filters[name][0] = true;
                filters[name][1] = $(this).val();
            }
            else {
                filters[name][0] = false;
                filters[name][1] = filters[name][2];
            }
        });
        console.log(filters);
    }

    function updateAvatarFilter() {
        onlyWithAvatar = ($I('HasAvatar', ':checked').length > 0);
    }

    function updatePaginationFilters() {
        var reload = false;
        var $fromPage = parseInt($I('FromPage').val());
        var $toPage = parseInt($I('ToPage').val());


        if(_fromPage != $fromPage) {
            _fromPage = $fromPage;
            reload = true;
        }

        if(_toPage != $toPage) {
            _toPage = $toPage;
            reload = true;
        }

        console.log(' _fromPage ' + _fromPage + ' $fromPage ' + $fromPage);
        console.log(' _toPage   ' + _toPage + '   $toPage   ' + $toPage);

        return reload;
    }
    /*-----------------------------------*/
    var Refining = function (cacheItem) {

        var c = cacheItem;
        var filtered = false;

        /**
         * @return bool false by default, element is not trapped */
        this.isFiltered = function () {
            // NOTE for debug purpose uncomment the second block and / comment this one.
            // TODO how secure is eval() ?
            /**
            role();
            name();
            location();
            hasAvatar();
            gender();
            ageMin();
            ageMax();
            intoStatus();
            intoActivity();
            /**/

            /**/
            var functions = [
                "ageMax",
                "ageMin",
                "gender",
                "hasAvatar",
                "intoActivity",
                "intoStatus",
                "location",
                "name",
                "role"
            ];
            for(var fn of functions) {
                // jshint ignore : start
                eval(fn + '()');
                // jshint ignore : end
                if(getF()) {
                    console.log('is filtered: ' + fn.toString());
                    console.log(c);
                    // stop filtering here
                    return true;
                }
            }
            /**/
            return filtered;
        };
        /**
         * @arg boolean filtered ?
         *  @return void(0)
         */
        function setF(F) {
            if(F) {
                filtered = true;
            }
        }

        function getF() {
            return filtered;
        }

        /** NOTE Each filter (except hasAvatar) check if filter was modified
            (updateMemberFilters) and look if the changes concern the current
            user. Filter must set false if ok.
        */

        function ageMax() {
            if(filters.AgeMax[0]) {
                setF(c[1] > parseInt(filters.AgeMax[1]));
            }
        }

        function ageMin() {
            if(filters.AgeMin[0]) {
                setF(c[1] < parseInt(filters.AgeMin[1]));
            }
        }

        function gender() {
            if(filters.Gender[0]) {
                setF($.inArray(c[2], filters.Gender[1]) < 0);
            }
        }

        function hasAvatar() {
            // console.log('avatar ' + onlyWithAvatar.toString());
            setF((onlyWithAvatar && !c[6]) ? true : false);
        }

        function intoActivity() {
            if(filters.IntoActivity[0]) {
                setF($.inArray(c[8], filters.IntoActivity[1]) < 0);
            }
        }

        function intoStatus() {
            if(filters.IntoStatus[0]) {
                setF($.inArray(c[7], filters.IntoStatus[1])  < 0);
            }
        }

        function location() {
            if(filters.LocContains[0]) {
                setF(
                    c[4].toLowerCase().indexOf(
                        filters.LocContains[1].toLowerCase()
                    ) < 0
                );
            }
        }

        function name() {
            if(filters.NameContains[0]) {
                setF(
                    c[0].toLowerCase().indexOf(
                        filters.NameContains[1].toLowerCase()
                    ) < 0
                );
            }
        }

        function role() {
            if(filters.Role[0]) {
                setF($.inArray(c[3], filters.Role[1]) < 0);
            }
        }
    }; // Filter

    /** filter each user */
    function filterUser(n) {
        // console.log('filtering n°' + n);
        var o;
        var filter = new Refining(mCache[n]);

        return(filter.isFiltered());

    }
    /*-----------Ajax & pagination -----------------*/
    /** @param mixed (str or jQ.), a link "next" in pagination */
    function setNext(mix) {
        console.log('setNext: ');
        console.log(mix);
        var next = '';
        if(mix.nodeName === 'A') {
            next = mix.href;
        }
        else if(typeof mix == 'string') {
            next = mix;
        }
        else if(
            (typeof mix == 'function' ||
                typeof mix == 'object') &&
            $(mix).is('A')
        ) {
            next = mix.attr('href');
        }
        _pageNext = next;
        return(next);
    }

    function getNext() {
        console.log(_pageNext);
        if(_pageNext === '' || _pageNext.match(/^\s*$/)) {
            return '';
        }
        if(_pageNext.indexOf("fetlife.com") < 0) {
            return 'https://fetlife.com/' + _pageNext;
        }
        else {
            return _pageNext;
        }
    }

    function getCurrentPageNo() {
        return parseInt($(Selector.currentPage).text());
    }

    function getLastPageNum() {
        var $e = $(Selector.nextPage);
        if($e.length > 0) {
            return parseInt($e.prev().text());
        }
        $e = $(Selector.nextDisabled);
        if($e.length > 0) {
            return parseInt($e.prev().text());
        }
        return -1;
    }

    function isLastFetchedPage(next) {
        var p = next.lastIndexOf('?');
        var search;
        var S;
        if(p > -1) {
            // url.search W/o leading ?
            search = next.substr(p + 1);
        }
        else {
            // no url.search, stop now
            // TODO throw warning
            return true;
        }
        S = search.split('&');
        for(var i = 0; i < S.length; i++) {
            if(S[i].substr(0, 5) === 'page=') {
                return(parseInt(S[i].substr(5)) >= parseInt(_toPage) + 1);
            }
        }
        // unknown case, stop now
        // TODO throw warning
        return true;
    }

    function addUrlString(url, pageNb) {
        var S = location.search.toString();
        console.log('location.search: ' + S);
        if(S.length <= 0) {
            return url + "?page=" + pageNb;
        }
        if(S.indexOf('page=') > -1) {
            return url.replace(/page=\d+/, 'page=' + pageNb);
        }
        else
            return url+'&page='+pageNb;
        // FIXME: return what ? return (url + '&page=' + pageNb);
    }

    function fetchMembers(startPageNo) {

        // if (typeof startPageNo === 'undefined')
        //     seekingEnded();

        var next;

        if(startPageNo) {
            console.log('start fetching from Page: ' + startPageNo);
            if(parseInt(startPageNo) > 0) {
                setNext(addUrlString(location.href, startPageNo));
            }
        }
        else {
            startPageNo = false;
        }

        next = getNext();
        console.log("trying to fetch: " + next);

        if(
            next === '' ||
            next.match(/^\s*$/) ||
            next === void(0)
        ) {
            seekingEnded();
            return;
        }

        if(!ajaxLocked) {
            ajaxLocked = true;
            $.ajax({
                url: next,
                dataType: 'html',
                useCache: false,
                success: onMembersPage,
                error: function (event) {
                    seekingEnded();
                    console.error(event);
                }
            });
        }
        showCount();
    }

    function onMembersPage(data) {
        var aNext = $(data).find(Selector.nextPage);

        setNext(aNext);

        console.log("next page to fetch: " +
            getNext());
        var users = $(data).find(Selector.users);

        $.each(users, (i, user) => {
            show(storeUser(user));
        });

        if(!stopped && !isLastFetchedPage(getNext())) {
            setTimeout(
                function () {
                    ajaxLocked = false;
                    fetchMembers(false);
                }, (FETCH_LATENCY < 0 ? FETCH_LATENCY : 0)
            );
        }
        else {
            seekingEnded();
        }
    }


    function showInfo(str) {
        $I('ShowCount').html(str);
    }

    function showCount() {
        showInfo("members: " + _shownCount + " of " + members.length);
    }

    function show(n) {
        if(!filterUser(n)) {
            $(listContainers[alternColumn]).append(members[n]);
            _shownCount++;
            alternColumn = (alternColumn == (listContainers.length - 1)) ?
                0 : (
                    alternColumn + 1);
        }
    }
    // TODO for 2.0
    // var Cache  = function () {}
    //
    // var Member = function () {
    //
    //     htmlCache = [];
    //
    //
    //     var isfilter = function (n) { Refining.isFiltered()}
    //     var store = function () {};
    //
    //     this.add = function () {};
    //     this.show = function () {};
    //     this.get = function (n) {};
    //
    //     return this;
    // };

    function storeUser(user) {
        console.log(user);
        var i = (members.push(user) - 1);
        // TODO add page num
        var matches = []; /* match: [whole, age (not null), gender, role ] */
        var firstSpan = $(user).find(Selector.user.firstSpan);
        var C, into;
        var avatar = $(user).find(Selector.user.imageAvatar);
        mCache[i] = ['', 0, '', '', '', '', false, '', ''];
        C = mCache[i];
        /* name */
        C[0] = firstSpan.text();
        /** profile url */
        C[5] = firstSpan.find(Selector.user.profileLink).attr('href');
        /** hasAvatar, need to be false if user has */
        C[6] = (avatar.attr('src').indexOf('/images/avatar_missing') < 0) ?
            true :
            false;
            console.log($(user).find(Selector.user.shortDesc));
        matches = $(user)
        .find(Selector.user.shortDesc).text()
        .replace(/\n|\r/g,' ')
        .replace(/\s{1,}|\n|\r/g,' ')
        .match(userRegExp);
        //   console.log("match: "+(M[1]||"")+", "+(M[2]||"")+", "+(M[3]||""));
        /* age */
        C[1] = matches[1];
        /* gender */
        C[2] = matches[2];
        /* role */
        C[3] = matches[3];
        /* location*/
        C[4] = $(user).find(Selector.user.location).text() || '';
        /* into */
        if(isFetishesPage) {
            matches = []; /* match: ["into status", "rest aka into activity" ] */
            into = $(user).find(Selector.user.into).text() || '';
            console.log('into: '+into);
            matches = into.match(regInto);
            console.log(matches);
            if(matches) {
                C[7] = matches[1] || '';
                C[8] = matches[2] || '';
            }
            //     console.log("mCache[i][7] = "+C[7]+"  &&  mCache[i][8] = "+C[8])
        }
        console.log(C);
        return i;
    }

    function initCache() {
        M = []; // TODO undef ?
        members = [];
        mCache = [];
    }

    function clearCache() {
        members = [];
        mCache = [];
    }

    function gC(n) {
        return mCache[n];
    }

    function getCache(n) {
        return gC(n);
    }
    /*--------------helpers---------------*/
    function isInt(n) {
        return(!isNaN(n));
    }

    /*--------------Actions--------------*/
    function init() {
        var $pageNext = $(Selector.nextPage);
        var $previousPage = $(Selector.previousPage);
        var $pageUsers = $(Selector.users);
        var $fromPage = $I('FromPage');

        /** next_page link and list of members are on current page ? go on */
        if(($pageNext.length > 0 || $previousPage.length > 0) &&
            $pageUsers.length > 0
        ) {
            _clientPageNo = _pageCurrentNo = getCurrentPageNo();
            initContainers($pageUsers);

            console.log('_pageCurrentNo :' + _pageCurrentNo);

            drawBlock();
            $I('FromPage').val(
                useCurrentPageAsDefault ?
                _pageCurrentNo :
                1
            );
            pageMax = lastPageNumber = getLastPageNum();
            console.log("lastPageNumber: " + lastPageNumber);
            $I('ToPage').val(lastPageNumber);
            setNext($pageNext);
            initListener();
        }
    }

    function showFilterAgain() {

        $I('ButtonGo').val("filter\x20again");
        enableAllInput();

        $I('ButtonGo').bind('click', () => {
            if(updatePaginationFilters()) {
                launchAgain();
                $(this).unbind('click');
            }
            else {
                filterAgain();
            }
        });
    }

    function initListener() {
        $I('Controls').click(function () {
            $I('Content').toggle("slow");
            toggleMarker($(this).find('b:first'));
        });
        $I('ButtonCurrentPage').click(function () {
            $I('FromPage').val(_pageCurrentNo);
        });
        $I('ButtonGo').click(function () {
            $(this).unbind('click');
            launchSearch();

        });
        $I('ButtonStop').click(function () {
            // $(this).unbind('click');
            stopped = true;
        });
    }

    function launchSearch() {
        if(!scriptLaunched) {
            updatePaginationFilters();
            console.log("_fromPage: " + _fromPage);
            console.log("_toPage: " + _toPage);
            showInfo("loading ...");
            updateMemberFilters();
            updateAvatarFilter();
            cleanPage();
            disableAllInput();
            fetchMembers(_fromPage);
            scriptLaunched = true;
        }
    }

    function launchAgain() {
        cleanPage();
        clearCache();
        scriptLaunched = false;
        launchSearch();
    }

    function filterAgain() {
        alternColumn = 0;
        // window.scrollTo(0, 0);
        updateMemberFilters();
        updateAvatarFilter();
        cleanPage();
        for(var i = 0; i < members.length; i++) {
            show(i);
        }
        showCount();
    }
    /** due to recursive function*/
    function seekingEnded() {
        console.log("total members: " + members.length);
        ajaxLocked = false;
        stopped = false;
        enableAllInput();
        showFilterAgain();
        showCount();
    }
    /* jshint ignore:start */
    var count = 0;
    if(typeof $ == 'function') {
        init();
    }
    else {
        setTimeout(function () {
            if(typeof $ !== 'function') {
                alert('fetlife is modified, script ' +
                    GM_info.script.name +
                    'can\'t run please contact the author.');
            }
        }, 3000);
    }
    /*-----------------------------------*/
})(jQuery);
jQuery.noConflict(true);
/* jshint ignore:end */
