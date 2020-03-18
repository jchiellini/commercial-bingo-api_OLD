var azure = require('azure-storage');
// const { BlobServiceClient } = require('@azure/storage-blob');
var uuid = require('node-uuid');
var async = require('async');

var AzureBlobAdapter = require('../util/azure-blob-adapter');

var entityGen = azure.TableUtilities.entityGenerator;
var options = { payloadFormat: "application/json;odata=nometadata" };

function Sponsor(storageClient, connectionstring, tableName, partitionKey, accountName, accountKey, blobName) {
    this.storageClient = storageClient;
    this.connectionstring = connectionstring;
    this.accountName = accountName;
    this.accountKey = accountKey;
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.blobName = blobName;

    this.storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
        if(error) {
            throw error;
        }
    });
}

Sponsor.prototype = {
    find: function(query, callback) {
        self = this;
        self.storageClient.queryEntities(this.tableName, query, null, options, function entitiesQueried(error, result, response) {
            if(error) {
                callback(error);
            } else {
                callback(null, response.body.value);
            }
        });
    },

    addItem: function(file, fields, callback) {
        self = this;

        async.waterfall([
            function(callback) {
            // callback(null, {
            //     logo: '1',
            //     logoFileName: '2'
            // });

                // const blobServiceClient = await BlobServiceClient.fromConnectionString(self.connectionstring);
                // const containerClient = await blobServiceClient.getContainerClient(self.accountName);
                // const blockBlobClient = containerClient.getBlockBlobClient(self.blobName);
                //
                // const uploadBlobResponse = await blockBlobClient.uploadFile(file.path);
                // callback(null, uploadBlobResponse);

                // const blobServiceClient = await BlobServiceClient.fromConnectionString(self.connectionstring);
                var blobService = new AzureBlobAdapter(azure.createBlobService(self.accountName, self.accountKey), self.accountName, self.blobName);
                blobService.upload(file.name, file.path, callback);
            },
        ], function (error, result) {
            if (error) { callback(error); }

            var id = uuid();
            var itemDescriptor = {
                PartitionKey: entityGen.String(self.partitionKey),
                RowKey: entityGen.String(id),
                sponsorName: entityGen.String(fields.sponsorName),
                logo: entityGen.String(result.logo),
                logoFileName: entityGen.String(result.logoFileName),
                enabled: entityGen.Boolean(fields.enabled)
            };

            self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
                if(error){
                    callback(error, null);
                }
                callback(null, {
                    PartitionKey: self.partitionKey,
                    RowKey: id,
                    ...fields,
                    ...result
                });
            });
        });
    },

    removeItem: function(id, callback) {
        self = this;

        self.storageClient.retrieveEntity(self.tableName, self.partitionKey, id, function entityQueried(error, entity) {
            self.storageClient.deleteEntity(self.tableName, entity, function entityRemoved(error) {
                if(error){
                    callback(error, null);
                }
                callback(null, id);
            });
        });
    },

    updateItem: function(updateItem, callback) {
        self = this;
        self.storageClient.retrieveEntity(self.tableName, self.partitionKey, updateItem.RowKey, function entityQueried(error, entity) {
            if(error) {
                callback(error);
            }
            entity.sponsorName._ = updateItem.sponsorName;
            entity.enabled._ = updateItem.enabled;
            self.storageClient.insertOrReplaceEntity(self.tableName, entity, function entityUpdated(error) {
                if(error) {
                    callback(error);
                }
                callback(null, entity);
            });
        });
    }
};

module.exports = Sponsor;
