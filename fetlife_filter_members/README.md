## -------------------WARNING--------------------

**
    The usage of this kind of script can now result in a fetlife account BANNING.**
Don't launch multiple filter at once !

## -------------------WARNING--------------------

probably removed in a next future.

**Script Summary**: easy way to search fetlife.com users. It adds a form where a members list is
    avalaible on fetlife to see them all on the current page. Filtering is
    available: name contains, location contains, age, gender, role and status.
    Version: 1.9.1 Tip:
**hold ctrl-key when clicking in selectors**
to use the multi-criterias.

**--NOT FULLY TESTED--**
may work well. feedback welcome. Seeking for members in fetlife ? click "filter
    members" (over the list) and let all the members in selected pages appear. Add
    criterias (name, gender, role, age, location or status), and wait all users are
    loaded to re-filter. It may work anywhere a list of user is available. What that
    script is not: - global. It doesn't pretend to be a search engine. - a gateway.
    No data nor profile is sent to a third party site. No proxy is used. We are not
    data points ! - a licenced script. You use it under the term of the IDGAD
    licence. Do whatever you want with it. No warranty (even success).

samples:

[
    ![bewam.github.io animated example 01 ](https://bewam.github.io/fetlife_all_members_-ASL+role+status_filter-/assets/images/01.gif )
](https://bewam.github.io/fetlife_all_members_-ASL+role+status_filter-/assets/images/01.gif )

[
    ![bewam.github.io animated example 02 ](https://bewam.github.io/fetlife_all_members_-ASL+role+status_filter-/assets/images/02.gif )
](https://bewam.github.io/fetlife_all_members_-ASL+role+status_filter-/assets/images/02.gif )

@
_February 29th 2016_:

*  fix new html classes. Is fetlife going to v5 ?
* change update github repository. compact all userscript in a folder. :crossfingers:

@
_November 11th 2015_:

*   fix a bug that prevent to re-filter.
*   fix a bug with search query "page" missing.

@
_November 10th 2015_
version:

*   create a branch for es5.

@
_July 8th 2015_
version:

*   start clean oop for v2 (Refining, Member, Cache).
*   cleaner code.
*   advanced pagination support.
*   added a button stop.

@
_June 22th 2015_
version:

*   added new roles
*   changed name to filter (not a global search)
*   move UI in to a better place
*   make proper, order some code
*   start complete page handling, ...
*   wish happy summer.

@
_March 13th 2015_
version:

*   bugFix: "with avatar" display some without it

@
_February 23th 2015_
version:

*   Go to page 1, click current to start from current page.
*   in-script option to start at current page by default. modify
        "useCurrentPageAsDefault" to do so.
*   other

@
_February 12th 2015_
version:

*   Go to page 1, wherever you're on.
*   Hide pagination.

@
_December 26th 2014_
version:

*   Change to more explicit name. Added 2 new roles to match fetlife ones.

@
_October 3d 2014_
version:

*   Set the color to white. avatar checkbox works again.

@
_June 23th 2014_
version: Works again (probably due to unsafeWindow changes ).

*   Now downloads the Library jQuery (
        [https://jquery.com](https://jquery.com)).
*   added the metadata block @updateURL. Was missing since moving from
            userscripts.org.

@
_June 04th 2014_
version:

*   minor improvement, the form is now hidden first and takes a row.

@
_June 17th 2014_
version:

*   retrieved (web.archive.org) & writing change log from userscripts.org

@(1.8.1)
_date ?_
version:

*   added the possibility to search with status & likings.

@
_july 19th 2013_
version:

*   added the age filter, to find people on fetlife near the age you seek.

@(1.6.1)
_july 18th_
version:

*   added the possiblity to search membres of fetlife by multiple criterias (group
        search). Can search different roles or genders in one way.

@
_older_
version:

*   filters added (location, gender, role, has avatar, name)
*   quicker

@
_TODO_:

*   1.9.2 (remove trailing date, let history flows) http://semver.org/
*   handle stop event and user pages.
*   gitify project
*   locker, remove warning
*   a nice, clean, reforged code.(2.0)
*   ergonomic UI
*   an icon.
*   a donation button ? many hours of dev now.
