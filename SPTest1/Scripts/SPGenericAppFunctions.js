function UpdateSelectedItemChanged() {
    $('#UpdateTitle').val($('#UpdateItems :selected').text());
}

// occurs when a user clicks the create button
function Create() {
    
    var listName = $('#listName').val();
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var title = $('#Create_Title').val();
    createListItemWithDetails(listName, url, title, function () {
        alert("Item has been created. Updating available items");
        Read();
    }, function (data) {
        alert("Ooops, an error occured. Please try again: " + data);
    });
}

// occurs when a user clicks the read button
function Read() {
    //clear both text boxes 
    $('#UpdateTitle').val('');
    $('#Create_Title').val('');

    var listName = $('#listName').val();
    var url = _spPageContextInfo.siteAbsoluteUrl;

    $("#divDebug").html($("#divDebug").html() + "<br>" + url);

    getListItems(listName, url, function (data) {
        var items = data.d.results;

        // remove all of the previous items
        $('#UpdateItems option').each(function (index, option) { $(option).remove(); });
        $('#DeleteItems option').each(function (index, option) { $(option).remove(); });

        // Add all the new items
        for (var i = 0; i < items.length; i++) {
            $('#UpdateItems').append(new Option(items[i].Title, items[i].Id, false, false));
            $('#DeleteItems').append(new Option(items[i].Title, items[i].Id, false, false));

        }
    }, function (data) {
        alert("Ooops, an error occured. Please try again");
    });
}

// occurs when a user clicks the update button
function Update() {
    var listName = $('#listName').val();
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var itemId = $('#UpdateItems').val();
    var title = $('#UpdateTitle').val();
    updateListItem(itemId, listName, url, title, function () {
        alert("Item updated, refreshing avilable items");
        Read();
    }, function () {
        alert("Ooops, an error occured. Please try again");
    });

}

// occurs when a user clicks the delete button
function Delete() {
    var listName = $('#listName').val();
    var url = _spPageContextInfo.siteAbsoluteUrl;
    var itemId = $('#DeleteItems').val();
    deleteListItem(itemId, listName, url, function () {
        alert("Item deleted, refreshing avilable items");
        Read();
    }, function () {
        alert("Ooops, an error occured. Please try again");
    });
}

// Delete Operation
// itemId: the id of the item to delete
// listName: The name of the list you want to delete the item from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function deleteListItem(itemId, listName, siteUrl, success, failure) {
    getListItemWithId(itemId, listName, siteUrl, function (data) {
        $.ajax({
            url: data.__metadata.uri,
            type: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-Http-Method": "DELETE",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "If-Match": data.__metadata.etag
            },
            success: function (data) {
                success(data);
            },
            error: function (data) {
                failure(data);
            }
        });
    },
   function (data) {
       failure(data);
   });
}


// Update Operation
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. // title: The value of the title field for the new item
// itemId: the id of the item to update
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function updateListItem(itemId, listName, siteUrl, title, success, failure) {
    var itemType = GetItemTypeForListName(listName);

    var item = {
        "__metadata": { "type": itemType },
        "Title": title
    };

    getListItemWithId(itemId, listName, siteUrl, function (data) {
        $.ajax({
            url: data.__metadata.uri,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": data.__metadata.etag
            },
            success: function (data) {
                success(data);
            },
            error: function (data) {
                failure(data);
            }
        });
    }, function (data) {
        failure(data);
    });
}

// READ SPECIFIC ITEM operation
// itemId: The id of the item to get
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function getListItemWithId(itemId, listName, siteurl, success, failure) {
    var url = siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items?$filter=Id eq " + itemId;
    $.ajax({
        url: url,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            if (data.d.results.length == 1) {
                success(data.d.results[0]);
            }
            else {
                failure("Multiple results obtained for the specified Id value");
            }
        },
        error: function (data) {
            failure(data);
        }
    });
}

