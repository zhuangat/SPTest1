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
var timeZone;

var curAppInstanceId = "";
var collListItem = '';

function initializePage()
{
    context = SP.ClientContext.get_current();
    user = context.get_web().get_currentUser();



    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {
        getUserName(user);
        getRegionalSettings();
        initializePeoplePicker('PeoplePickerDiv');
        initializeDatePickers(hostUrl + '/_layouts/15');
        LoadRecords();
    });

    PageLoadedREST();
    
    // This function prepares, loads, and then executes a SharePoint query to get the current users information
    function getUserName() {
        context.load(user);
        context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
    }

    // This function is executed if the above call is successful
    // It replaces the contents of the 'message' element with the user name
    function onGetUserNameSuccess() {
        console.log('Hello, ' + user.get_title());
        $('span#UsernameLabel').text('Hello, ' + user.get_title());

    }

    // This function is executed if the above call fails
    function onGetUserNameFail(sender, args) {
        alert('Failed to get user name. Error:' + args.get_message());
    }

    function getRegionalSettings()
    {
        timeZone = context.get_web().get_regionalSettings().get_timeZone();
        context.load(timeZone);
        context.executeQueryAsync(onGetRegionalSettingsSuccess, onGetRegionalSettingsFail);
    }

    function onGetRegionalSettingsSuccess()
    {
        //console.log(timeZone.get_description());
    }
    function onGetRegionalSettingsFail(sender, args) {
        alert('Failed to get RegionalSettings. Error:' + args.get_message());
    }


    function initializePeoplePicker(peoplePickerElementId, AllowMultipleValues = false)
    {
        // Create a schema to store picker properties, and set the properties.
        var schema = {};
        schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
        schema['SearchPrincipalSource'] = 15;
        schema['ResolvePrincipalSource'] = 15;
        schema['AllowMultipleValues'] = AllowMultipleValues;
        schema['MaximumEntitySuggestions'] = 50;
        schema['AutoFillEnabled'] = true;
        schema['Required'] = true;
        schema['Width'] = '100%';

        SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
    }
    
}

function initializeDatePickers(urlWithLayouts, mindate, maxdate) {
    var calendarOptions = [];

    if (mindate == null) {
        mindate = 109207;
    }
    if (maxdate == null) {
        maxdate = 2666269;
    }

    calendarOptions.push(urlWithLayouts + '/iframe.aspx?');
    calendarOptions.push('&cal=1');
    calendarOptions.push('&lcid=1033');
    calendarOptions.push('&langid=1033');
    calendarOptions.push('&tz=+08:00:00.0002046');
    calendarOptions.push('&ww=0111110');
    calendarOptions.push('&fdow=0');
    calendarOptions.push('&fwoy=0');
    calendarOptions.push('&hj=0');
    calendarOptions.push('&swn=false');
    calendarOptions.push('&minjday=' + mindate);
    calendarOptions.push('&maxjday=' + maxdate);
    calendarOptions.push('&date=');

    $('.DT').each(function (index) {
        var id = $(this).attr('id');

        $(this).after('<iframe id="' + id + 'DatePickerFrame" title="Select a date from the calendar." style="display:none; position:absolute; width:200px; z-index:101;" src="/_layouts/15/images/blank.gif?rev=23"></iframe>');
        $(this).after('<a href="#" style="vertical-align:top;"><img id="' + id + 'DatePickerImage" border="0" alt="Select a date from the calendar." src="/_layouts/15/images/calendar_25.gif?rev=23"></a>');
        var sonclick = 'clickDatePicker("' + id + '", "' + calendarOptions.join('') + '", \'\', event); return false;';
        $(this).next('a').attr('onclick', sonclick);
    });
}

function OnDatePicked(data) {
    console.log("Date Picker Changed:" + JSON.stringify(data));
}


