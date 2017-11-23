<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script> 
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="../Scripts/SPGenericAppFunctions.js"></script>
    <script type="text/javascript" src="/_layouts/15/clienttemplates.js"></script>
    <script type="text/javascript" src="/_layouts/15/clientforms.js"></script>
    <script type="text/javascript" src="/_layouts/15/clientpeoplepicker.js"></script>
    <script type="text/javascript" src="/_layouts/15/autofill.js"></script>
    <script type="text/javascript" src="/_layouts/15/datepicker.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Create New Record
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <b>
        <asp:Label ClientIDMode="Static" ID="UsernameLabel" runat="server" Text="gooodboy"></asp:Label></b><br /><br />
    <b>Add New Item:</b><br />
   <table class="responstable" border="1">
       <tr><td>UserName</td><td><div id="PeoplePickerDiv"></div></td></tr>
       <tr><td>Title:</td><td><input id="txtTitle" type="text" /></td></tr>
       <tr><td>Description:</td><td><textarea id="txtDescription" cols="20" rows="2"></textarea></td></tr>
       <tr><td>    Status:</td><td><select id="sltStatus">
        <option value="Draft">Draft</option>
        <option value="New">New</option>
           </select></td></tr>
       <tr><td>Start Date (mm/dd/yyyy):</td><td><input id="txtStartDate" type="text" class="DT" onchange="OnDatePicked()"/></td></tr>
       <tr><td>End Date (mm/dd/yyyy):</td><td><input id="txtEndDate" type="text" class="DT" onchange="OnDatePicked()" /></td></tr>
       <tr><td>Upload Attachments:</td><td><input type="file" id="getFile"/></td></tr>
        <tr><td><button class="btn" type="submit" onclick="javascript: return CreateRecord();">Submit</button></td><td></td></tr>
    
      </table>

    <br /><br />
    <b>List:</b>&nbsp;<button class="btn" id="RefreshButton" type="button" onclick="LoadRecords();">Refresh</button><br />
    <table class="responstable" border="1" id="tblItemList"></table>
   
    <div>
       <button class="btn" type="button" onclick="javascript: window.location = document.URL.replace('Default.aspx','LandingPage.aspx');">Return</button>
    </div>
</asp:Content>
