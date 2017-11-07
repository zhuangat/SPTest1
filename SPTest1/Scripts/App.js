'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

var context;
var user;
var layoutsurl = "_layouts/15";
var user1;
var userlistid = {};
var userlistlogin = {};
var userlistnames = {};
var siteurl;
var appUrl;
var hostUrl;

var curAppInstanceId = "";
var collListItem = '';

function initializePage()
{
    context = SP.ClientContext.get_current();
    user = context.get_web().get_currentUser();

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {
        //getUserName();
        LoadRecords();
    });

    PageLoadedREST();
    /*
    // This function prepares, loads, and then executes a SharePoint query to get the current users information
    function getUserName() {
        context.load(user);
        context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
    }

    // This function is executed if the above call is successful
    // It replaces the contents of the 'message' element with the user name
    function onGetUserNameSuccess() {
        $('#message').text('Hello ' + user.get_title());
    }

    // This function is executed if the above call fails
    function onGetUserNameFail(sender, args) {
        alert('Failed to get user name. Error:' + args.get_message());
    }
    */
}

function CreateRecord() {

    var title = $("input#txtTitle").val();
    var description = $("textarea#txtDescription").val();
    var status = $("select#sltStatus").val();

    console.log("title: " + title);
    console.log("Desc: " + description);
    console.log("Status: " + status);

    var oList = context.get_web().get_lists().getByTitle('NewList1');
    var itemCreateInfo = new SP.ListItemCreationInformation();
    var oListItem = oList.addItem(itemCreateInfo);
    oListItem.set_item('Title', title);
    oListItem.set_item('Desc', description);
    oListItem.set_item('Status', status);
    oListItem.update();

    LoadRecords();
    //context.load(oListItem);
    //context.executeQueryAsync(onItemsLoadSucceeded, onItemsLoadFailed);

    // only add meeting on successfully added to group
    /*
    AddNewItem(
            title,
            description,
            onItemUpdateSuccess,
            onItemUpdateFailure
        );*/

}

function LoadRecords() {
    var oList = context.get_web().get_lists().getByTitle('NewList1');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><RowLimit>100</RowLimit></View>');
    collListItem = oList.getItems(camlQuery);
    context.load(collListItem);
    context.executeQueryAsync(onItemsLoadSucceeded, onItemsLoadFailed);
}

function onItemsLoadSucceeded() {
    var listItemInfo = '<tr><th>ID</th><th>Title</th><th>Description</th><th>Status</th><th>Action</th></tr>';

    var listItemEnumerator = collListItem.getEnumerator();

    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        //listItemInfo = listItemInfo + '<li>' + oListItem.get_item('Title') + ' ' + oListItem.get_item('Description') + '</li>';
        listItemInfo = listItemInfo + '<tr><td>' + oListItem.get_item('ID') + '</td><td>' + oListItem.get_item('Title') + '</td><td>' + oListItem.get_item('Desc') + '</td><td>' + oListItem.get_item('Status') + '</td><td><button type="button" onclick="DeleteItem(' + oListItem.get_item('ID') + ')">Delete</button>';

        if (oListItem.get_item('Status') == "Submitted")
        {
            listItemInfo = listItemInfo + '<button type="button" onclick="ApproveItem(' + oListItem.get_item('ID') + ')">Approve</button>';
            listItemInfo = listItemInfo + '<button type="button" onclick="RejectItem(' + oListItem.get_item('ID') + ')">Reject</button>';
        }


        listItemInfo = listItemInfo + '</td></tr>';
    }

    $('#tblItemList').html(listItemInfo);
}

function onItemsLoadFailed(sender, args) {
    alert("Failed loading notes" + args.get_message()); 
}

function ApproveItem(id) {
    var listName = "NewList1";
    var itemType = GetItemTypeForListName(listName);

    var posturl = hostUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + id + ")";

    var item = {
        "Status": "Approved"
    };

    var itemNew = {
        '__metadata': { 'type': GetItemTypeForListName(listName) }
    };
    for (var prop in item) {
        itemNew[prop] = item[prop];
    }

    $.ajax({
        url: posturl,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(itemNew),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*"
        },
        success: function (data) {
            console.log("Item updated");
            LoadRecords();
        },
        error: function (data) {
            console.log("Item cannot be updated");
            LoadRecords();
        }
    });
}

function RejectItem(id) {
    var listName = "NewList1";
    var itemType = GetItemTypeForListName(listName);

    var posturl = hostUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + id + ")";

    var item = {
        "Status": "Rejected"
    };

    var itemNew = {
        '__metadata': { 'type': GetItemTypeForListName(listName) }
    };
    for (var prop in item) {
        itemNew[prop] = item[prop];
    }

    $.ajax({
        url: posturl,
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(itemNew),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*"
        },
        success: function (data) {
            console.log("Item updated");
            LoadRecords();
        },
        error: function (data) {
            console.log("Item cannot be updated");
            LoadRecords();
        }
    });
}



function DeleteItem(id) {
    var listName = "NewList1";
    var itemType = GetItemTypeForListName(listName);

    var posturl = hostUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + id + ")";
    
    $.ajax({
        url: posturl,
        type: "DELETE",
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "IF-MATCH": "*"
        },
        success: function (data) {
            console.log("Item deleted");
            LoadRecords();
        },
        error: function (data) {
            console.log("Item cannot be deleted");
            LoadRecords();
        }
    });
}

function AddNewItem(title, description, success, failure) {
    var listName = "NewList1";
    var itemType = GetItemTypeForListName(listName);
    var item = {
        "__metadata": { "type": itemType },
        "Title": title, // using static names
        "Description": description
    };

    var posturl = hostUrl + "/_api/web/lists/getbytitle('" + listName + "')/items";
    console.log("posturl: " + posturl);
    console.log("item: " + JSON.stringify(item));
    alert(11);
    $.ajax({
        url: posturl,
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
    alert(22);
}

function onItemUpdateSuccess(data) {
    alert("success");
}

function onItemUpdateFailure(data) {
    alert("failed");
}

function PageLoadedREST() {
    if (document.URL.indexOf('?') != -1) {
        var params = document.URL.split('?')[1].split('&');
        for (var i = 0; i < params.length; i++) {
            var p = decodeURIComponent(params[i]);
            if (/^SPAppWebUrl=/i.test(p)) {
                hostUrl = p.split('=')[1];// + "/..";
                appUrl = p.split('=')[1];
                break;
            }
            if (/^MID=/i.test(p)) {
                mID = p.split('=')[1];
            }
        }
    }
}