﻿//
// namespace : HG.Configure.Groups namespace
// info      : -
//
HG.Configure.Groups = HG.Configure.Groups || new function(){ var $$ = this;

    $$.ModulesList = function (groupname, callback) {
        $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.ModulesList/' + groupname + '/', function (data) {
            callback(data);
        });
    };

    $$.List = function (context, callback) {
        $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.List/' + context + '/', function (data) {
            if (context == 'Automation') {
                HG.WebApp.Data.AutomationGroups = data;
            }
            else {
                HG.WebApp.Data.Groups = data;
            }
            callback();
        });
    };

    $$.Sort = function (context, sortorder, callback) {
        $.ajax({
            type: 'POST',
            url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Sort/' + context + '/',
            data: sortorder,
            success: function (response) {
                callback(response);
            },
            error: function (a, b, c) {
                alert('A problem ocurred');
            }
        });
    };

    $$.SortModules = function (context, groupname, sortorder, callback) {
        $.ajax({
            type: 'POST',
            url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.SortModules/' + context + '/' + groupname + '/',
            data: sortorder,
            success: function (response) {
                callback(response);
            },
            error: function (a, b, c) {
                alert('A problem ocurred');
            }
        });
    };

    $$.RenameGroup = function (context, oldname, newname, callback) {
        $.ajax({
            type: 'POST',
            url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Rename/' + context + '/' + oldname + '/',
            data: newname,
            success: function (response) {
                callback(response);
            },
            error: function (a, b, c) {
                alert('Error.\nThere is aready a group with this name.');
            }
        });
    };

    $$.AddGroup = function (context, group, callback) {
        $.ajax({
            type: 'POST',
            url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Add/' + context + '/',
            data: group,
            success: function (response) {
                callback();
            },
            error: function (a, b, c) {
                alert('A problem ocurred');
            }
        });
    };

    $$.DeleteGroup = function (context, group, callback) {
        $.ajax({
            type: 'POST',
            url: '/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.Delete/' + context + '/',
            data: group,
            success: function (response) {
                callback();
            },
            error: function (a, b, c) {
                alert('A problem ocurred');
            }
        });
    };

    $$.GetGroupModules = function (groupname) {
        var groupmodules = { 'Index': 0, 'Name': groupname, 'Modules': Array() };
        var group = $$.GetGroupByName(groupname);
        groupmodules.Index = group.Index;
        for (var c = 0; c < group.Modules.length; c++) {
            var found = false;
            //
            for (var m = 0; m < HG.WebApp.Data.Modules.length; m++) {
                if (HG.WebApp.Data.Modules[m].Domain == group.Modules[c].Domain && HG.WebApp.Data.Modules[m].Address == group.Modules[c].Address) {
                    groupmodules.Modules.push(HG.WebApp.Data.Modules[m]);
                    found = true;
                    break;
                }
            }
            //
            if (!found) {
                // orphan module/program, it is not present in the modules list nor programs one
                groupmodules.Modules.push(group.Modules[c]);
            }
        }
        return groupmodules;
    };

    $$.GetGroupByName = function(name) {
        var group = null;
        for (var i = 0; i < HG.WebApp.Data.Groups.length; i++) {
            if (HG.WebApp.Data.Groups[i].Name == name) {
                group = HG.WebApp.Data.Groups[i];
                group.Index = i;
                break;
            }
        }
        return group;
    };

    $$.WallpaperList = function (callback) {
        $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.WallpaperList/', function (data) {
            HG.WebApp.Data.Wallpapers = eval(arguments[2].responseText);
            callback(HG.WebApp.Data.Wallpapers);
        });
    };

    $$.WallpaperSet = function (group, wallpaper, callback) {
        $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.WallpaperSet/' + encodeURIComponent(group) + '/' + encodeURIComponent(wallpaper) + '/', function (data) {
            callback();
        });    
    };

    $$.WallpaperDelete = function (wallpaper, callback) {
        $.get('/' + HG.WebApp.Data.ServiceKey + '/' + HG.WebApp.Data.ServiceDomain + '/Config/Groups.WallpaperDelete/' + encodeURIComponent(wallpaper) + '/', function (data) {
            callback();
        });    
    };

};