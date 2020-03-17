var azure = require('azure-storage');
var express = require('express');

var nconf = require('nconf');
var SponsorList = require('../controllers/sponsor-list.controller');
var Sponsor = require('../models/sponsor.model');

var router = express.Router();

nconf.env()
    .file({ file: 'config.json', search: true });
var tableName = nconf.get("TABLE_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
var accountKey2 = nconf.get("STORAGE_KEY2");
var blobName = nconf.get("BLOB_NAME");
var connectionstring = nconf.get("CONNECTION_STRING");

var tableStoreClient = azure.createTableService(accountName, accountKey);

// console.log('blobStoreClient', blobStoreClient);
console.log('tableStoreClient', tableStoreClient);

var sponsor = new Sponsor(tableStoreClient, connectionstring, tableName, partitionKey, accountName, accountKey2, blobName);
var sponsorList = new SponsorList(sponsor);

/* GET users listing. */
router.get('/', sponsorList.getAllSponsors.bind(sponsorList));
router.post('/', sponsorList.addSponsor.bind(sponsorList));
router.put('/', sponsorList.updateSponsor.bind(sponsorList));
router.delete('/:id', sponsorList.deleteSponsor.bind(sponsorList));

module.exports = router;
