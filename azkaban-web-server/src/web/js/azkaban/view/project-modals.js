/*
 * Copyright 2012 LinkedIn Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

$.namespace('azkaban');

var projectView;
azkaban.ProjectView = Backbone.View.extend({
    events: {
        "click #project-upload-btn": "handleUploadProjectJob",
        "click #project-delete-btn": "handleDeleteProject",
        "click #project-copy-btn": "handleCopyProject",
    },

    initialize: function (settings) {
    },

    handleUploadProjectJob: function (evt) {
        console.log("click upload project");
        $('#upload-project-modal').modal();
    },

    handleDeleteProject: function (evt) {
        console.log("click delete project");
        $('#delete-project-modal').modal();
    },

    handleCopyProject: function (evt) {
        console.log("click copy project");
        $('#copy-project-modal').modal();
        var requestURL = contextURL + "/index";
        var requestData = {
            "ajax": "fetchuserprojects"
        };

        var successHandler = function (data) {

            console.log("fetch projects, data: " + data)
            if (data.error) {
                showDialog("Error", data.error);
                return;
            }
            var projects = data.projects;
            var projectTableSection = $("#projectTable").find("tbody")[0];
            var selfProjectName = $('#project-copy-btn').attr("title");
            $(projectTableSection).empty();
            for (var i = 0; i < projects.length; ++i) {
                var projectInfo = projects[i];
                var projectName = projectInfo['projectName'];
                if (selfProjectName == projectName) {
                    continue;
                }
                if (!projectInfo['hasZipFile'] || projectInfo['hasZipFile'] == 'N') {
                    continue;
                }
                var createdBy = projectInfo['createdBy'];
                var createdTime = projectInfo['createdTime'];
                var containerProjectInfo = document.createElement("tr");
                $(containerProjectInfo).addClass("projectInfo");

                var containerProject = document.createElement("td");
                $(containerProject).addClass("project");
                $(containerProject).text(projectName);
                var containerTime = document.createElement("td");
                $(containerTime).addClass("time");
                $(containerTime).text(getDateFormat(new Date(createdTime)));
                var containerUser = document.createElement("td");
                $(containerUser).addClass("user");
                $(containerUser).text(createdBy);
                var containerCheck = document.createElement("td");
                var containerCheckbox = document.createElement("input");
                $(containerCheckbox).addClass("check")
                $(containerCheckbox).attr("type", "checkbox");
                $(containerCheck).append(containerCheckbox);

                $(containerProjectInfo).append(containerProject);
                $(containerProjectInfo).append(containerUser);
                $(containerProjectInfo).append(containerTime);
                $(containerProjectInfo).append(containerCheck);

                $(projectTableSection).append(containerProjectInfo);
            }

            $(projectTableSection).find('input[type=checkbox]').bind('click', function () {
                $(projectTableSection).find('input[type=checkbox]').not(this).attr("checked", false);
                var that = this;
                $('#copy-form').find('input[name=copyfrom]').empty();
                $('#copy-form').find('input[name=copyfrom]').val(
                    $(that).parent().parent().find('td[class=project]').text());
            });
        };

        $.get(requestURL, requestData, successHandler);
    },

    render: function () {
    }
});

var copyProjectView;
azkaban.CopyProjectView = Backbone.View.extend({
    events: {
        "click #copy-project-btn": "handleCopyProject"
    },

    initialize: function (settings) {
    },

    handleCopyProject: function (evt) {
        var variables = $("#project-variables-copy").val();
        $("#upload-project-variables-copy").empty();
        $("#upload-project-variables-copy").val(variables);
        $('#copy-form').submit();
        $("#project-variables-copy").empty();
    },

    render: function () {
    }

});

var uploadProjectView;
azkaban.UploadProjectView = Backbone.View.extend({
    events: {
        "click #upload-project-btn": "handleCreateProject"
    },

    initialize: function (settings) {
        console.log("Hide upload project modal error msg");
        $("#upload-project-modal-error-msg").hide();
    },

    handleCreateProject: function (evt) {
        console.log("Upload project button.");
        $("#upload-project-variables-new").empty();
        $("#upload-project-variables-new").val($("#project-variables-new").val());
        $("#upload-project-form").submit();
        $("#project-variables-new").empty();
    },

    render: function () {
    }
});

var deleteProjectView;
azkaban.DeleteProjectView = Backbone.View.extend({
    events: {
        "click #delete-btn": "handleDeleteProject"
    },

    initialize: function (settings) {
    },

    handleDeleteProject: function (evt) {
        $("#delete-form").submit();
    },

    render: function () {
    }
});

var projectDescription;
azkaban.ProjectDescriptionView = Backbone.View.extend({
    events: {
        "click #project-description": "handleDescriptionEdit",
        "click #project-description-btn": "handleDescriptionSave"
    },

    initialize: function (settings) {
        console.log("project description initialize");
    },

    handleDescriptionEdit: function (evt) {
        console.log("Edit description");
        var description = null;
        if ($('#project-description').hasClass('editable-placeholder')) {
            description = '';
            $('#project-description').removeClass('editable-placeholder');
        }
        else {
            description = $('#project-description').text();
        }
        $('#project-description-edit').attr("value", description);
        $('#project-description').hide();
        $('#project-description-form').show();
    },

    handleDescriptionSave: function (evt) {
        var newText = $('#project-description-edit').val();
        if ($('#project-description-edit').hasClass('has-error')) {
            $('#project-description-edit').removeClass('has-error');
        }
        var requestURL = contextURL + "/manager";
        var requestData = {
            "project": projectName,
            "ajax": "changeDescription",
            "description": newText
        };
        var successHandler = function (data) {
            if (data.error) {
                $('#project-description-edit').addClass('has-error');
                alert(data.error);
                return;
            }
            $('#project-description-form').hide();
            if (newText != '') {
                $('#project-description').text(newText);
            }
            else {
                $('#project-description').text('Add project description.');
                $('#project-description').addClass('editable-placeholder');
            }
            $('#project-description').show();
        };
        $.get(requestURL, requestData, successHandler, "json");
    },

    render: function () {
    }
});

$(function () {
    projectView = new azkaban.ProjectView({
        el: $('#project-options')
    });
    uploadView = new azkaban.UploadProjectView({
        el: $('#upload-project-modal')
    });
    copyProjectView = new azkaban.CopyProjectView({
        el: $('#copy-project-modal')
    });
    deleteProjectView = new azkaban.DeleteProjectView({
        el: $('#delete-project-modal')
    });
    projectDescription = new azkaban.ProjectDescriptionView({
        el: $('#project-sidebar')
    });
});