function CreateRecord() {

    var title = $("input#txtTitle").val();
    var description = $("textarea#txtDescription").val();
    var status = $("select#sltStatus").val();
    var startDate = $("input#txtStartDate").val();
    var endDate = $("input#txtEndDate").val();
    var managerTitle = '';
    var mt = '';

    if ($('.ms-formvalidation sp-peoplepicker-errormsg').length || SPClientPeoplePicker.SPClientPeoplePickerDict.PeoplePickerDiv_TopSpan.GetAllUserInfo()[0] == null)
    {
        alert("Invaild UserName field.");
        return;
    }


    managerTitle = SPClientPeoplePicker.SPClientPeoplePickerDict.PeoplePickerDiv_TopSpan.GetAllUserInfo()[0].Key;
    mt = managerTitle.replace("i:0#.f|membership|", "");
    //console.log(mt);
    
        

    console.log("title: " + title);
    console.log("Desc: " + description);
    console.log("Status: " + status);
    console.log("Manager Title: " + mt);
    console.log("Start Date: " + ISOFormatDate(startDate, timeZone));
    console.log("End Date: " + ISOFormatDate(endDate, timeZone));

    var oList = context.get_web().get_lists().getByTitle('NewList1');
    var itemCreateInfo = new SP.ListItemCreationInformation();
    var oListItem = oList.addItem(itemCreateInfo);
    oListItem.set_item('Title', title);
    oListItem.set_item('Desc', description);
    oListItem.set_item('Status', status);
    oListItem.set_item('ManagerTitle', mt);
    oListItem.set_item('StartDate1', ISOFormatDate(startDate, timeZone));
    oListItem.set_item('EndDate1', ISOFormatDate(endDate, timeZone));
    oListItem.update();
    
    
    context.load(oListItem);
    //context.executeQueryAsync(onItemsLoadSucceeded, onItemsLoadFailed);
    //Get updated ID for attachment Update
    context.executeQueryAsync(function () {
        var id = oListItem.get_item("ID");
        var fileControls = $("#getFile");
        if (fileControls[0].files[0] != null)
            UploadAttachment(id, fileControls[0], 'NewList1');
        else
            LoadRecords();
        console.log("Item Added. ID: " + id);
        
    }, function (sender, args) {
        alert("Failed getting ID " + args.get_message()); 
    });

    // only add meeting on successfully added to group
    /*
    AddNewItem(
            title,
            description,
            onItemUpdateSuccess,
            onItemUpdateFailure
        );*/

    

}

function UploadAttachment(id, fileInput, listName)
{
    //Check for HTML 5 file reader.
    if (!window.FileReader)
        throw "The browser does not support HTML 5";
    var file = fileInput.files[0];
    var fileName = file.name;
    getFileBuffer(file).then( function (buffer)
    {
        UploadAttachmentSP(id, fileName, buffer, listName).done(function () { LoadRecords(); });
        }, function () {
            alert("Get Buffer Failed.");
            LoadRecords();
        }
    )
}

//Get buffer
function getFileBuffer(file)
{
    var def = new $.Deferred();
    var reader = new FileReader();
    reader.onloadend = function (e) {
        def.resolve(e.target.result);
    }
    reader.onerror = function (e) {
        def.reject(e.target.error);
    }
    reader.readAsArrayBuffer(file);
    return def.promise();
}

function UploadAttachmentSP(id, fileName, buffer, listName) {
    console.log("uploadAttachment");
    var url = hostUrl +
        "/_api/web/lists/getByTitle('" + listName + "')/items('" + id.toString() + "')/AttachmentFiles/add(FileName='" + fileName + "')";
    return $.ajax({
        url: url,
        type: "POST",
        data: buffer,
        processData: false,
        headers: {
            Accept: "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Content-Length": buffer.byteLength,
            "IF-MATCH": "*"
        }
    });
}

