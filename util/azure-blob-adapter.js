var nconf = require('nconf');
const {
    Aborter,
    BlobURL,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    StorageURL,
    SharedKeyCredential,
    uploadStreamToBlockBlob
} = require('@azure/storage-blob');

nconf.env()
    .file({ file: 'config.json', search: true });

function AzureBlobAdapter(blobStorageClient, accountName, blobName) {
    this.blobStorageClient = blobStorageClient;
    this.accountName = accountName;
    this.blobName = blobName;

    this.blobStorageClient.createContainerIfNotExists(accountName, {
        publicAccessLevel: 'blob'
    }, function(error, result, response) {
        if (error) {
            throw error;
        }
    });
}

AzureBlobAdapter.prototype = {
    upload: async function (logoFileName, filePath, callback) {
        self = this;

        self.blobStorageClient.createBlockBlobFromLocalFile(self.blobName, logoFileName, filePath, function(error, result, response) {
            if (error) {
                callback(error);
            }
            console.log('response', response);
            const logo = `https://${self.accountName}.blob.core.windows.net/${self.blobName}/${logoFileName}`;
            callback(null, {
                logo,
                logoFileName
            });
        });
    }
};

module.exports = AzureBlobAdapter;



