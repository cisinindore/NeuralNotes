define([
    'auth-service',
    'spinner/site-global-loading-bar'
], function(
    authService,
    siteGlobalLoadingBar
) {

    var client;

    var spinner = siteGlobalLoadingBar.create('google-drive-api');

    var self = {
        loadDriveApi: loadDriveApi,
        client: client,
        findByName: findByName,
        updateFile: updateFile
    };

    return self;

    /**
     * Load Drive API client library.
     */
    function loadDriveApi() {
        console.debug('googleDriveApi.loadDriveApi()');
        var promise = new Promise(function(resolve, reject) {
              //gapi.client.load('drive', 'v3', function() {
              gapi.client.load('drive', 'v3').then(function() {
                  self.client = gapi.client.drive;
                  console.debug('loadDriveApi(): load API success');
                  console.debug('loadDriveApi(): googleDriveApi.client.files: ', self.client.files);
                  resolve();
              }, function onError(error) {
                  //TODO: show user a notification that drive API failed.
                  throw error;
              });
        });

        return promise;
    }

    /**
     * Find a file on google drive by name.
     */
    function findByName(options) {
        var query;

        if (options.name) {
            query = 'name = "' + options.name + '"';
        } else {
            throw new Error('googleDriveApi.findByName: no filename passed!');
        }

        var request;

        if (options.folderId) {
            query += ' and "' + options.folderId + '" in parents';
        }

        query += ' and trashed = false';

        var params = {
            'pageSize': 10,
            'fields': "nextPageToken, files(id, name, mimeType, parents)",
            'q': query
        };

        request = gapi.client.drive.files.list(params);

        //TODO: allow search inside of a specified folder?

        //if (options.folderId) {
        //    request = gapi.client.request({
        //        path: '/drive/v3/files/' + options.folderId + '/list',
        //        method: 'GET',
        //        params: {
        //          'pageSize': 10,
        //          'fields': "nextPageToken, files(id, name)",
        //          'q': query
        //        }
        //    });
        //} else {


        //}

        spinner.show();
        var promise = new Promise(function(resolve, reject) {
              request.execute(function(resp) {
                console.debug('googleDriveApi.findByname(): us params: ', params);
                console.debug('googleDriveApi.findByname(): Files found by query "' + query + '": ', resp);

                //TODO: same code is duplicated in thought-storage.js - Refactor!
                resp.files.forEach(function(file) {
                    if (file.parents.length > 1) {
                        throw new Error('Files shouldn\'t have more than one parent. File with more than one parent: ', file);
                    }
                    file.parent = { id: file.parents[0] };
                });
                
                resolve(resp.files);
                spinner.hide();
              });
        });
  
        return promise;
    }

    function updateFile(options) {
         var request = gapi.client.request({
            'path': '/upload/drive/v2/files/' + options.fileId,
            'method': 'PUT',
            'params': {'uploadType': 'media'},
            'headers': {
              'Content-Type': 'text/plain'
            },
            'body': options.text 
        });

        var promise = new Promise(function(resolve, reject) {
            request.execute(function(response) {
                resolve(response);
            });
        });

        return promise;
    }

});