// READ operation
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function getListItems(listName, siteurl, success, failure) {
    $.ajax({
        url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items?$top=1000",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}

// SEARCH Operation
// SubjectKeyword: The name of the title you want to search
// DateFrom: The date from filter
// success: The function to execute if the call is sucessfull
// failure: The function to execute if the call fails
function getSearchMeetingItems(SubjectKeyword,DateFrom,DateTo,Status, success, failure)
{
    var date1 = new Date(DateFrom);
    var date2 = new Date(DateTo);
    date2.setTime(date2.getTime() + 24 * 60 * 60 * 1000);  // adjust for HK time

    var filterConstruct = '';

    if (DateFrom != "" & DateTo != "")
        filterConstruct = "(MeetingDateTime ge datetime'" + date1.toISOString() + "' and MeetingDateTime le datetime'" + date2.toISOString() + "')%20and%20";
    else if (DateFrom != "")
        filterConstruct = "(MeetingDateTime ge datetime'" + date1.toISOString() + "')%20and%20";
    else if (DateTo != "")
        filterConstruct = "(MeetingDateTime le datetime'" + date2.toISOString() + "')%20and%20";

    if (SubjectKeyword != "")
        filterConstruct += "substringof('" + SubjectKeyword + "', Title)%20and%20";

    filterConstruct += "(MeetingStatus%20eq%20'" + Status + "')";

    console.log(siteurl + "/_api/web/lists/getbytitle('MeetingList')/items?$filter=" + filterConstruct)

    $.ajax({
        url: siteurl + "/_api/web/lists/getbytitle('MeetingList')/items?$filter=" + filterConstruct + "&$orderby=MeetingDateTime&$top=1000",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}

// CREATE Operation
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. // title: The value of the title field for the new item
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function createListItemWithDetails(listName, siteUrl, title, success, failure) {

    var itemType = GetItemTypeForListName(listName);
    var item = {
        "__metadata": { "type": itemType },
        "Title": title
    };

    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(item),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}

function GetItemTypeForListName(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.slice(1) + "ListItem";
}

function GetGroupUsers(groupName, success, failure) {
    $.ajax({
        url: siteurl + "/_api/web/sitegroups/getbyname('" + groupName + "')/users",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });

}

// Add user to group is broekn
function AddUserToGroup(siteurl, groupName, loginName, success, failure) {

    console.log("addingto:" + siteurl + "/_api/web/sitegroups/getbyname('" + groupName + "')/users");
    $.ajax({
        url: siteurl + "/_api/SP.AppContextSite(@target)/web/sitegroups/getbyname('" + groupName + "')/users?@target='" +siteurl + "'",
        method: "POST",
        body: "{ '__metadata': { 'type': 'SP.User' }, 'LoginName':'" + loginName + " ' }",
        headers: {
            "accept": "application/json; odata=verbose",
            "content-type": "application/json; odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });


    /*
    $.ajax({
        url: siteurl + "/_api/web/sitegroups/getbyname('" + groupName + "')/users",
        method: "POST",
        body: "{ '__metadata': { 'type': 'SP.User' }, 'LoginName':'" + loginName + "' }",
        headers: {
            "Accept": "application/json; odata=verbose",
            "content-type": "application/json; odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });*/
}

function ShowLoadingPage(show)
{
    if ($("div#ajax").length <= 0) {
        $("body").append("<div id='ajax' style='z-index:50'><div id='loading'><img src='../Images/loading-blue.gif' width='200' /></div></div>");
    }
    if (show)
    {
        $("div#ajax").show();
    }
    else
    {
        $("div#ajax").hide();
    }
}

function ShowDialogMessage(Message, ok, cancel)
{
    ok = typeof ok != 'undefined' ? ok : false;
    cancel = typeof cancel != 'undefined' ? cancel : false;
    // need to add an overlay
    // needs a redirect url
    // needs a cancel box

    if ($("div#overlay").length <= 0)
    {
        $("body").append("<div id='overlay' style='z-index:10'><div id='box'></div></div>")
    }
    else
    {
        $("div#overlay").show();
    }

    $("div#box").html(Message);
    //var onclick = "$('div#overlay').hide();";
    if (ok)
    {
        var msg = $("div#ok").html();
        //$("div#box").append("<a href=\"#\" onclick=\"$('div#overlay').hide();\">" + msg + "</a>");
        $("div#box").append("<a href=\"#\" class=\"mk-btn right-corners left-corners msg-btn\" onclick=\"$('div#overlay').hide();\">" + msg + "</a>");
    }
    if (cancel)
    {
        var msg = $("div#cancel").html();
        //$("div#box").append("<a href=\"#\" onclick=\"$('div#overlay').hide();\">" + msg + "</a>");
        $("div#box").append("<a href=\"#\" class=\"mk-btn right-corners left-corners btn-float-right msg-btn\" onclick=\"$('div#overlay').hide();\">" + msg + "</a>");
    }
}

function getListItemsFiltered(listName, siteurl, success, failure, complete, filter) {
    $.ajax({
        url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items/?$filter=" + filter,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        },
        complete: function () {
            complete();
        }
    });
}

function getListItemsFilteredCompletedOrderBy(listName, siteurl, success, failure, complete, filter, orderby) {
    $.ajax({
        url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items/?$filter=" + filter + "&$orderby=" + orderby,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        },
        complete: function () {
            complete();
        }
    });
}

function getListItemsFilteredOrderBy(listName, siteurl, success, failure, filter, orderby) {
    $.ajax({
        //url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items/?$select=ID,Title,Agenda_CHI,MeetingID,Responsible_ENG,Duration,ItemNo&$filter=" + filter + "&$orderby=ItemNo",
        url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items/?$filter=" + filter + "&$orderby=" + orderby,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data);
        },
        error: function (data) {
            failure(data);
        }
    });
}


// function to align all version numbers
//
//- Meeting List
//- Meeting Minutes
//- Action Items
//- Meeting Agree List
//- MeetingAnnouncements
function UpdateMeetingVersion(meetingId, hostUrl, newVersion, updateMins, updateActions, updateAnnouncements)
{
    var listName = "MeetingList";
    var item = {
        "__metadata": { "type": itemType },
        "Version": newVersion
    };

    getListItemWithId(meetingId, listName, hostUrl, function (data) {
        $.ajax({
            url: data.__metadata.uri,
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": data.__metadata.etag
            },
            success: function (data) {
                // all done
            },
            error: function (data) {
                console.log("failed to set version number:" + JSON.stringify(data));
            }
        });
    }, function (data) {
        console.log("failed to set version number" + JSON.stringify(data));
    });
}

function GetMeetingStatusId(meetingStatus)
{
    var meetingStatusString = "";
    if (meetingStatus == "MeetingCreated") {
        meetingStatusString = "meetingcreatedstring";
    }
    else if (meetingStatus == "AgendaCreated") {
        meetingStatusString = "agendacreatedstring";
    }
    else if (meetingStatus == "AgendaFinalized") {
        meetingStatusString = "agendafinalizedstring";
    }
    else if (meetingStatus == "MeetingHeld") {
        meetingStatusString = "meetingheldstring";
    }
    else if (meetingStatus == "MinutesStarted") {
        meetingStatusString = "minutesstartedstring";
    }
    else if (meetingStatus == "MinutesCreated") {
        meetingStatusString = "minutescreatedstring";
    }
    else if (meetingStatus == "MeetingFinalized") {
        meetingStatusString = "meetingfinalizedstring";
    }
    else if (meetingStatus == "MeetingStarted") {
        meetingStatusString = "meetingstartedstring";
    }
    else {
        // cancelled
        meetingStatusString = "#meetingcancelledstring";
    }
    return meetingStatusString;
}

function GetMeetingStatusString(meetingStatus)
{
    var meetingStatusString = "";
    if (meetingStatus == "MeetingCreated") {
        meetingStatusString = $("#meetingcreatedstring").html();
    }
    else if (meetingStatus == "AgendaCreated") {
        meetingStatusString = $("#agendacreatedstring").html();
    }
    else if (meetingStatus == "AgendaFinalized") {
        meetingStatusString = $("#agendafinalizedstring").html();
    }
    else if (meetingStatus == "MeetingHeld") {
        meetingStatusString = $("#meetingheldstring").html();
    }
    else if (meetingStatus == "MinutesStarted") {
        meetingStatusString = $("#minutesstartedstring").html();
    }
    else if (meetingStatus == "MinutesCreated") {
        meetingStatusString = $("#minutescreatedstring").html();
    }
    else if (meetingStatus == "MeetingFinalized") {
        meetingStatusString = $("#meetingfinalizedstring").html();
    }
    else if (meetingStatus == "MeetingStarted") {
        meetingStatusString = $("#meetingstartedstring").html();
    }
    else {
        // cancelled
        meetingStatusString = $("#meetingcancelledstring").html();
    }
    return meetingStatusString;
}

function GetDateTimeString(sharePointDateTime)
{

}

// READ SPECIFIC ITEM operation with return function completed
// itemId: The id of the item to get
// listName: The name of the list you want to get items from
// siteurl: The url of the site that the list is in. 
// success: The function to execute if the call is sucesfull
// failure: The function to execute if the call fails
function getListItemWithIdDeferred(itemId, listName, siteurl, success, failure) {
    var deferred = $.Deferred(function () {

        var url = siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items?$filter=Id eq " + itemId;
        $.ajax({
            url: url,
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {
                if (data.d.results.length == 1) {
                    success(data.d.results[0]);
                }
                else {
                    failure("Multiple results obtained for the specified Id value");
                }
                deferred.resolve();
            },
            error: function (data) {
                failure(data);
            }
        });

    });
    return deferred.promise();

}

function GetAttachmentsByItemId(itemId, listName, hostUrl, success ,id) {
    var attachmentUrl;

    $.ajax({
        //url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items/?$select=ID,Title,Agenda_CHI,MeetingID,Responsible_ENG,Duration,ItemNo&$filter=" + filter + "&$orderby=ItemNo",
        url: hostUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + itemId + ")/attachmentFiles/",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            success(data ,id);
        },
        error: function (data) {
            console.log(JSON.stringify(data));
        }
    });

    
}