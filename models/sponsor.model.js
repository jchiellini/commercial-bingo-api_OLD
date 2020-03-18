var azure = require('azure-storage');
var uuid = require('node-uuid');

var entityGen = azure.TableUtilities.entityGenerator;
var options = { payloadFormat: "application/json;odata=nometadata" };

function Sponsor(storageClient, tableName, partitionKey) {
    this.storageClient = storageClient;
    this.tableName = tableName;
    this.partitionKey = partitionKey;

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

    addItem: function(item, callback) {
        self = this;

        var id = uuid();
        var itemDescriptor = {
            PartitionKey: entityGen.String(self.partitionKey),
            RowKey: entityGen.String(id),
            sponsorName: entityGen.String(item.sponsorName),
            logo: entityGen.String(item.logo),
            logoFileName: entityGen.String(item.logoFileName),
            enabled: entityGen.Boolean(item.enabled)
        };

        self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
            if(error){
                callback(error, null);
            }
            callback(null, {
                PartitionKey: self.partitionKey,
                RowKey: id,
                ...item
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