function ISOFormatDate(date,timeZone)
{
    var tz = timeZone.get_description();
    tz = tz.slice(4, 10);
    //console.log(tz);

    var pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
    var sdate = date.replace(pattern, '$3-$1-$2') + "T" + "00:00:00" + tz;
    var mm =date.split("/");
    var mnewdate = mm[2] + "-" + ("0" + mm[0]).slice(-2) + "-" + ("0" + mm[1]).slice(-2) + "T" + "00:00:00" + tz;
    if (sdate.includes("/"))
        return mnewdate;
    else
        return sdate;
}




function LoadRecords() {
    

    var oList = context.get_web().get_lists().getByTitle('NewList1');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where></Where></Query><RowLimit>100</RowLimit></View>');
    collListItem = oList.getItems(camlQuery);
    context.load(collListItem);
    context.executeQueryAsync(onItemsLoadSucceeded, onItemsLoadFailed);
}

function onItemsLoadSucceeded() {
    var listItemInfo = '<tr><th>ID</th><th>Title</th><th>Description</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Attachments</th><th>Action</th></tr>';

    var listItemEnumerator = collListItem.getEnumerator();

    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();


        //listItemInfo = listItemInfo + '<li>' + oListItem.get_item('Title') + ' ' + oListItem.get_item('Description') + '</li>';
        listItemInfo = listItemInfo + '<tr><td>' + oListItem.get_item('ID') +
            '</td><td>' + oListItem.get_item('Title') +
            '</td><td>' + oListItem.get_item('Desc') +
            '</td><td>' + ISOFormatToNormalDate(oListItem.get_item('StartDate1')) +
            '</td><td>' + ISOFormatToNormalDate(oListItem.get_item('EndDate1')) +
            '</td><td>' + oListItem.get_item('Status') +
            '</td><td>' + (oListItem.get_item('Attachments') ? "<a id='linkAtt" + oListItem.get_item('ID') + "' target='_blank' href=''></a>" : "No attachment.") +
            '</td><td><button type="button" onclick="DeleteItem(' + oListItem.get_item('ID') + ')">Delete</button>';

        if (oListItem.get_item('Attachments'))
            GetAttachmentsByItemId(oListItem.get_item('ID'), "NeWList1", appUrl, onGetAttachmentSuccess, oListItem.get_item('ID'));

            
        if (oListItem.get_item('Status') == "Submitted")
        {
            listItemInfo = listItemInfo + '<button type="button" onclick="ApproveItem(' + oListItem.get_item('ID') + ')">Approve</button>';
            listItemInfo = listItemInfo + '<button type="button" onclick="RejectItem(' + oListItem.get_item('ID') + ')">Reject</button>';
        }
        else if (oListItem.get_item('Status') == "Draft")
        {
            listItemInfo += '<button type="button" onclick="SubmitItem(' + oListItem.get_item('ID') + ')">Submit</button>';
        }

        listItemInfo = listItemInfo + '</td></tr>';
    }

    $('#tblItemList').html(listItemInfo);

}

function onItemsLoadFailed(sender, args) {
    alert("Failed loading notes" + args.get_message()); 
}

function onGetAttachmentSuccess(data, id) {
    //console.log(JSON.stringify(data));
    var fileName = data.d.results[0].FileName;
    var relUrl = data.d.results[0].ServerRelativeUrl;
    $("#linkAtt" + id).append(fileName);
    $("#linkAtt" + id).attr('href', "https://" + appUrl.split('/')[2] + relUrl);
    if (fileName.indexOf('.doc') > -1 || fileName.indexOf('.xls') > -1 || fileName.indexOf('.ppt') > -1) 
    {
        $.ajax({
            url: hostUrl + "/_api/web/getfilebyserverrelativeurl('" + relUrl + "')",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (dat) {
                var sid = dat.d.LinkingUrl;
                $("#linkAtt" + id).attr("href", sid);
            },
            error: function (dat) {
                
            }
        });
    }
}


function SubmitItem(id)
{
    var listName = "NewList1";
    var itemType = GetItemTypeForListName(listName);

    var posturl = hostUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + id + ")";

    var item = {
        "Status": "New"
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

